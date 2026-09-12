<?php
// ==========================================================================
// API: VAIHDA TILAUKSEN TILA (Toggle Status - Aktiivinen / Tauolla)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

// Varmistetaan, että pyyntö on POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Luetaan ID saapuvasta JSON-rungosta
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = intval($input['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Virheellinen ID.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Tarkistetaan löytyykö tilaus
    $checkStmt = $pdo->prepare("SELECT tila FROM subscriptions WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $currentStatus = $checkStmt->fetchColumn();

    if ($currentStatus === false) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Tilausta ei löytynyt annetulla ID:llä.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Vaihdetaan tila vastakkaiseksi (Aktiivinen <-> Tauolla)
    $newStatus = ($currentStatus === 'Aktiivinen') ? 'Tauolla' : 'Aktiivinen';
    $updateStmt = $pdo->prepare("UPDATE subscriptions SET tila = :tila WHERE id = :id");
    $updateStmt->execute([':tila' => $newStatus, ':id' => $id]);

    // Palautetaan vastaus
    echo json_encode([
        'success'    => true,
        'message'    => 'Tilauksen tila päivitetty!',
        'new_status' => $newStatus
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log('Database error in toggle_status: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe tilan vaihdossa.'
    ], JSON_UNESCAPED_UNICODE);
}
