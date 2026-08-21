<?php

//  Asetetaan vastauksen sisältötyypiksi JSON
header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

//  Varmistetaan, että pyyntö on POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

//  Luetaan ID saapuvasta JSON-rungosta
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
    //  Vaihdetaan tila vastakkaiseksi (Aktiivinen <-> Tauolla)
    $stmt = $pdo->prepare("UPDATE subscriptions SET tila = IF(tila = 'Aktiivinen', 'Tauolla', 'Aktiivinen') WHERE id = :id");
    $stmt->execute([':id' => $id]);

    //  Haetaan uusi päivitetty tila
    $checkStmt = $pdo->prepare("SELECT tila FROM subscriptions WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $newStatus = $checkStmt->fetchColumn();

    //  Palautetaan vastaus
    echo json_encode([
        'success'    => true,
        'message'    => 'Tilauksen tila päivitetty!',
        'new_status' => $newStatus
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe tilan vaihdossa: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
