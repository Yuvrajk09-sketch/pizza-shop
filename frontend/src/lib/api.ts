import { Pizza, Topping, Order, AnalyticsSummary } from '@/types/pizza';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Fallback seed data in case API server is spinning up
export const FALLBACK_TOPPINGS: Topping[] = [
  { id: 1, name: "Pepperoni Slices", category: "meat", price: 2.00, color_hex: "#D32F2F", geometry_type: "disc", is_available: true, stock_count: 120 },
  { id: 2, name: "Spicy Calabrian Salami", category: "meat", price: 2.50, color_hex: "#C62828", geometry_type: "disc", is_available: true, stock_count: 95 },
  { id: 3, name: "Fennel Sausage", category: "meat", price: 2.25, color_hex: "#8D6E63", geometry_type: "sphere", is_available: true, stock_count: 80 },
  { id: 4, name: "Smoked Pancetta", category: "meat", price: 2.75, color_hex: "#A1887F", geometry_type: "cylinder", is_available: true, stock_count: 60 },
  { id: 5, name: "Fresh Mozzarella", category: "cheese", price: 1.75, color_hex: "#FFF9C4", geometry_type: "disc", is_available: true, stock_count: 200 },
  { id: 6, name: "Gorgonzola Dolce", category: "cheese", price: 2.25, color_hex: "#ECEFF1", geometry_type: "sphere", is_available: true, stock_count: 45 },
  { id: 7, name: "Portobello Mushrooms", category: "veggie", price: 1.50, color_hex: "#6D4C41", geometry_type: "disc", is_available: true, stock_count: 110 },
  { id: 8, name: "Sweet Basil Leaves", category: "garnish", price: 1.00, color_hex: "#2E7D32", geometry_type: "leaf", is_available: true, stock_count: 150 },
  { id: 9, name: "Kalamata Olives", category: "veggie", price: 1.50, color_hex: "#212121", geometry_type: "sphere", is_available: true, stock_count: 85 },
  { id: 10, name: "Fire-Roasted Peppers", category: "veggie", price: 1.50, color_hex: "#E64A19", geometry_type: "cylinder", is_available: true, stock_count: 70 },
  { id: 11, name: "Caramelized Red Onions", category: "veggie", price: 1.25, color_hex: "#880E4F", geometry_type: "cylinder", is_available: true, stock_count: 90 },
  { id: 12, name: "Sun-Dried Cherry Tomatoes", category: "veggie", price: 1.50, color_hex: "#D84315", geometry_type: "sphere", is_available: true, stock_count: 75 },
  { id: 13, name: "Pickled Jalapeños", category: "veggie", price: 1.25, color_hex: "#388E3C", geometry_type: "disc", is_available: true, stock_count: 65 },
  { id: 14, name: "Black Truffle Oil", category: "garnish", price: 3.00, color_hex: "#FBC02D", geometry_type: "cylinder", is_available: true, stock_count: 30 },
];

export const FALLBACK_PIZZAS: Pizza[] = [
  {
    id: 1,
    name: "Truffle Formaggio Funghi",
    slug: "truffle-formaggio-funghi",
    description: "Shaved black truffles, wild portobellos, fior di latte, aged pecorino, roasted garlic emulsion, and fragrant thyme butter.",
    category: "Signature",
    price_small: 17.99,
    price_medium: 21.99,
    price_large: 26.99,
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
    price_small: 15.99,
    price_medium: 19.99,
    price_large: 24.99,
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
    price_small: 13.99,
    price_medium: 16.99,
    price_large: 21.99,
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
    price_small: 14.99,
    price_medium: 18.49,
    price_large: 23.49,
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
    price_small: 18.99,
    price_medium: 23.99,
    price_large: 28.99,
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
    price_small: 16.99,
    price_medium: 20.99,
    price_large: 25.99,
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
    is_available: true,
    is_custom: false,
    default_toppings: ["Gorgonzola Dolce", "Caramelized Red Onions", "Portobello Mushrooms"]
  }
];

export async function fetchMenu(): Promise<{ pizzas: Pizza[]; toppings: Topping[]; categories: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/menu`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return await res.json();
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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let errorMessage = 'Failed to submit order';
    if (Array.isArray(errData.detail)) {
      errorMessage = errData.detail.map((e: any) => e.msg).join(', ');
    } else if (errData.detail) {
      errorMessage = errData.detail;
    }
    throw new Error(errorMessage);
  }
  return await res.json();
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Order not found');
    return await res.json();
  } catch (err) {
    console.warn(`Could not fetch order ${id} from server:`, err);
    // Return mock order for instant testing if offline
    return {
      id,
      customer_name: "Demo Customer",
      customer_email: "demo@slicecraft.com",
      customer_phone: "+1 (555) 234-8901",
      delivery_address: "742 Evergreen Terrace, Apt 4B",
      delivery_city: "Manhattan",
      delivery_notes: "Leave by doorstep",
      status: "baking",
      subtotal: 39.98,
      tax: 3.55,
      delivery_fee: 3.99,
      total_amount: 47.52,
      payment_method: "card",
      estimated_delivery_time: "20-30 mins",
      created_at: new Date().toISOString(),
      items: [
        {
          id: 1,
          order_id: id,
          pizza_name: "Truffle Formaggio Funghi",
          size: "large",
          crust_type: "neapolitan",
          sauce_type: "garlic_white",
          quantity: 1,
          unit_price: 26.99,
          total_price: 26.99,
          selected_toppings: ["Portobello Mushrooms", "Fresh Mozzarella", "Black Truffle Oil"]
        }
      ]
    };
  }
}

export async function verifyAdminToken(token: string): Promise<{ id: number; email: string; full_name: string; is_admin: boolean }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 401 || !res.ok) {
    throw new Error('401 Unauthorized: Session invalid or expired');
  }
  const data = await res.json();
  if (!data.is_admin) {
    throw new Error('403 Forbidden: Administrator rights required');
  }
  return data;
}

export async function loginAdmin(email: string, password: string): Promise<{ access_token: string; user_name: string; is_admin: boolean }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  const data = await res.json();
  if (!data.is_admin) {
    throw new Error('Access denied: Administrator credentials required');
  }
  return data;
}

export async function loginUser(email: string, password: string): Promise<{ access_token: string; user_name: string; email: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  return await res.json();
}

export async function registerUser(email: string, password: string, full_name: string): Promise<{ access_token: string; user_name: string; email: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed');
  }
  return await res.json();
}

export async function verifyUserToken(token: string): Promise<{ id: number; email: string; full_name: string; is_admin: boolean }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 401 || !res.ok) {
    throw new Error('401 Unauthorized: Session invalid or expired');
  }
  return await res.json();
}

export async function fetchAdminOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 401) throw new Error('401 Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch admin orders');
  return await res.json();
}

export async function updateOrderStatus(orderId: string, status: string, token: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) throw new Error('401 Unauthorized');
  if (!res.ok) throw new Error('Failed to update order status');
  return await res.json();
}

export async function fetchAdminAnalytics(token: string): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 401) throw new Error('401 Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}

export async function togglePizzaStock(pizzaId: number, token: string): Promise<Pizza> {
  const res = await fetch(`${API_BASE}/admin/pizzas/${pizzaId}/toggle-stock`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('401 Unauthorized');
  if (!res.ok) throw new Error('Failed to toggle pizza stock');
  return await res.json();
}

export async function toggleToppingStock(toppingId: number, token: string): Promise<Topping> {
  const res = await fetch(`${API_BASE}/admin/toppings/${toppingId}/toggle-stock`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('401 Unauthorized');
  if (!res.ok) throw new Error('Failed to toggle topping stock');
  return await res.json();
}

