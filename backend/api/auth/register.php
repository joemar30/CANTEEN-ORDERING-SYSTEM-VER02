<?php
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$body = getJsonBody();
$name     = trim($body['name'] ?? '');
$email    = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';
$phone    = trim($body['phone'] ?? '');

if (!$name) {
    jsonResponse(['success' => false, 'message' => 'Full name is required.'], 400);
}
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'A valid email address is required.'], 400);
}
if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 6 characters.'], 400);
}

$db = getDB();

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    $stmt->close();
    $db->close();
    jsonResponse(['success' => false, 'message' => 'This email is already registered. Please log in instead.'], 409);
}
$stmt->close();

// Hash password and insert
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare('INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, "customer", ?, "active")');
$stmt->bind_param('ssss', $name, $email, $hashedPassword, $phone);

if (!$stmt->execute()) {
    $stmt->close();
    $db->close();
    jsonResponse(['success' => false, 'message' => 'Registration failed. Please try again.'], 500);
}

$newId = $stmt->insert_id;
$stmt->close();

$token = generateToken($newId);

$user = [
    'id'         => (string) $newId,
    'name'       => $name,
    'email'      => $email,
    'role'       => 'customer',
    'phone'      => $phone,
    'status'     => 'active',
    'created_at' => date('c'),
];

$db->close();

jsonResponse([
    'success' => true,
    'message' => 'Registration successful! Welcome to CanteenPOS!',
    'token'   => $token,
    'user'    => $user,
]);
?>

