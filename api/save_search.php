<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

// Este endpoint solo acepta POST porque modifica el estado guardando una búsqueda.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'error' => 'Método no permitido.'], 405);
}

// JavaScript envía JSON, así que leemos el cuerpo bruto de la petición y lo decodificamos.
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput ?: '{}', true);

if (!is_array($payload)) {
    sendJson(['success' => false, 'error' => 'Datos inválidos.'], 400);
}

// Normalizamos y validamos el término antes de tocar la base de datos.
$term = trim((string)($payload['term'] ?? ''));
$termLength = function_exists('mb_strlen') ? mb_strlen($term, 'UTF-8') : strlen($term);

if ($termLength < 2) {
    sendJson(['success' => false, 'error' => 'El término debe tener al menos dos caracteres.'], 422);
}

if ($termLength > 255) {
    sendJson(['success' => false, 'error' => 'El término es demasiado largo.'], 422);
}

try {
    $pdo = getDatabaseConnection();

    // Consulta preparada: el valor real se envía aparte mediante :term.
    // Esto evita SQL injection porque el usuario no puede alterar la estructura SQL.
    $statement = $pdo->prepare('INSERT INTO searches (term) VALUES (:term)');
    $statement->execute(['term' => $term]);

    sendJson(['success' => true]);
} catch (Throwable $exception) {
    // No exponemos detalles internos del error para no filtrar información sensible.
    sendJson(['success' => false, 'error' => 'No se pudo guardar la búsqueda.'], 500);
}
