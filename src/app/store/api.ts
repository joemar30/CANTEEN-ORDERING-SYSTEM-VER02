// API utility for communicating with the PHP backend

const API_BASE = "http://localhost/Canteen%20Ordering%20System/api";

function getToken(): string | null {
  return sessionStorage.getItem("canteen_token");
}

export function setToken(token: string) {
  sessionStorage.setItem("canteen_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("canteen_token");
}

async function request<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    requiresAuth?: boolean;
  } = {},
): Promise<T> {
  const { method = "GET", body, requiresAuth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = { method, headers };
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}/${endpoint}`, config);
  const data = await response.json();

  if (!response.ok && !data.success) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data as T;
}

// ─── Auth API ───────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: ApiUser;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "staff";
  phone?: string;
  status: "active" | "inactive";
  created_at?: string;
  createdAt?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("auth/login.php", {
      method: "POST",
      body: { email, password },
    }),

  register: (name: string, email: string, password: string, phone: string) =>
    request<LoginResponse>("auth/register.php", {
      method: "POST",
      body: { name, email, password, phone },
    }),
};

// ─── Menu API ───────────────────────────────────────────────────

export interface ApiMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  available: boolean;
  stock: number;
  popular: boolean;
}

export const menuApi = {
  list: () => request<ApiMenuItem[]>("menu.php"),

  create: (item: Omit<ApiMenuItem, "id">) =>
    request<{ success: boolean; id: string }>("menu.php", {
      method: "POST",
      body: item,
      requiresAuth: true,
    }),

  update: (id: string, updates: Partial<ApiMenuItem>) =>
    request<{ success: boolean }>("menu.php", {
      method: "PUT",
      body: { id, ...updates },
      requiresAuth: true,
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`menu.php?id=${id}`, {
      method: "DELETE",
      requiresAuth: true,
    }),
};

// ─── Categories API ─────────────────────────────────────────────

export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const categoriesApi = {
  list: () => request<ApiCategory[]>("categories.php"),

  create: (cat: Omit<ApiCategory, "id">) =>
    request<{ success: boolean; id: string }>("categories.php", {
      method: "POST",
      body: cat,
      requiresAuth: true,
    }),

  update: (id: string, updates: Partial<ApiCategory>) =>
    request<{ success: boolean }>("categories.php", {
      method: "PUT",
      body: { id, ...updates },
      requiresAuth: true,
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`categories.php?id=${id}`, {
      method: "DELETE",
      requiresAuth: true,
    }),
};

// ─── Cart API ───────────────────────────────────────────────────

export interface ApiCartItem {
  menuItemId: string;
  quantity: number;
  specialNote?: string;
}

export const cartApi = {
  list: () => request<ApiCartItem[]>("cart.php", { requiresAuth: true }),

  add: (menuItemId: string, quantity = 1, specialNote?: string) =>
    request<{ success: boolean }>("cart.php", {
      method: "POST",
      body: {
        action: "add",
        menuItemId: parseInt(menuItemId),
        quantity,
        specialNote,
      },
      requiresAuth: true,
    }),

  updateQty: (menuItemId: string, quantity: number) =>
    request<{ success: boolean }>("cart.php", {
      method: "POST",
      body: { action: "update", menuItemId: parseInt(menuItemId), quantity },
      requiresAuth: true,
    }),

  remove: (menuItemId: string) =>
    request<{ success: boolean }>("cart.php", {
      method: "POST",
      body: { action: "remove", menuItemId: parseInt(menuItemId) },
      requiresAuth: true,
    }),

  clear: () =>
    request<{ success: boolean }>("cart.php", {
      method: "POST",
      body: { action: "clear" },
      requiresAuth: true,
    }),
};

// ─── Orders API ─────────────────────────────────────────────────

export interface ApiOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  items: ApiOrderItem[];
  totalAmount: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  paymentMethod: "cash" | "ewallet" | "card";
  paymentStatus: "pending" | "paid";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  list: () => request<ApiOrder[]>("orders.php", { requiresAuth: true }),

  place: (paymentMethod: string, notes?: string) =>
    request<{ success: boolean; order: ApiOrder }>("orders.php", {
      method: "POST",
      body: { paymentMethod, notes },
      requiresAuth: true,
    }),

  updateStatus: (id: string, status: string) =>
    request<{ success: boolean }>("orders.php", {
      method: "PUT",
      body: { id, status },
      requiresAuth: true,
    }),
};

// ─── Users API (Admin) ─────────────────────────────────────────

export const usersApi = {
  list: () => request<ApiUser[]>("users.php", { requiresAuth: true }),

  update: (id: string, updates: Partial<ApiUser & { password?: string }>) =>
    request<{ success: boolean }>("users.php", {
      method: "PUT",
      body: { id, ...updates },
      requiresAuth: true,
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`users.php?id=${id}`, {
      method: "DELETE",
      requiresAuth: true,
    }),
};
