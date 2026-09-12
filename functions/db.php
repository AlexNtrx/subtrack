<?php
// Tietokanta-asetukset
$db_host = 'localhost';
$db_name = 'subtracker_db';
$db_user = 'root';
$db_pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Virheet heitetään poikkeuksina
    PDO::ATTR_DEFAULTFETCH_MODE => PDO::FETCH_ASSOC,       // Palauttaa tulokset assosiatiivisena taulukkona
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Aito SQL-injektiosuojaus (Prepared Statements)
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    error_log('Database connection error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=utf-8', true, 500);
    echo json_encode([
        'success' => false,
        'message' => 'Tietokantayhteyden muodostus epäonnistui. Tarkista palvelimen asetukset.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}