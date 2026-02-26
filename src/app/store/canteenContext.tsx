import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'staff';
  phone?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  available: boolean;
  stock: number;
  popular?: boolean;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  specialNote?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'ewallet' | 'card';
export type PaymentStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@canteen.com', password: 'admin123', role: 'admin', phone: '09171234567', createdAt: '2026-01-01T08:00:00', status: 'active' },
  { id: 'u2', name: 'Staff Member', email: 'staff@canteen.com', password: 'staff123', role: 'staff', phone: '09181234567', createdAt: '2026-01-05T08:00:00', status: 'active' },
  { id: 'u3', name: 'Juan Dela Cruz', email: 'juan@student.com', password: 'pass123', role: 'customer', phone: '09191234567', createdAt: '2026-01-10T09:00:00', status: 'active' },
  { id: 'u4', name: 'Maria Santos', email: 'maria@student.com', password: 'pass123', role: 'customer', phone: '09201234567', createdAt: '2026-01-12T10:00:00', status: 'active' },
  { id: 'u5', name: 'Pedro Reyes', email: 'pedro@employee.com', password: 'pass123', role: 'customer', phone: '09211234567', createdAt: '2026-01-15T11:00:00', status: 'active' },
];

const initialCategories: Category[] = [
  { id: 'cat1', name: 'Meals', icon: '🍽️', description: 'Complete meal sets', color: 'bg-orange-100 text-orange-700' },
  { id: 'cat2', name: 'Snacks', icon: '🍟', description: 'Light bites and finger foods', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'cat3', name: 'Drinks', icon: '🥤', description: 'Refreshing beverages', color: 'bg-blue-100 text-blue-700' },
  { id: 'cat4', name: 'Desserts', icon: '🍰', description: 'Sweet treats', color: 'bg-pink-100 text-pink-700' },
];

const initialMenuItems: MenuItem[] = [
  // Meals
  { id: 'm1', name: 'Chicken Adobo w/ Rice', description: 'Classic Filipino adobo with steamed white rice and side salad', price: 85, categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1676037150408-4b59a542fa7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 30, popular: true },
  { id: 'm2', name: 'Grilled Chicken Meal', description: 'Tender grilled chicken breast with garlic rice and vegetables', price: 120, categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1580959452115-78f3022d8bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 25 },
  { id: 'm3', name: 'Spaghetti Bolognese', description: 'Creamy pasta with rich meat sauce and parmesan cheese', price: 95, categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1708184528301-b0dad28dded5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 20, popular: true },
  { id: 'm4', name: 'Classic Beef Burger', description: 'Juicy beef patty with lettuce, tomato, and special sauce in brioche bun', price: 110, categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1607013401178-f9c15ab575bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 18 },
  // Snacks
  { id: 'm5', name: 'Club Sandwich', description: 'Triple-decker sandwich with chicken, bacon, egg, and veggies', price: 75, categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1626459865967-8adf56d3c97e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 40, popular: true },
  { id: 'm6', name: 'Crispy French Fries', description: 'Golden crispy fries served with ketchup and mayo dip', price: 45, categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1734774797087-b6435057a15e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 50 },
  { id: 'm7', name: 'Spring Rolls (3pcs)', description: 'Crispy lumpia filled with vegetables and ground pork', price: 35, categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1768701544400-dfa8ca509d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 60 },
  // Drinks
  { id: 'm8', name: 'Fresh Fruit Juice', description: 'Freshly squeezed seasonal fruit juice, served cold', price: 40, categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1598915850240-6e6cae81457a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 35, popular: true },
  { id: 'm9', name: 'Hot Coffee', description: 'Freshly brewed Arabica coffee, served hot', price: 55, categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1562609291-761ceb928409?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 45 },
  { id: 'm10', name: 'Iced Tea', description: 'Sweetened black tea served over ice with lemon', price: 30, categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1598915850240-6e6cae81457a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', available: true, stock: 55 },
];

const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-6)}`;

const initialOrders: Order[] = [
  {
    id: 'o1', orderNumber: 'ORD-220001', userId: 'u3', userName: 'Juan Dela Cruz',
    items: [{ menuItemId: 'm1', name: 'Chicken Adobo w/ Rice', price: 85, quantity: 1 }, { menuItemId: 'm8', name: 'Fresh Fruit Juice', price: 40, quantity: 1 }],
    totalAmount: 125, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid',
    createdAt: '2026-02-25T08:15:00', updatedAt: '2026-02-25T08:35:00'
  },
  {
    id: 'o2', orderNumber: 'ORD-220002', userId: 'u4', userName: 'Maria Santos',
    items: [{ menuItemId: 'm5', name: 'Club Sandwich', price: 75, quantity: 2 }, { menuItemId: 'm9', name: 'Hot Coffee', price: 55, quantity: 1 }],
    totalAmount: 205, status: 'preparing', paymentMethod: 'ewallet', paymentStatus: 'paid',
    createdAt: '2026-02-25T09:00:00', updatedAt: '2026-02-25T09:05:00'
  },
  {
    id: 'o3', orderNumber: 'ORD-220003', userId: 'u5', userName: 'Pedro Reyes',
    items: [{ menuItemId: 'm4', name: 'Classic Beef Burger', price: 110, quantity: 1 }, { menuItemId: 'm6', name: 'Crispy French Fries', price: 45, quantity: 1 }, { menuItemId: 'm10', name: 'Iced Tea', price: 30, quantity: 1 }],
    totalAmount: 185, status: 'ready', paymentMethod: 'card', paymentStatus: 'paid',
    createdAt: '2026-02-25T09:30:00', updatedAt: '2026-02-25T09:50:00'
  },
  {
    id: 'o4', orderNumber: 'ORD-220004', userId: 'u3', userName: 'Juan Dela Cruz',
    items: [{ menuItemId: 'm3', name: 'Spaghetti Bolognese', price: 95, quantity: 1 }, { menuItemId: 'm8', name: 'Fresh Fruit Juice', price: 40, quantity: 2 }],
    totalAmount: 175, status: 'pending', paymentMethod: 'cash', paymentStatus: 'pending',
    createdAt: '2026-02-25T10:00:00', updatedAt: '2026-02-25T10:00:00'
  },
  {
    id: 'o5', orderNumber: 'ORD-220005', userId: 'u4', userName: 'Maria Santos',
    items: [{ menuItemId: 'm2', name: 'Grilled Chicken Meal', price: 120, quantity: 1 }],
    totalAmount: 120, status: 'completed', paymentMethod: 'ewallet', paymentStatus: 'paid',
    createdAt: '2026-02-24T11:00:00', updatedAt: '2026-02-24T11:30:00'
  },
  {
    id: 'o6', orderNumber: 'ORD-220006', userId: 'u5', userName: 'Pedro Reyes',
    items: [{ menuItemId: 'm7', name: 'Spring Rolls (3pcs)', price: 35, quantity: 2 }, { menuItemId: 'm9', name: 'Hot Coffee', price: 55, quantity: 1 }],
    totalAmount: 125, status: 'completed', paymentMethod: 'cash', paymentStatus: 'paid',
    createdAt: '2026-02-24T12:00:00', updatedAt: '2026-02-24T12:20:00'
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

interface CanteenContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => { success: boolean; message: string };

  // Menu
  menuItems: MenuItem[];
  categories: Category[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (menuItemId: string, quantity?: number, note?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQty: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Orders
  orders: Order[];
  placeOrder: (paymentMethod: PaymentMethod, notes?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getUserOrders: (userId: string) => Order[];

  // Users (Admin)
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const CanteenContext = createContext<CanteenContextType | null>(null);

export function CanteenProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Load persisted session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('canteen_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Auth
  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Invalid email or password.' };
    if (user.status === 'inactive') return { success: false, message: 'Account is deactivated.' };
    setCurrentUser(user);
    sessionStorage.setItem('canteen_user', JSON.stringify(user));
    return { success: true, message: 'Login successful!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    sessionStorage.removeItem('canteen_user');
  };

  const register = (name: string, email: string, password: string, phone: string) => {
    if (users.find(u => u.email === email)) return { success: false, message: 'Email already registered.' };
    const newUser: User = {
      id: `u${Date.now()}`, name, email, password, phone, role: 'customer',
      createdAt: new Date().toISOString(), status: 'active'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    sessionStorage.setItem('canteen_user', JSON.stringify(newUser));
    return { success: true, message: 'Registration successful!' };
  };

  // Menu
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `m${Date.now()}` };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...cat, id: `cat${Date.now()}` }]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Cart
  const addToCart = (menuItemId: string, quantity = 1, note?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === menuItemId);
      if (existing) {
        return prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + quantity } : c);
      }
      return [...prev, { menuItemId, quantity, specialNote: note }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(c => c.menuItemId !== menuItemId));
  };

  const updateCartQty = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(menuItemId); return; }
    setCart(prev => prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity } : c));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  // Orders
  const placeOrder = (paymentMethod: PaymentMethod, notes?: string): Order => {
    if (!currentUser) throw new Error('Not logged in');
    const orderItems: OrderItem[] = cart.map(c => {
      const item = menuItems.find(m => m.id === c.menuItemId)!;
      return { menuItemId: c.menuItemId, name: item.name, price: item.price, quantity: c.quantity };
    });
    const newOrder: Order = {
      id: `o${Date.now()}`,
      orderNumber: generateOrderNumber(),
      userId: currentUser.id,
      userName: currentUser.name,
      items: orderItems,
      totalAmount: getCartTotal(),
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes,
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status, updatedAt: new Date().toISOString(), paymentStatus: status === 'completed' ? 'paid' : o.paymentStatus }
        : o
    ));
  };

  const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId);

  // Users
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <CanteenContext.Provider value={{
      currentUser, login, logout, register,
      menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem,
      addCategory, updateCategory, deleteCategory,
      cart, addToCart, removeFromCart, updateCartQty, clearCart, getCartTotal, getCartCount,
      orders, placeOrder, updateOrderStatus, getUserOrders,
      users, updateUser, deleteUser,
    }}>
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const ctx = useContext(CanteenContext);
  if (!ctx) throw new Error('useCanteen must be used within CanteenProvider');
  return ctx;
}
