export interface Topping {
  id: number;
  name: string;
  category: 'meat' | 'cheese' | 'veggie' | 'sauce' | 'garnish';
  price: number;
  color_hex: string;
  geometry_type: 'disc' | 'sphere' | 'cylinder' | 'leaf';
  is_available: boolean;
  stock_count: number;
}

export interface Pizza {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  price_small: number;
  price_medium: number;
  price_large: number;
  image_url: string;
  is_available: boolean;
  is_custom: boolean;
  default_toppings: string[];
}

export type CrustType = 'neapolitan' | 'thin' | 'deep_dish' | 'gluten_free';
export type SauceType = 'marinara' | 'garlic_white' | 'pesto' | 'bbq';
export type PizzaSize = 'small' | 'medium' | 'large';

export interface CartItem {
  id: string; // unique cart uuid
  pizza_id?: number;
  pizza_name: string;
  size: PizzaSize;
  crust_type: CrustType;
  sauce_type: SauceType;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_toppings: string[];
  is_custom: boolean;
  image_url?: string;
}

export type OrderStatus = 
  | 'received' 
  | 'baking' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItemOut {
  id: number;
  order_id: string;
  pizza_id?: number;
  pizza_name: string;
  size: string;
  crust_type: string;
  sauce_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_toppings: string[];
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_notes?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItemOut[];
}

export interface AnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  low_stock_toppings_count: number;
  recent_orders: Order[];
}
