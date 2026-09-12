<?php
// ==========================================================================
// API: POISTA TILAUS (DELETE / POST Delete Subscription)
// ==========================================================================

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../functions/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Vain POST- ja DELETE-pyynnöt ovat sallittuja.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$id = intval($input['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Virheellinen tai puuttuva ID.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = :id");
    $stmt->execute([':id' => $id]);

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
