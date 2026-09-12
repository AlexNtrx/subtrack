<?php
// ==========================================================================
// API: LISÄÄ UUSI TILAUS (POST Add Subscription)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

// Varmistetaan, että pyyntö on POST-metodi
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Luetaan saapuva JSON-runko (Request Body)
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Jos data lähetettiin perinteisenä lomakedatana ($_POST)
    $input = $_POST;
}

// Sallitut arvot (ENUM Whitelist)
$allowedCycles = ['Kuukausittain', 'Vuosittain'];
$allowedCategories = ['Suoratoisto', 'Työkalut', 'Vapaa-aika', 'Muut'];
$allowedStatuses = ['Aktiivinen', 'Tauolla'];

// Validoidaan ja normalisoidaan kentät
$palvelun_nimi = trim($input['palvelun_nimi'] ?? '');
$hinta = floatval($input['hinta'] ?? 0);
$laskutusjakso = in_array($input['laskutusjakso'] ?? '', $allowedCycles, true) ? $input['laskutusjakso'] : 'Kuukausittain';
$seuraava_era = trim($input['seuraava_era'] ?? '');
$maksutapa = !empty(trim($input['maksutapa'] ?? '')) ? trim($input['maksutapa']) : 'Maksukortti';
$kategoria = in_array($input['kategoria'] ?? '', $allowedCategories, true) ? $input['kategoria'] : 'Muut';
$tila = in_array($input['tila'] ?? '', $allowedStatuses, true) ? $input['tila'] : 'Aktiivinen';

// Tarkistetaan päivämäärän muoto (YYYY-MM-DD)
$dateObj = DateTime::createFromFormat('Y-m-d', $seuraava_era);
$isValidDate = $dateObj && $dateObj->format('Y-m-d') === $seuraava_era;

if (empty($palvelun_nimi) || !$isValidDate || $hinta < 0) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Virheelliset tiedot: Palvelun nimi, kelvollinen eräpäivä (VVVV-KK-PP) ja positiivinen hinta ovat pakollisia.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Lisätään uusi tilaus tietokantaan Prepared Statementilla (SQL-injektiosuojaus)
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

    // Palautetaan onnistumisviesti ja uusi ID
    echo json_encode([
        'success' => true,
        'message' => 'Tilaus lisätty onnistuneesti!',
        'id'      => (string)$newId
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log('Database error in add_subscription: ' . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe lisäyksessä.'
    ], JSON_UNESCAPED_UNICODE);
}
