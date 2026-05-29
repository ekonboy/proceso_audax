<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

// Este endpoint solo lee datos, por eso se limita a GET.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'error' => 'Método no permitido.'], 405);
}

try {
    $pdo = getDatabaseConnection();

    // También usamos consulta preparada en lecturas con parámetros.
    // Aunque LIMIT sea un número fijo, bindValue deja claro el tipo esperado.
    $statement = $pdo->prepare(
        'SELECT term, created_at
         FROM searches
         ORDER BY id DESC
         LIMIT :limit'
    );
    $statement->bindValue(':limit', 10, PDO::PARAM_INT);
    $statement->execute();

    sendJson([
        'success' => true,
        'items' => $statement->fetchAll(),
    ]);
} catch (Throwable $exception) {
    // Respuesta genérica: suficiente para el frontend, sin revelar rutas ni trazas.
    sendJson(['success' => false, 'error' => 'No se pudo leer el historial.'], 500);
}
