import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi, menuApi, categoriesApi, cartApi, ordersApi, usersApi,
  setToken, clearToken,
  type ApiUser, type ApiMenuItem, type ApiCategory, type ApiCartItem, type ApiOrder,
} from './api';

// ─── Types (kept for backward compatibility) ──────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
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

// ─── Context ─────────────────────────────────────────────────────────────────

interface CanteenContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>;

  // Menu
  menuItems: MenuItem[];
  categories: Category[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

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
  placeOrder: (paymentMethod: PaymentMethod, notes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getUserOrders: (userId: string) => Order[];

  // Users (Admin)
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Loading state
  loading: boolean;
  refreshData: () => Promise<void>;
}

const CanteenContext = createContext<CanteenContextType | null>(null);

function mapApiUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    status: u.status,
    createdAt: u.createdAt || u.created_at || new Date().toISOString(),
  };
}

export function CanteenProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load persisted session ──────────────────────────────────
  useEffect(() => {
    const savedUser = sessionStorage.getItem('canteen_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
  }, []);

  // ── Fetch public data (menu & categories) on mount ──────────
  const fetchPublicData = useCallback(async () => {
    try {
      const [menuData, catData] = await Promise.all([
        menuApi.list(),
        categoriesApi.list(),
      ]);
      setMenuItems(menuData.map(m => ({ ...m, popular: !!m.popular })));
      setCategories(catData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  // ── Fetch user-specific data when logged in ─────────────────
  const fetchUserData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [cartData, ordersData] = await Promise.all([
        cartApi.list(),
        ordersApi.list(),
      ]);
      setCart(cartData);
      setOrders(ordersData);

      // If admin/staff, also fetch users
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        const usersData = await usersApi.list();
        setUsers(usersData.map(mapApiUser));
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  }, [currentUser]);

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchPublicData().finally(() => setLoading(false));
  }, [fetchPublicData]);

  // Fetch user data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser, fetchUserData]);

  const refreshData = async () => {
    await fetchPublicData();
    if (currentUser) await fetchUserData();
  };

  // ── Auth ────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user && res.token) {
        setToken(res.token);
        const user = mapApiUser(res.user);
        setCurrentUser(user);
        sessionStorage.setItem('canteen_user', JSON.stringify(user));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Cannot connect to server.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    clearToken();
    sessionStorage.removeItem('canteen_user');
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const res = await authApi.register(name, email, password, phone);
      if (res.success && res.user && res.token) {
        setToken(res.token);
        const user = mapApiUser(res.user);
        setCurrentUser(user);
        sessionStorage.setItem('canteen_user', JSON.stringify(user));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Cannot connect to server.' };
    }
  };

  // ── Menu ────────────────────────────────────────────────────

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const apiItem = { ...item, popular: item.popular ?? false };
    const res = await menuApi.create(apiItem);
    if (res.success) {
      const newItem: MenuItem = { ...item, id: res.id };
      setMenuItems(prev => [...prev, newItem]);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    await menuApi.update(id, updates);
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMenuItem = async (id: string) => {
    await menuApi.delete(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  // ── Categories ──────────────────────────────────────────────

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const res = await categoriesApi.create(cat);
    if (res.success) {
      setCategories(prev => [...prev, { ...cat, id: res.id }]);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await categoriesApi.update(id, updates);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = async (id: string) => {
    await categoriesApi.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ── Cart ────────────────────────────────────────────────────

  const addToCart = (menuItemId: string, quantity = 1, note?: string) => {
    // Optimistic update
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === menuItemId);
      if (existing) {
        return prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + quantity } : c);
      }
      return [...prev, { menuItemId, quantity, specialNote: note }];
    });
    // Sync to backend
    cartApi.add(menuItemId, quantity, note).catch(console.error);
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(c => c.menuItemId !== menuItemId));
    cartApi.remove(menuItemId).catch(console.error);
  };

  const updateCartQty = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prev => prev.map(c => c.menuItemId === menuItemId ? { ...c, quantity } : c));
    cartApi.updateQty(menuItemId, quantity).catch(console.error);
  };

  const clearCart = () => {
    setCart([]);
    cartApi.clear().catch(console.error);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Orders ──────────────────────────────────────────────────

  const placeOrder = async (paymentMethod: PaymentMethod, notes?: string): Promise<Order> => {
    const res = await ordersApi.place(paymentMethod, notes);
    if (res.success && res.order) {
      const order: Order = res.order;
      setOrders(prev => [order, ...prev]);
      setCart([]); // Cart already cleared on backend
      return order;
    }
    throw new Error('Failed to place order');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await ordersApi.updateStatus(orderId, status);
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status, updatedAt: new Date().toISOString(), paymentStatus: status === 'completed' ? 'paid' : o.paymentStatus }
        : o
    ));
  };

  const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId);

  // ── Users ───────────────────────────────────────────────────

  const updateUser = async (id: string, updates: Partial<User>) => {
    await usersApi.update(id, updates);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = async (id: string) => {
    await usersApi.delete(id);
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
      loading, refreshData,
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
