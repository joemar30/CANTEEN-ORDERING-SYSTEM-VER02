<?php
require_once __DIR__ . '/../config.php';
setCorsHeaders();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = requireAuth();

    // Check if admin/staff wants all orders or user wants their own
    $stmt = $db->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $userRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $isAdmin = ($userRow && in_array($userRow['role'], ['admin', 'staff']));

    if ($isAdmin) {
        // Return all orders
        $result = $db->query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
        // Return only user's orders
        $stmt = $db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orderId = (int) $row['id'];

        // Get order items
        $itemStmt = $db->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $itemStmt->bind_param('i', $orderId);
        $itemStmt->execute();
        $itemResult = $itemStmt->get_result();
        $items = [];
        while ($item = $itemResult->fetch_assoc()) {
            $items[] = [
                'menuItemId' => (string) $item['menu_item_id'],
                'name' => $item['name'],
                'price' => (float) $item['price'],
                'quantity' => (int) $item['quantity'],
            ];
        }
        $itemStmt->close();

        // Get user name
        $userName = '';
        $userStmt = $db->prepare('SELECT name FROM users WHERE id = ?');
        $userStmt->bind_param('i', $row['user_id']);
        $userStmt->execute();
        $userResult = $userStmt->get_result()->fetch_assoc();
        if ($userResult) $userName = $userResult['name'];
        $userStmt->close();

        $orders[] = [
            'id' => (string) $row['id'],
            'orderNumber' => $row['order_number'],
            'userId' => (string) $row['user_id'],
            'userName' => $userName,
            'items' => $items,
            'totalAmount' => (float) $row['total_amount'],
            'status' => $row['status'],
            'paymentMethod' => $row['payment_method'],
            'paymentStatus' => $row['payment_status'],
            'notes' => $row['notes'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }

    jsonResponse($orders);

} elseif ($method === 'POST') {
    $userId = requireAuth();
    $body = getJsonBody();
    $paymentMethod = $body['paymentMethod'] ?? 'cash';
    $notes = $body['notes'] ?? null;

    // Get cart items
    $stmt = $db->prepare('SELECT ci.menu_item_id, ci.quantity, mi.name, mi.price FROM cart_items ci JOIN menu_items mi ON ci.menu_item_id = mi.id WHERE ci.user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $cartResult = $stmt->get_result();
    $cartItems = [];
    $totalAmount = 0;
    while ($row = $cartResult->fetch_assoc()) {
        $cartItems[] = $row;
        $totalAmount += (float) $row['price'] * (int) $row['quantity'];
    }
    $stmt->close();

    if (empty($cartItems)) {
        jsonResponse(['error' => 'Cart is empty.'], 400);
    }

    // Generate order number
    $orderNumber = 'ORD-' . substr(time(), -6);

    // Get user name
    $stmt = $db->prepare('SELECT name FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $userRow = $stmt->get_result()->fetch_assoc();
    $userName = $userRow ? $userRow['name'] : 'Unknown';
    $stmt->close();

    $paymentStatus = ($paymentMethod === 'cash') ? 'pending' : 'paid';

    // Insert order
    $stmt = $db->prepare('INSERT INTO orders (order_number, user_id, total_amount, status, payment_method, payment_status, notes) VALUES (?, ?, ?, "pending", ?, ?, ?)');
    $stmt->bind_param('sidsss', $orderNumber, $userId, $totalAmount, $paymentMethod, $paymentStatus, $notes);
    $stmt->execute();
    $orderId = $stmt->insert_id;
    $stmt->close();

    // Insert order items
    $itemStmt = $db->prepare('INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)');
    $orderItems = [];
    foreach ($cartItems as $ci) {
        $menuItemId = (int) $ci['menu_item_id'];
        $name = $ci['name'];
        $price = (float) $ci['price'];
        $qty = (int) $ci['quantity'];
        $itemStmt->bind_param('iisdi', $orderId, $menuItemId, $name, $price, $qty);
        $itemStmt->execute();
        $orderItems[] = [
            'menuItemId' => (string) $menuItemId,
            'name' => $name,
            'price' => $price,
            'quantity' => $qty,
        ];
    }
    $itemStmt->close();

    // Clear cart
    $stmt = $db->prepare('DELETE FROM cart_items WHERE user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();

    // Return the created order
    $order = [
        'id' => (string) $orderId,
        'orderNumber' => $orderNumber,
        'userId' => (string) $userId,
        'userName' => $userName,
        'items' => $orderItems,
        'totalAmount' => $totalAmount,
        'status' => 'pending',
        'paymentMethod' => $paymentMethod,
        'paymentStatus' => $paymentStatus,
        'notes' => $notes,
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];

    jsonResponse(['success' => true, 'order' => $order]);

} elseif ($method === 'PUT') {
    requireAuth();
    $body = getJsonBody();
    $orderId = (int) ($body['id'] ?? 0);
    $status = $body['status'] ?? '';

    if (!$orderId || !$status) jsonResponse(['error' => 'Order ID and status required.'], 400);

    $paymentUpdate = '';
    if ($status === 'completed') {
        $stmt = $db->prepare('UPDATE orders SET status = ?, payment_status = "paid", updated_at = NOW() WHERE id = ?');
    } else {
        $stmt = $db->prepare('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?');
    }
    $stmt->bind_param('si', $status, $orderId);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['success' => true, 'message' => 'Order status updated.']);

} else {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$db->close();
?>
