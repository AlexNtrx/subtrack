<?php


//  Kerrotaan selaimelle, että vastaus on JSON-muodossa
header('Content-Type: application/json; charset=utf-8');

// Otetaan tietokantayhteys käyttöön ($pdo)
require_once __DIR__ . '/../functions/db.php';

try {
    //  Haetaan kaikki tilaukset tietokannasta järjestettynä seuraavan eräpäivän mukaan
    $sql = "SELECT id, palvelun_nimi, hinta, laskutusjakso, seuraava_era, maksutapa, kategoria, tila 
            FROM subscriptions 
            ORDER BY seuraava_era ASC";
    
    $stmt = $pdo->query($sql);
    $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Muunnetaan hinta numeroksi ja id merkkijonoksi
    foreach ($subscriptions as &$sub) {
        $sub['hinta'] = (float)$sub['hinta'];
        $sub['id'] = (string)$sub['id'];
    }

    //  Palautetaan data onnistuneesti JSON-muodossa
    echo json_encode([
        'success' => true,
        'data' => $subscriptions
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Jos tapahtuu virhe, palautetaan HTTP-tilakoodi 500 ja virheilmoitus
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
