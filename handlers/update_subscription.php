<?php
// ==========================================================================
// API: PÄIVITÄ TILAUS (PUT/POST Update Subscription)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../functions/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Vain POST- ja PUT-pyynnöt ovat sallittuja.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = intval($input['id'] ?? 0);
$palvelun_nimi = trim($input['palvelun_nimi'] ?? '');
$hinta = floatval($input['hinta'] ?? 0);
$laskutusjakso = trim($input['laskutusjakso'] ?? 'Kuukausittain');
$seuraava_era = trim($input['seuraava_era'] ?? '');
$maksutapa = trim($input['maksutapa'] ?? 'Maksukortti');
$kategoria = trim($input['kategoria'] ?? 'Muut');
$tila = trim($input['tila'] ?? 'Aktiivinen');

if ($id <= 0 || empty($palvelun_nimi) || empty($seuraava_era) || $hinta < 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Virheelliset tiedot muokkauksessa.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "UPDATE subscriptions 
            SET palvelun_nimi = :palvelun_nimi, 
                hinta = :hinta, 
                laskutusjakso = :laskutusjakso, 
                seuraava_era = :seuraava_era, 
                maksutapa = :maksutapa, 
                kategoria = :kategoria, 
                tila = :tila 
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id'            => $id,
        ':palvelun_nimi' => $palvelun_nimi,
        ':hinta'         => $hinta,
        ':laskutusjakso' => $laskutusjakso,
        ':seuraava_era'  => $seuraava_era,
        ':maksutapa'     => $maksutapa,
        ':kategoria'     => $kategoria,
        ':tila'          => $tila
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Tilaus päivitetty onnistuneesti!'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe päivityksessä: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
