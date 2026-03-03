<<<<<<< HEAD
# 🍽️ CanteenPOS — Canteen Ordering Management System

> A full-stack, modern Point-of-Sale and ordering platform built for school and workplace canteens. Powered by a **React + Vite** frontend and a **PHP + MySQL** backend, CanteenPOS delivers a seamless dining experience for customers and a powerful management terminal for administrators.

---

## ✨ Features

### 🛒 Customer Portal

- Browse a rich, filterable menu with high-quality food images
- Search dishes by name or description
- Add items to cart with real-time quantity management
- Checkout with multiple payment methods: **Cash**, **E-Wallet**, **Card**
- View personal order history and live order status
- Fully responsive — works on desktop, tablet, and mobile

### 🖥️ Admin Terminal

- **Dashboard** — Live stats: today's revenue, active orders, menu items, and customer count
- **Menu Management** — Add, edit, delete menu items with image URLs, prices, stock, and categories
- **Category Management** — Organize items into custom categories (Meals, Snacks, Drinks, Coffee, Pastries, etc.)
- **Order Management** — Accept, prepare, and complete orders in real time
- **Sales Reports** — Revenue analytics and top-selling item charts
- **User Management** — View, edit, and manage registered customer accounts

### 🔐 Authentication

- Secure JWT-style token authentication
- Role-based routing: `admin`, `staff`, and `customer`
- Password hashing with PHP `password_hash` (bcrypt)

---

## 🧰 Tech Stack

| Layer             | Technology                      |
| ----------------- | ------------------------------- |
| **Frontend**      | React 18, Vite 6, TypeScript    |
| **Styling**       | Tailwind CSS v4, tw-animate-css |
| **Icons**         | Lucide React, Heroicons         |
| **Charts**        | Recharts                        |
| **Routing**       | React Router v7                 |
| **Notifications** | Sonner                          |
| **Backend**       | PHP 8.3 (built-in server)       |
| **Database**      | MySQL 8 / MariaDB               |
| **DB GUI**        | phpMyAdmin (via Laragon/XAMPP)  |

---

## 📁 Project Structure

```
Canteenorderingmanagementsystem/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AdminLayout.tsx       # Admin sidebar & header
│   │   │       └── CustomerLayout.tsx    # Customer navbar
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
│   │       ├── canteenContext.tsx        # Global state (React Context)
│   │       └── api.ts                    # API utility functions
│   └── styles/
│       └── theme.css                     # Design tokens & global styles
├── backend/
│   ├── config.php                        # DB config, CORS, helpers
│   ├── setup.php                         # One-time DB seed script
│   ├── database.sql                      # Full SQL schema + seed data
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

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [Laragon](https://laragon.org/) or [XAMPP](https://www.apachefriends.org/) (for PHP & MySQL)
- PHP 8.1+ (available via Laragon/XAMPP)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Canteenorderingmanagementsystem
```

---

### 2. Set Up the Database

1. Start **Laragon** or **XAMPP** (ensure MySQL is running)
2. Open **phpMyAdmin** at `http://localhost/phpmyadmin`
3. Create a new database named `canteen_pos`
4. Import the schema by running the SQL file:

```bash
# Option A — Import via phpMyAdmin UI (recommended)
# Go to: phpMyAdmin → canteen_pos → Import → choose backend/database.sql → Go

# Option B — Run the PHP setup script
php backend/setup.php
```

---

### 3. Configure the Backend

Open `backend/config.php` and verify your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // your MySQL username
define('DB_PASS', '');           // your MySQL password (blank for Laragon default)
define('DB_NAME', 'canteen_pos');
```

---

### 4. Start the PHP Backend Server

```bash
# Using Laragon PHP
& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" -S 127.0.0.1:8000 -t backend

# Using XAMPP PHP
& "C:\xampp\php\php.exe" -S 127.0.0.1:8000 -t backend
```

The API will be available at: `http://127.0.0.1:8000/api`

---

### 5. Install Frontend Dependencies

```bash
npm install
```

---

### 6. Start the Frontend Dev Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5174`

---

### 7. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🔑 Default Login Credentials

| Role         | Email               | Password   |
| ------------ | ------------------- | ---------- |
| **Admin**    | `admin@canteen.com` | `admin123` |
| **Staff**    | `staff@canteen.com` | `staff123` |
| **Customer** | `juan@student.com`  | `pass123`  |

> ⚠️ Change these credentials immediately in a production environment.

---

## 🌐 API Endpoints

All endpoints are prefixed with `http://127.0.0.1:8000/api/`

| Method   | Endpoint            | Auth     | Description                  |
| -------- | ------------------- | -------- | ---------------------------- |
| `POST`   | `auth/login.php`    | ❌       | Login and receive token      |
| `POST`   | `auth/register.php` | ❌       | Register a new customer      |
| `GET`    | `menu.php`          | ❌       | List all menu items          |
| `POST`   | `menu.php`          | ✅       | Create a menu item           |
| `PUT`    | `menu.php`          | ✅       | Update a menu item           |
| `DELETE` | `menu.php?id=X`     | ✅       | Delete a menu item           |
| `GET`    | `categories.php`    | ❌       | List all categories          |
| `GET`    | `cart.php`          | ✅       | Get user's cart              |
| `POST`   | `cart.php`          | ✅       | Add/update/remove cart items |
| `GET`    | `orders.php`        | ✅       | List orders                  |
| `POST`   | `orders.php`        | ✅       | Place an order               |
| `PUT`    | `orders.php`        | ✅       | Update order status          |
| `GET`    | `users.php`         | ✅ Admin | List all users               |
| `PUT`    | `users.php`         | ✅ Admin | Update a user                |
| `DELETE` | `users.php?id=X`    | ✅ Admin | Delete a user                |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## 🎨 Design System

- **Primary Color:** `#eb5e28` (Warm Burnt Orange)
- **Background:** `#faf9f7` (Warm Cream)
- **Border Radius:** `rounded-[2rem]` to `rounded-[2.5rem]` for cards
- **Typography:** System font stack with `font-black` headings and tight tracking
- **Theme:** Glassmorphism cards on customer portal; dark slate sidebar on admin terminal

---

## 🛡️ Security Notes

- Passwords are hashed using PHP `password_hash()` with `PASSWORD_DEFAULT` (bcrypt)
- Token authentication uses base64-encoded user ID + timestamp + random bytes
- CORS is set to `*` for development — restrict to your domain in production
- Input validation is performed on both frontend and backend

---

## 📄 License

This project is for academic and educational purposes.

---

<div align="center">
  Built with ❤️ using React, PHP & MySQL
</div>
=======
# CANTEEN-ORDERING-SYSTEM-VER02
ordering canteen system can track order and etc.
>>>>>>> d9e1b367d5679dd9efcfe6255b3ae4c1d05e4383
