<?php
/**
 * Run this script once to set up the database and seed data.
 * Usage: php setup.php
 * 
 * Make sure MySQL/XAMPP is running first.
 */

require_once __DIR__ . '/config.php';

echo "=== CanteenPOS Database Setup ===\n\n";

// Connect without database first
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

// Create database
$conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
echo "✓ Database '" . DB_NAME . "' created/verified.\n";
$conn->select_db(DB_NAME);
$conn->set_charset('utf8mb4');

// Create tables
$conn->query("
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
        phone VARCHAR(20) DEFAULT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'users' created.\n";

$conn->query("
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) DEFAULT '',
        description VARCHAR(255) DEFAULT '',
        color VARCHAR(100) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'categories' created.\n";

$conn->query("
    CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT DEFAULT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        category_id INT DEFAULT NULL,
        image VARCHAR(500) DEFAULT '',
        available TINYINT(1) DEFAULT 1,
        stock INT DEFAULT 0,
        popular TINYINT(1) DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'menu_items' created.\n";

$conn->query("
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
        payment_method ENUM('cash', 'ewallet', 'card') DEFAULT 'cash',
        payment_status ENUM('pending', 'paid') DEFAULT 'pending',
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'orders' created.\n";

$conn->query("
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT DEFAULT NULL,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        quantity INT NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'order_items' created.\n";

$conn->query("
    CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        special_note TEXT DEFAULT NULL,
        UNIQUE KEY unique_cart_item (user_id, menu_item_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
echo "✓ Table 'cart_items' created.\n\n";

// Check if data already seeded
$result = $conn->query("SELECT COUNT(*) as cnt FROM users");
$row = $result->fetch_assoc();
if ((int)$row['cnt'] > 0) {
    echo "⚠ Data already exists. Skipping seed.\n";
    echo "\n=== Setup Complete! ===\n";
    $conn->close();
    exit;
}

echo "Seeding data...\n";

// Seed users with properly hashed passwords
$users = [
    ['Admin User', 'admin@canteen.com', 'admin123', 'admin', '09171234567'],
    ['Staff Member', 'staff@canteen.com', 'staff123', 'staff', '09181234567'],
    ['Juan Dela Cruz', 'juan@student.com', 'pass123', 'customer', '09191234567'],
    ['Maria Santos', 'maria@student.com', 'pass123', 'customer', '09201234567'],
    ['Pedro Reyes', 'pedro@employee.com', 'pass123', 'customer', '09211234567'],
];

$stmt = $conn->prepare('INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, ?, ?, "active")');
foreach ($users as $u) {
    $hash = password_hash($u[2], PASSWORD_DEFAULT);
    $stmt->bind_param('sssss', $u[0], $u[1], $hash, $u[3], $u[4]);
    $stmt->execute();
}
$stmt->close();
echo "✓ Users seeded (5 users).\n";

// Seed categories
$conn->query("INSERT INTO categories (name, icon, description, color) VALUES
    ('Meals', '🍽️', 'Complete meal sets', 'bg-orange-100 text-orange-700'),
    ('Snacks', '🍟', 'Light bites and finger foods', 'bg-yellow-100 text-yellow-700'),
    ('Drinks', '🥤', 'Refreshing beverages', 'bg-blue-100 text-blue-700'),
    ('Desserts', '🍰', 'Sweet treats', 'bg-pink-100 text-pink-700'),
    ('Coffee', '☕', 'Premium brewed coffee and espresso', 'bg-amber-100 text-amber-800'),
    ('Pastries', '🥐', 'Freshly baked treats', 'bg-rose-100 text-rose-800')
");
echo "✓ Categories seeded (6 categories).\n";

// Seed menu items
$conn->query("INSERT INTO menu_items (name, description, price, category_id, image, available, stock, popular) VALUES
    ('Chicken Adobo w/ Rice', 'Classic Filipino adobo with steamed white rice and side salad', 85.00, 1, 'https://images.unsplash.com/photo-1676037150408-4b59a542fa7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 30, 1),
    ('Grilled Chicken Meal', 'Tender grilled chicken breast with garlic rice and vegetables', 120.00, 1, 'https://images.unsplash.com/photo-1580959452115-78f3022d8bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 25, 0),
    ('Spaghetti Bolognese', 'Creamy pasta with rich meat sauce and parmesan cheese', 95.00, 1, 'https://images.unsplash.com/photo-1708184528301-b0dad28dded5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 20, 1),
    ('Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce in brioche pun', 110.00, 1, 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 18, 0),
    ('Beef Tapa w/ Egg', 'Filipino style marinated beef with garlic rice and sunny-side-up egg', 115.00, 1, 'https://images.unsplash.com/photo-1628198595537-8e6d22ef14fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 20, 1),
    ('Margherita Pizza', 'Classic personal pizza with fresh tomatoes and mozzarella', 150.00, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 15, 0),
    ('Caesar Salad', 'Crisp romaine lettuce, croutons, parmesan, and Caesar dressing', 85.00, 1, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 15, 0),
    ('Club Sandwich', 'Triple-decker sandwich with chicken, bacon, egg, and veggies', 75.00, 2, 'https://images.unsplash.com/photo-1626459865967-8adf56d3c97e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 40, 1),
    ('Crispy French Fries', 'Golden crispy fries served with ketchup and mayo dip', 45.00, 2, 'https://images.unsplash.com/photo-1734774797087-b6435057a15e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 50, 0),
    ('Spring Rolls (3pcs)', 'Crispy lumpia filled with vegetables and ground pork', 35.00, 2, 'https://images.unsplash.com/photo-1768701544400-dfa8ca509d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 60, 0),
    ('Nachos w/ Cheese', 'Crunchy nachos loaded with liquid cheese and jalapeños', 65.00, 2, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 25, 1),
    ('Fresh Fruit Juice', 'Freshly squeezed seasonal fruit juice, served cold', 40.00, 3, 'https://images.unsplash.com/photo-1598915850240-6e6cae81457a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 35, 1),
    ('Iced Tea', 'Sweetened black tea served over ice with lemon', 30.00, 3, 'https://images.unsplash.com/photo-1556881286-fc6915169721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 55, 0),
    ('Hot Coffee', 'Freshly brewed Arabica coffee, served hot', 55.00, 5, 'https://images.unsplash.com/photo-1562609291-761ceb928409?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 45, 0),
    ('Spanish Latte', 'Sweet and creamy espresso with condensed milk', 95.00, 5, 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 20, 1),
    ('Caramel Macchiato', 'Espresso with steamed milk and caramel drizzle', 110.00, 5, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 15, 1),
    ('Matcha Latte', 'Premium green tea powder with steamed milk', 105.00, 5, 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 18, 1),
    ('Butter Croissant', 'Flaky and buttery French pastry', 65.00, 6, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 12, 1),
    ('Chocolate Brownie', 'Fudgy dark chocolate brownie with walnuts', 55.00, 6, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 10, 0),
    ('Blueberry Muffin', 'Soft muffin bursting with sweet blueberries', 60.00, 6, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', 1, 15, 1)
");
echo "✓ Menu items seeded (14 items).\n";

// Seed orders
$conn->query("INSERT INTO orders (order_number, user_id, total_amount, status, payment_method, payment_status, created_at, updated_at) VALUES
    ('ORD-220001', 3, 125.00, 'completed', 'cash', 'paid', '2026-02-25 08:15:00', '2026-02-25 08:35:00'),
    ('ORD-220002', 4, 205.00, 'preparing', 'ewallet', 'paid', '2026-02-25 09:00:00', '2026-02-25 09:05:00'),
    ('ORD-220003', 5, 185.00, 'ready', 'card', 'paid', '2026-02-25 09:30:00', '2026-02-25 09:50:00'),
    ('ORD-220004', 3, 175.00, 'pending', 'cash', 'pending', '2026-02-25 10:00:00', '2026-02-25 10:00:00'),
    ('ORD-220005', 4, 120.00, 'completed', 'ewallet', 'paid', '2026-02-24 11:00:00', '2026-02-24 11:30:00'),
    ('ORD-220006', 5, 125.00, 'completed', 'cash', 'paid', '2026-02-24 12:00:00', '2026-02-24 12:20:00')
");
echo "✓ Orders seeded (6 orders).\n";

$conn->query("INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES
    (1, 1, 'Chicken Adobo w/ Rice', 85.00, 1),
    (1, 8, 'Fresh Fruit Juice', 40.00, 1),
    (2, 5, 'Club Sandwich', 75.00, 2),
    (2, 9, 'Hot Coffee', 55.00, 1),
    (3, 4, 'Classic Beef Burger', 110.00, 1),
    (3, 6, 'Crispy French Fries', 45.00, 1),
    (3, 10, 'Iced Tea', 30.00, 1),
    (4, 3, 'Spaghetti Bolognese', 95.00, 1),
    (4, 8, 'Fresh Fruit Juice', 40.00, 2),
    (5, 2, 'Grilled Chicken Meal', 120.00, 1),
    (6, 7, 'Spring Rolls (3pcs)', 35.00, 2),
    (6, 9, 'Hot Coffee', 55.00, 1)
");
echo "✓ Order items seeded.\n";

echo "\n=== Setup Complete! ===\n";
echo "You can now see all data in phpMyAdmin under database 'canteen_pos'.\n";
echo "\nDefault credentials:\n";
echo "  Admin:    admin@canteen.com / admin123\n";
echo "  Staff:    staff@canteen.com / staff123\n";
echo "  Customer: juan@student.com  / pass123\n";

$conn->close();
?>
