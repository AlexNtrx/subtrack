<?php

//  Asetetaan vastauksen sisältötyypiksi JSON
header('Content-Type: application/json; charset=utf-8');

//  Otetaan tietokantayhteys käyttöön
require_once __DIR__ . '/../functions/db.php';

//  Varmistetaan sallitut HTTP-metodit (POST ja DELETE)
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Vain POST- ja DELETE-pyynnöt ovat sallittuja.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

//  Luetaan saapuva JSON-runko
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = intval($input['id'] ?? 0);

//  Validointi: ID oltava positiivinen kokonaisluku
if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Virheellinen tai puuttuva tilaus-ID.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    //  Poistetaan tilaus tietokannasta
    $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = :id");
    $stmt->execute([':id' => $id]);

    //  Palautetaan onnistumisviesti
    echo json_encode([
        'success' => true,
        'message' => 'Tilaus poistettu onnistuneesti!'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantavirhe poistettaessa: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
