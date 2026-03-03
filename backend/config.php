<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'canteen_pos');

// Create connection
function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

// CORS headers 
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Get JSON body
function getJsonBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// Send JSON response
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Simple token auth (session-based via token)
function generateToken($userId) {
    return base64_encode($userId . ':' . time() . ':' . bin2hex(random_bytes(16)));
}

function getUserIdFromToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    $token = substr($authHeader, 7);
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    return $parts[0] ?? null;
}

function requireAuth() {
    $userId = getUserIdFromToken();
    if (!$userId) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    return (int) $userId;
}
?>
