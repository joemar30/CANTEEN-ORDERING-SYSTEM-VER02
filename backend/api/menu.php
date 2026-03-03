<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$db = getDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all menu items
    $result = $db->query('SELECT * FROM menu_items ORDER BY id ASC');
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (string) $row['id'];
        $row['categoryId'] = (string) $row['category_id'];
        $row['price'] = (float) $row['price'];
        $row['available'] = (bool) $row['available'];
        $row['stock'] = (int) $row['stock'];
        $row['popular'] = (bool) $row['popular'];
        unset($row['category_id']);
        $items[] = $row;
    }
    jsonResponse($items);

} elseif ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();
    $name = $body['name'] ?? '';
    $description = $body['description'] ?? '';
    $price = (float) ($body['price'] ?? 0);
    $categoryId = (int) ($body['categoryId'] ?? 0);
    $image = $body['image'] ?? '';
    $available = isset($body['available']) ? (int) $body['available'] : 1;
    $stock = (int) ($body['stock'] ?? 0);
    $popular = isset($body['popular']) ? (int) $body['popular'] : 0;

    $stmt = $db->prepare('INSERT INTO menu_items (name, description, price, category_id, image, available, stock, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssdisiii', $name, $description, $price, $categoryId, $image, $available, $stock, $popular);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    jsonResponse([
        'success' => true,
        'id' => (string) $newId,
        'message' => 'Menu item added successfully.',
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
    if (isset($body['description'])) { $fields[] = 'description = ?'; $params[] = $body['description']; $types .= 's'; }
    if (isset($body['price'])) { $fields[] = 'price = ?'; $params[] = (float) $body['price']; $types .= 'd'; }
    if (isset($body['categoryId'])) { $fields[] = 'category_id = ?'; $params[] = (int) $body['categoryId']; $types .= 'i'; }
    if (isset($body['image'])) { $fields[] = 'image = ?'; $params[] = $body['image']; $types .= 's'; }
    if (isset($body['available'])) { $fields[] = 'available = ?'; $params[] = (int) $body['available']; $types .= 'i'; }
    if (isset($body['stock'])) { $fields[] = 'stock = ?'; $params[] = (int) $body['stock']; $types .= 'i'; }
    if (isset($body['popular'])) { $fields[] = 'popular = ?'; $params[] = (int) $body['popular']; $types .= 'i'; }

    if (empty($fields)) jsonResponse(['error' => 'No fields to update.'], 400);

    $params[] = $id;
    $types .= 'i';

    $sql = 'UPDATE menu_items SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'Menu item updated.']);

} elseif ($method === 'DELETE') {
    requireAuth();
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID is required.'], 400);

    $stmt = $db->prepare('DELETE FROM menu_items WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'Menu item deleted.']);
}

$db->close();
?>
