<?php
header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

//  Varmistetaan, että pyyntö on POST-metodi
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

//  Luetaan saapuva JSON-runko (Request Body)
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Jos data lähetettiin perinteisenä lomakedatana ($_POST)
    $input = $_POST;
}

//  Poimitaan ja siistitään syötekentät
$palvelun_nimi = trim($input['palvelun_nimi'] ?? '');
$hinta         = floatval($input['hinta'] ?? 0);
$laskutusjakso = trim($input['laskutusjakso'] ?? 'Kuukausittain');
$seuraava_era  = trim($input['seuraava_era'] ?? '');
$maksutapa     = trim($input['maksutapa'] ?? 'Maksukortti');
$kategoria     = trim($input['kategoria'] ?? 'Muut');
$tila          = trim($input['tila'] ?? 'Aktiivinen');

//  Validointi: pakolliset kentät
if (empty($palvelun_nimi) || empty($seuraava_era) || $hinta < 0) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Virheelliset tiedot: Palvelun nimi, hinta ja eräpäivä ovat pakollisia.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    //  Lisätään uusi tilaus tietokantaan Prepared Statementilla (SQL-injektiosuojaus)
    $sql = "INSERT INTO subscriptions (palvelun_nimi, hinta, laskutusjakso, seuraava_era, maksutapa, kategoria, tila) 
            VALUES (:palvelun_nimi, :hinta, :laskutusjakso, :seuraava_era, :maksutapa, :kategoria, :tila)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':palvelun_nimi' => $palvelun_nimi,
        ':hinta'         => $hinta,
        ':laskutusjakso' => $laskutusjakso,
        ':seuraava_era'  => $seuraava_era,
        ':maksutapa'     => $maksutapa,
        ':kategoria'     => $kategoria,
        ':tila'          => $tila
    ]);

    // Haetaan juuri luodun rivin ID
    $newId = $pdo->lastInsertId();

    //  Palautetaan onnistumisviesti ja uusi ID
    echo json_encode([
        'success' => true,
        'message' => 'Tilaus lisätty onnistuneesti!',
        'id'      => (string)$newId
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {  // Käsitellään tietokantavirheet
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe lisäyksessä: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
