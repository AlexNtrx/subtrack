<?php
// ==========================================================================
// API: HAE KAIKKI TILAUKSET (GET Subscriptions)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../functions/db.php';

try {
    // Haetaan kaikki tilaukset järjestettynä seuraavan eräpäivän mukaan
    $stmt = $pdo->query("SELECT id, palvelun_nimi, hinta, laskutusjakso, seuraava_era, maksutapa, kategoria, tila FROM subscriptions ORDER BY seuraava_era ASC");
    $subscriptions = $stmt->fetchAll();

    // Varmistetaan, että hinta on numeerisessa muodossa
    foreach ($subscriptions as &$sub) {
        $sub['hinta'] = (float)$sub['hinta'];
        $sub['id'] = (string)$sub['id']; // Pidetään ID merkkijonona yhteensopivuuden vuoksi
    }

    echo json_encode([
        'success' => true,
        'data' => $subscriptions
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Virhe tilauksia haettaessa: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
