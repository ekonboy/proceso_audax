<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'error' => 'Método no permitido.'], 405);
}

try {
    $pdo = getDatabaseConnection();

    // Consulta mínima para comprobar que PDO y SQLite responden correctamente.
    $statement = $pdo->prepare('SELECT COUNT(*) AS total FROM searches');
    $statement->execute();
    $row = $statement->fetch();

    sendJson([
        'success' => true,
        'status' => 'ok',
        'database' => 'sqlite',
        'pdo_sqlite' => extension_loaded('pdo_sqlite'),
        'total_searches' => (int)($row['total'] ?? 0),
        'checked_at' => gmdate('c'),
    ]);
} catch (Throwable $exception) {
    sendJson([
        'success' => false,
        'status' => 'error',
        'error' => 'El sistema no está disponible.',
    ], 500);
}
