# Canteen Ordering Management System

A full-stack Point-of-Sale and ordering platform built for school and workplace canteens. Powered by a React + Vite frontend and a PHP + MySQL backend, CanteenPOS delivers a seamless dining experience for customers and a powerful management terminal for administrators.

---

## Features

### Customer Portal

- Browse a filterable menu with food images and descriptions
- Search dishes by name or description
- Add items to cart with real-time quantity management
- Checkout with multiple payment methods: Cash, E-Wallet, Card
- View personal order history and live order status
- Fully responsive — works on desktop, tablet, and mobile

### Admin Terminal

- Dashboard — Live stats: today's revenue, active orders, menu items, and customer count
- Menu Management — Add, edit, delete menu items with image URLs, prices, stock, and categories
- Category Management — Organize items into custom categories (Meals, Snacks, Drinks, Coffee, Pastries)
- Order Management — Accept, prepare, and complete orders in real time
- Sales Reports — Revenue analytics and top-selling item charts
- User Management — View, edit, and manage registered customer accounts

### Authentication

- Secure token-based authentication
- Role-based routing: admin, staff, and customer
- Password hashing with PHP password_hash (bcrypt)

---

## Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Frontend      | React 18, Vite 6, TypeScript          |
| Styling       | Tailwind CSS v4, tw-animate-css       |
| Icons         | Lucide React, Heroicons               |
| Charts        | Recharts                              |
| Routing       | React Router v7                       |
| Notifications | Sonner                                |
| Backend       | PHP 8.3 (built-in development server) |
| Database      | MySQL 8 / MariaDB                     |
| DB GUI        | phpMyAdmin (via Laragon or XAMPP)     |

---

## Project Structure

```
Canteenorderingmanagementsystem/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AdminLayout.tsx
│   │   │       └── CustomerLayout.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── MenuManagement.tsx
│   │   │       ├── CategoryManagement.tsx
│   │   │       ├── OrderManagement.tsx
│   │   │       ├── SalesReports.tsx
│   │   │       └── UserManagement.tsx
│   │   └── store/
│   │       ├── canteenContext.tsx
│   │       └── api.ts
│   └── styles/
│       └── theme.css
├── backend/
│   ├── config.php
│   ├── setup.php
│   ├── database.sql
│   └── api/
│       ├── auth/
│       │   ├── login.php
│       │   └── register.php
│       ├── menu.php
│       ├── categories.php
│       ├── cart.php
│       ├── orders.php
│       └── users.php
├── index.html
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js v18 or higher
- Laragon or XAMPP (for PHP and MySQL)
- PHP 8.1 or higher (available via Laragon or XAMPP)

---

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd Canteenorderingmanagementsystem
```

---

### Step 2 — Set Up the Database

1. Start Laragon or XAMPP and make sure MySQL is running
2. Open phpMyAdmin at http://localhost/phpmyadmin
3. Create a new database named canteen_pos
4. Import the schema using one of the following options:

Option A — Import via phpMyAdmin (recommended):
Go to phpMyAdmin, select canteen_pos, click Import, choose backend/database.sql, then click Go.

Option B — Run the PHP setup script:

```bash
php backend/setup.php
```

---

### Step 3 — Configure the Backend

Open backend/config.php and verify your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'canteen_pos');
```

---

### Step 4 — Start the PHP Backend Server

Using Laragon:

```bash
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" -S 127.0.0.1:8000 -t backend
```

Using XAMPP:

```bash
& "C:\xampp\php\php.exe" -S 127.0.0.1:8000 -t backend
```

The API will be available at: http://127.0.0.1:8000/api

---

### Step 5 — Install Frontend Dependencies

```bash
npm install
```

---

### Step 6 — Start the Frontend Dev Server

```bash
npm run dev
```

The app will be available at: http://localhost:5174

---

### Step 7 — Build for Production

```bash
npm run build
```

Output will be generated in the dist/ folder.

---

## Default Login Credentials

| Role     | Email             | Password |
| -------- | ----------------- | -------- |
| Admin    | admin@canteen.com | admin123 |
| Staff    | staff@canteen.com | staff123 |
| Customer | juan@student.com  | pass123  |

Note: Change these credentials immediately in a production environment.

---

## API Endpoints

All endpoints are prefixed with: http://127.0.0.1:8000/api/

| Method | Endpoint          | Auth Required | Description                       |
| ------ | ----------------- | ------------- | --------------------------------- |
| POST   | auth/login.php    | No            | Login and receive token           |
| POST   | auth/register.php | No            | Register a new customer           |
| GET    | menu.php          | No            | List all menu items               |
| POST   | menu.php          | Yes           | Create a menu item                |
| PUT    | menu.php          | Yes           | Update a menu item                |
| DELETE | menu.php?id=X     | Yes           | Delete a menu item                |
| GET    | categories.php    | No            | List all categories               |
| GET    | cart.php          | Yes           | Get user cart                     |
| POST   | cart.php          | Yes           | Add, update, or remove cart items |
| GET    | orders.php        | Yes           | List orders                       |
| POST   | orders.php        | Yes           | Place an order                    |
| PUT    | orders.php        | Yes           | Update order status               |
| GET    | users.php         | Yes (Admin)   | List all users                    |
| PUT    | users.php         | Yes (Admin)   | Update a user                     |
| DELETE | users.php?id=X    | Yes (Admin)   | Delete a user                     |

Note: Auth Required means the request must include an Authorization: Bearer <token> header.

---

## Design System

- Primary Color: #eb5e28 (Warm Burnt Orange)
- Background Color: #faf9f7 (Warm Cream)
- Card Radius: 2rem to 2.5rem rounded corners
- Theme: Glassmorphism cards on customer portal; dark slate sidebar on admin terminal

---

## Security Notes

- Passwords are hashed using PHP password_hash() with PASSWORD_DEFAULT (bcrypt)
- Token authentication uses base64-encoded user ID, timestamp, and random bytes
- CORS is set to allow all origins for development — restrict to your domain in production
- Input validation is performed on both the frontend and backend

---

## License

This project is for academic and educational purposes.

---

Built with React, PHP, and MySQL.
