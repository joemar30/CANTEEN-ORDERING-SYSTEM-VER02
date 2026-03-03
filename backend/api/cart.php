<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$userId = requireAuth();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get cart for current user
    $stmt = $db->prepare('SELECT ci.menu_item_id, ci.quantity, ci.special_note FROM cart_items ci WHERE ci.user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            'menuItemId' => (string) $row['menu_item_id'],
            'quantity' => (int) $row['quantity'],
            'specialNote' => $row['special_note'],
        ];
    }
    $stmt->close();
    jsonResponse($items);

} elseif ($method === 'POST') {
    $body = getJsonBody();
    $action = $body['action'] ?? 'add';

    if ($action === 'add') {
        $menuItemId = (int) ($body['menuItemId'] ?? 0);
        $quantity = (int) ($body['quantity'] ?? 1);
        $note = $body['specialNote'] ?? null;

        if (!$menuItemId) jsonResponse(['error' => 'menuItemId required.'], 400);

        // Upsert
        $stmt = $db->prepare('INSERT INTO cart_items (user_id, menu_item_id, quantity, special_note) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)');
        $stmt->bind_param('iiis', $userId, $menuItemId, $quantity, $note);
        $stmt->execute();
        $stmt->close();

        jsonResponse(['success' => true, 'message' => 'Added to cart.']);

    } elseif ($action === 'update') {
        $menuItemId = (int) ($body['menuItemId'] ?? 0);
        $quantity = (int) ($body['quantity'] ?? 0);

        if ($quantity <= 0) {
            $stmt = $db->prepare('DELETE FROM cart_items WHERE user_id = ? AND menu_item_id = ?');
            $stmt->bind_param('ii', $userId, $menuItemId);
        } else {
            $stmt = $db->prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND menu_item_id = ?');
            $stmt->bind_param('iii', $quantity, $userId, $menuItemId);
        }
        $stmt->execute();
        $stmt->close();

        jsonResponse(['success' => true, 'message' => 'Cart updated.']);

    } elseif ($action === 'remove') {
        $menuItemId = (int) ($body['menuItemId'] ?? 0);
        $stmt = $db->prepare('DELETE FROM cart_items WHERE user_id = ? AND menu_item_id = ?');
        $stmt->bind_param('ii', $userId, $menuItemId);
        $stmt->execute();
        $stmt->close();

        jsonResponse(['success' => true, 'message' => 'Removed from cart.']);

    } elseif ($action === 'clear') {
        $stmt = $db->prepare('DELETE FROM cart_items WHERE user_id = ?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $stmt->close();

        jsonResponse(['success' => true, 'message' => 'Cart cleared.']);
    }

} else {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$db->close();
?>
