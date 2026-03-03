<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $db->query('SELECT * FROM categories ORDER BY id ASC');
    $cats = [];
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (string) $row['id'];
        $cats[] = $row;
    }
    jsonResponse($cats);

} elseif ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();
    $name = $body['name'] ?? '';
    $icon = $body['icon'] ?? '';
    $description = $body['description'] ?? '';
    $color = $body['color'] ?? '';

    $stmt = $db->prepare('INSERT INTO categories (name, icon, description, color) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $name, $icon, $description, $color);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    jsonResponse([
        'success' => true,
        'id' => (string) $newId,
        'message' => 'Category added.',
    ]);

} elseif ($method === 'PUT') {
    requireAuth();
    $body = getJsonBody();
    $id = (int) ($body['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID is required.'], 400);

    $fields = [];
    $params = [];
    $types = '';

    if (isset($body['name'])) { $fields[] = 'name = ?'; $params[] = $body['name']; $types .= 's'; }
    if (isset($body['icon'])) { $fields[] = 'icon = ?'; $params[] = $body['icon']; $types .= 's'; }
    if (isset($body['description'])) { $fields[] = 'description = ?'; $params[] = $body['description']; $types .= 's'; }
    if (isset($body['color'])) { $fields[] = 'color = ?'; $params[] = $body['color']; $types .= 's'; }

    if (empty($fields)) jsonResponse(['error' => 'No fields to update.'], 400);

    $params[] = $id;
    $types .= 'i';

    $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'Category updated.']);

} elseif ($method === 'DELETE') {
    requireAuth();
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID is required.'], 400);

    $stmt = $db->prepare('DELETE FROM categories WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'Category deleted.']);
}

$db->close();
?>
