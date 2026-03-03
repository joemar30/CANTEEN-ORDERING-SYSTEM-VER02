<?php
require_once __DIR__ . '/../../config.php';
setCorsHeaders();

$body = getJsonBody();
$email = $body['email'] ?? '';
$password = $body['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(['error' => 'Email and password are required.'], 400);
}

$db = getDB();
$stmt = $db->prepare('SELECT id, name, email, password, role, phone, status, created_at FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    jsonResponse(['success' => false, 'message' => 'Invalid email or password.']);
}

if (!password_verify($password, $user['password'])) {
    jsonResponse(['success' => false, 'message' => 'Invalid email or password.']);
}

if ($user['status'] === 'inactive') {
    jsonResponse(['success' => false, 'message' => 'Account is deactivated.']);
}

$token = generateToken($user['id']);

// Remove password from response
unset($user['password']);
$user['id'] = (string) $user['id'];

jsonResponse([
    'success' => true,
    'message' => 'Login successful!',
    'token' => $token,
    'user' => $user,
]);

$db->close();
?>
