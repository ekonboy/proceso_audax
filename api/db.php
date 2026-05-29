<?php
declare(strict_types=1);

// Centralizamos la conexión para no repetir configuración en cada endpoint.
function getDatabaseConnection(): PDO
{
    $dataDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';

    // SQLite guarda la base de datos en un archivo; por eso aseguramos que exista la carpeta.
    // He preferido sqlite para evitar complicaciones de configuración en local sin soporte para MySQL/PostgreSQL ademas de tener todo el proyecto en un solo repositorio sin necesidad de configurar una base de datos externa.
    if (!is_dir($dataDirectory)) {
        mkdir($dataDirectory, 0775, true);
    }

    $databasePath = $dataDirectory . DIRECTORY_SEPARATOR . 'search_history.sqlite';

    // PDO permite trabajar con bases de datos de forma uniforme y segura.
    // Aquí usamos SQLite porque el proyecto es pequeño, no requiere servidor de BD
    // y se puede subir/probar fácilmente en local.
    $pdo = new PDO('sqlite:' . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Esta consulta crea la tabla si no existe. No usa datos del usuario,
    // así que no necesita ser preparada.
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            term TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );

    return $pdo;
}

// Todas las respuestas de la API salen como JSON UTF-8 para mantener acentos
// y caracteres españoles correctamente codificados.
function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
