from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# --- Topping Schemas ---
class ToppingBase(BaseModel):
    name: str
    category: str = "veggie"
    price: float = 1.50
    color_hex: str = "#FF5722"
    geometry_type: str = "sphere"
    is_available: bool = True
    stock_count: int = 100

class ToppingCreate(ToppingBase):
    pass

class ToppingUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    color_hex: Optional[str] = None
    geometry_type: Optional[str] = None
    is_available: Optional[bool] = None
    stock_count: Optional[int] = None

class ToppingOut(ToppingBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Pizza Schemas ---
class PizzaBase(BaseModel):
    name: str
    slug: str
    description: str
    category: str = "Signature"
    price_small: float = 14.99
    price_medium: float = 18.99
    price_large: float = 22.99
    image_url: Optional[str] = None
    is_available: bool = True
    is_custom: bool = False
    default_toppings: List[str] = []

class PizzaCreate(PizzaBase):
    pass

class PizzaUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_small: Optional[float] = None
    price_medium: Optional[float] = None
    price_large: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_custom: Optional[bool] = None
    default_toppings: Optional[List[str]] = None

class PizzaOut(PizzaBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    pizza_id: Optional[int] = None
    pizza_name: str
    size: str = "medium"
    crust_type: str = "neapolitan"
    sauce_type: str = "marinara"
    quantity: int = Field(default=1, ge=1)
    unit_price: float
    total_price: float
    selected_toppings: List[str] = []

class OrderItemOut(OrderItemCreate):
    id: int
    order_id: str

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    delivery_address: str
    delivery_city: str = "New York"
    delivery_notes: Optional[str] = None
    payment_method: str = "card"
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str  # received, baking, out_for_delivery, delivered, cancelled

class OrderOut(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    delivery_city: str
    delivery_notes: Optional[str] = None
    status: str
    subtotal: float
    tax: float
    delivery_fee: float
    total_amount: float
    payment_method: str
    estimated_delivery_time: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    email: str
    is_admin: bool

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_admin: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# --- Analytics Schemas ---
class AnalyticsSummary(BaseModel):
    total_revenue: float
    total_orders: int
    active_orders: int
    completed_orders: int
    low_stock_toppings_count: int
    recent_orders: List[OrderOut]
