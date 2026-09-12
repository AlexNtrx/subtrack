<?php
// ==========================================================================
// API: PÄIVITÄ TILAUS (PUT/POST Update Subscription)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

// Varmistetaan sallitut HTTP-metodit (POST ja PUT)
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST- ja PUT-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Luetaan saapuva JSON-runko
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Sallitut arvot (ENUM Whitelist)
$allowedCycles = ['Kuukausittain', 'Vuosittain'];
$allowedCategories = ['Suoratoisto', 'Työkalut', 'Vapaa-aika', 'Muut'];
$allowedStatuses = ['Aktiivinen', 'Tauolla'];

$id = intval($input['id'] ?? 0);
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

if ($id <= 0 || empty($palvelun_nimi) || !$isValidDate || $hinta < 0) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'message' => 'Virheelliset tiedot: ID, palvelun nimi, kelvollinen eräpäivä (VVVV-KK-PP) ja positiivinen hinta ovat pakollisia.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Tarkistetaan löytyykö tilaus
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    if ($checkStmt->fetchColumn() == 0) {
        http_response_code(404); // Not Found
        echo json_encode([
            'success' => false,
            'message' => 'Tilausta ei löytynyt annetulla ID:llä.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Päivitetään tiedot tietokantaan UPDATE-lauseella
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

    // Palautetaan onnistumisviesti
    echo json_encode([
        'success' => true,
        'message' => 'Tilaus päivitetty onnistuneesti!'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log('Database error in update_subscription: ' . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe päivityksessä.'
    ], JSON_UNESCAPED_UNICODE);
}
