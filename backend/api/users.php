<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$userId = requireAuth();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Verify admin/staff
$stmt = $db->prepare('SELECT role FROM users WHERE id = ?');
$stmt->bind_param('i', $userId);
$stmt->execute();
$userRow = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$userRow || !in_array($userRow['role'], ['admin', 'staff'])) {
    jsonResponse(['error' => 'Forbidden.'], 403);
}

if ($method === 'GET') {
    $result = $db->query('SELECT id, name, email, role, phone, status, created_at FROM users ORDER BY created_at DESC');
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (string) $row['id'];
        $row['createdAt'] = $row['created_at'];
        unset($row['created_at']);
        $users[] = $row;
    }
    jsonResponse($users);

} elseif ($method === 'PUT') {
    $body = getJsonBody();
    $id = (int) ($body['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID required.'], 400);

    $fields = [];
    $params = [];
    $types = '';

    if (isset($body['name'])) { $fields[] = 'name = ?'; $params[] = $body['name']; $types .= 's'; }
    if (isset($body['email'])) { $fields[] = 'email = ?'; $params[] = $body['email']; $types .= 's'; }
    if (isset($body['role'])) { $fields[] = 'role = ?'; $params[] = $body['role']; $types .= 's'; }
    if (isset($body['phone'])) { $fields[] = 'phone = ?'; $params[] = $body['phone']; $types .= 's'; }
    if (isset($body['status'])) { $fields[] = 'status = ?'; $params[] = $body['status']; $types .= 's'; }
    if (isset($body['password']) && !empty($body['password'])) {
        $fields[] = 'password = ?';
        $params[] = password_hash($body['password'], PASSWORD_DEFAULT);
        $types .= 's';
    }

    if (empty($fields)) jsonResponse(['error' => 'No fields to update.'], 400);

    $params[] = $id;
    $types .= 'i';

    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'User updated.']);

} elseif ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID required.'], 400);

    $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'User deleted.']);

} else {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$db->close();
?>
