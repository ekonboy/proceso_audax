<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

// DELETE expresa mejor la intención HTTP: borrar el recurso "historial".
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJson(['success' => false, 'error' => 'Método no permitido.'], 405);
}

try {
    $pdo = getDatabaseConnection();

    // Aunque no recibe datos del usuario, mantenemos prepare/execute por consistencia
    // con el resto de operaciones SQL del proyecto.
    $statement = $pdo->prepare('DELETE FROM searches');
    $statement->execute();

    sendJson(['success' => true]);
} catch (Throwable $exception) {
    sendJson(['success' => false, 'error' => 'No se pudo limpiar el historial.'], 500);
}
