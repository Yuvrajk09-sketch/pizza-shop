import axios, { isAxiosError } from 'axios';
import { Pizza, Topping, Order, AnalyticsSummary } from '@/types/pizza';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
      }
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
    if (error.response?.status === 401) {
      return '401 Unauthorized: Session invalid or expired';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// Fallback seed data in case API server is spinning up
export const FALLBACK_TOPPINGS: Topping[] = [
  { id: 1, name: "Pepperoni Slices", category: "meat", price: 99.00, color_hex: "#D32F2F", geometry_type: "disc", is_available: true, stock_count: 120 },
  { id: 2, name: "Spicy Calabrian Salami", category: "meat", price: 119.00, color_hex: "#C62828", geometry_type: "disc", is_available: true, stock_count: 95 },
  { id: 3, name: "Fennel Sausage", category: "meat", price: 109.00, color_hex: "#8D6E63", geometry_type: "sphere", is_available: true, stock_count: 80 },
  { id: 4, name: "Smoked Pancetta", category: "meat", price: 129.00, color_hex: "#A1887F", geometry_type: "cylinder", is_available: true, stock_count: 60 },
  { id: 5, name: "Fresh Mozzarella", category: "cheese", price: 89.00, color_hex: "#FFF9C4", geometry_type: "disc", is_available: true, stock_count: 200 },
  { id: 6, name: "Gorgonzola Dolce", category: "cheese", price: 119.00, color_hex: "#ECEFF1", geometry_type: "sphere", is_available: true, stock_count: 45 },
  { id: 7, name: "Portobello Mushrooms", category: "veggie", price: 69.00, color_hex: "#6D4C41", geometry_type: "disc", is_available: true, stock_count: 110 },
  { id: 8, name: "Sweet Basil Leaves", category: "garnish", price: 49.00, color_hex: "#2E7D32", geometry_type: "leaf", is_available: true, stock_count: 150 },
  { id: 9, name: "Kalamata Olives", category: "veggie", price: 69.00, color_hex: "#212121", geometry_type: "sphere", is_available: true, stock_count: 85 },
  { id: 10, name: "Fire-Roasted Peppers", category: "veggie", price: 69.00, color_hex: "#E64A19", geometry_type: "cylinder", is_available: true, stock_count: 70 },
  { id: 11, name: "Caramelized Red Onions", category: "veggie", price: 59.00, color_hex: "#880E4F", geometry_type: "cylinder", is_available: true, stock_count: 90 },
  { id: 12, name: "Sun-Dried Cherry Tomatoes", category: "veggie", price: 69.00, color_hex: "#D84315", geometry_type: "sphere", is_available: true, stock_count: 75 },
  { id: 13, name: "Pickled Jalapeños", category: "veggie", price: 59.00, color_hex: "#388E3C", geometry_type: "disc", is_available: true, stock_count: 65 },
  { id: 14, name: "Black Truffle Oil", category: "garnish", price: 149.00, color_hex: "#FBC02D", geometry_type: "cylinder", is_available: true, stock_count: 30 },
];

export const FALLBACK_PIZZAS: Pizza[] = [
  {
    id: 1,
    name: "Truffle Formaggio Funghi",
    slug: "truffle-formaggio-funghi",
    description: "Shaved black truffles, wild portobellos, fior di latte, aged pecorino, roasted garlic emulsion, and fragrant thyme butter.",
    category: "Signature",
    price_small: 699.00,
    price_medium: 899.00,
    price_large: 1149.00,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Portobello Mushrooms", "Fresh Mozzarella", "Black Truffle Oil"]
  },
  {
    id: 2,
    name: "Spicy Diavola Rustica",
    slug: "spicy-diavola-rustica",
    description: "San Marzano tomatoes, spicy Calabrian salami, house pickled jalapenos, hot clover honey drizzle, and fresh fior di latte.",
    category: "Spicy",
    price_small: 599.00,
    price_medium: 799.00,
    price_large: 1049.00,
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Spicy Calabrian Salami", "Pickled Jalapeños", "Fresh Mozzarella"]
  },
  {
    id: 3,
    name: "Margherita Di Bufala",
    slug: "margherita-di-bufala",
    description: "DOP San Marzano tomato reduction, Campania buffalo mozzarella, cold-pressed Ligurian olive oil, and fragrant garden basil.",
    category: "Classic",
    price_small: 499.00,
    price_medium: 699.00,
    price_large: 899.00,
    image_url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Fresh Mozzarella", "Sweet Basil Leaves", "Sun-Dried Cherry Tomatoes"]
  },
  {
    id: 4,
    name: "Verde Bianca Garden",
    slug: "verde-bianca-garden",
    description: "Whipped garlic ricotta base, zucchini ribbons, artichoke hearts, roasted pine nuts, and house genovese basil pesto.",
    category: "Vegetarian",
    price_small: 549.00,
    price_medium: 749.00,
    price_large: 949.00,
    image_url: "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Fresh Mozzarella", "Sweet Basil Leaves", "Fire-Roasted Peppers", "Kalamata Olives"]
  },
  {
    id: 5,
    name: "Carnivore Inferno Feast",
    slug: "carnivore-inferno-feast",
    description: "Calabrian nduja spread, crispy smoked pancetta, artisan pepperoni cups, fennel sausage, and crushed red pepper flakes.",
    category: "Spicy",
    price_small: 749.00,
    price_medium: 949.00,
    price_large: 1199.00,
    image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Pepperoni Slices", "Spicy Calabrian Salami", "Fennel Sausage", "Smoked Pancetta"]
  },
  {
    id: 6,
    name: "Gorgonzola & Fig Balsamic",
    slug: "gorgonzola-fig-balsamic",
    description: "Creamy Gorgonzola Dolce, mission fig jam, caramelized red onions, peppery wild arugula, and 25-year aged Modena balsamic.",
    category: "Signature",
    price_small: 649.00,
    price_medium: 849.00,
    price_large: 1099.00,
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Gorgonzola Dolce", "Caramelized Red Onions", "Portobello Mushrooms"]
  }
];

export async function fetchMenu(): Promise<{ pizzas: Pizza[]; toppings: Topping[]; categories: string[] }> {
  try {
    const res = await api.get<{ pizzas: Pizza[]; toppings: Topping[]; categories: string[] }>('/menu');
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using rich fallback menu:', err);
    return {
      pizzas: FALLBACK_PIZZAS,
      toppings: FALLBACK_TOPPINGS,
      categories: ['Signature', 'Classic', 'Spicy', 'Vegetarian'],
    };
  }
}

export async function submitOrder(orderData: any, token?: string): Promise<Order> {
  try {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('user_token') : null);
    if (!authToken) {
      throw new Error('Authentication required: Please sign in to place an order.');
    }
    const res = await api.post<Order>('/orders', orderData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to submit order'));
  }
}

export async function verifyOrderPayment(orderId: string): Promise<Order> {
  try {
    const res = await api.post<Order>(`/orders/${orderId}/verify-payment`);
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Payment verification failed'));
  }
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  try {
    const res = await api.get<Order[]>('/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to fetch orders'));
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    console.warn(`Could not fetch order ${id} from server:`, err);
    return null;
  }
}

export async function fetchCurrentUser(token: string): Promise<{ id: number; full_name: string; email: string; delivery_address: string; phone: string; is_admin: boolean }> {
  try {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to fetch user profile'));
  }
}

export async function updateCurrentUser(token: string, data: { full_name?: string; delivery_address?: string; phone?: string }): Promise<{ id: number; full_name: string; email: string; delivery_address: string; phone: string }> {
  try {
    const res = await api.put('/auth/me', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to update profile'));
  }
}

export async function verifyAdminToken(token: string): Promise<{ id: number; email: string; full_name: string; is_admin: boolean }> {
  try {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data.is_admin) {
      throw new Error('403 Forbidden: Administrator rights required');
    }
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
      throw new Error('401 Unauthorized: Session invalid or expired');
    }
    if (err instanceof Error && err.message.includes('403')) {
      throw err;
    }
    throw new Error(getErrorMessage(err, 'Failed to verify admin token'));
  }
}

export async function loginAdmin(email: string, password: string): Promise<{ access_token: string; user_name: string; is_admin: boolean }> {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (!res.data.is_admin) {
      throw new Error('Access denied: Administrator credentials required');
    }
    return res.data;
  } catch (err) {
    if (err instanceof Error && err.message.includes('Access denied')) {
      throw err;
    }
    throw new Error(getErrorMessage(err, 'Invalid email or password'));
  }
}

export async function loginUser(email: string, password: string): Promise<{ access_token: string; user_name: string; email: string; is_admin?: boolean }> {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Invalid email or password'));
  }
}

export async function registerUser(email: string, password: string, full_name: string): Promise<{ access_token: string; user_name: string; email: string; is_admin?: boolean }> {
  try {
    const res = await api.post('/auth/register', { email, password, full_name });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Registration failed'));
  }
}

export async function verifyUserToken(token: string): Promise<{ id: number; email: string; full_name: string; is_admin: boolean }> {
  try {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error('401 Unauthorized: Session invalid or expired');
  }
}

export async function fetchAdminOrders(token: string): Promise<Order[]> {
  try {
    const res = await api.get<Order[]>('/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) throw new Error('401 Unauthorized');
    throw new Error(getErrorMessage(err, 'Failed to fetch admin orders'));
  }
}

export async function updateOrderStatus(orderId: string, status: string, token: string): Promise<Order> {
  try {
    const res = await api.patch<Order>(`/admin/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) throw new Error('401 Unauthorized');
    throw new Error(getErrorMessage(err, 'Failed to update order status'));
  }
}

export async function fetchAdminAnalytics(token: string): Promise<AnalyticsSummary> {
  try {
    const res = await api.get<AnalyticsSummary>('/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) throw new Error('401 Unauthorized');
    throw new Error(getErrorMessage(err, 'Failed to fetch analytics'));
  }
}

export async function togglePizzaStock(pizzaId: number, token: string): Promise<Pizza> {
  try {
    const res = await api.patch<Pizza>(`/admin/pizzas/${pizzaId}/toggle-stock`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) throw new Error('401 Unauthorized');
    throw new Error(getErrorMessage(err, 'Failed to toggle pizza stock'));
  }
}

export async function toggleToppingStock(toppingId: number, token: string): Promise<Topping> {
  try {
    const res = await api.patch<Topping>(`/admin/toppings/${toppingId}/toggle-stock`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) throw new Error('401 Unauthorized');
    throw new Error(getErrorMessage(err, 'Failed to toggle topping stock'));
  }
}

