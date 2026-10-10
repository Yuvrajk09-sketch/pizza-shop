import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    orders = relationship("Order", back_populates="user", lazy="selectin")

class Pizza(Base):
    __tablename__ = "pizzas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Signature", index=True)
    price_small = Column(Float, default=14.99)
    price_medium = Column(Float, default=18.99)
    price_large = Column(Float, default=22.99)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True)
    is_custom = Column(Boolean, default=False)
    default_toppings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Topping(Base):
    __tablename__ = "toppings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default="veggie")  # meat, cheese, veggie, sauce, garnish
    price = Column(Float, default=1.50)
    color_hex = Column(String(20), default="#FF5722")
    geometry_type = Column(String(50), default="sphere")  # disc, sphere, cylinder, leaf
    is_available = Column(Boolean, default=True)
    stock_count = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True)  # e.g., "SC-78492"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_city = Column(String(100), default="New York")
    delivery_notes = Column(Text, nullable=True)
    status = Column(String(50), default="received", index=True)  # received, baking, out_for_delivery, delivered, cancelled
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=3.99)
    total_amount = Column(Float, default=0.0)
    payment_method = Column(String(50), default="card")  # card, cash
    estimated_delivery_time = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    user = relationship("User", back_populates="orders")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    pizza_id = Column(Integer, ForeignKey("pizzas.id"), nullable=True)
    pizza_name = Column(String(255), nullable=False)
    size = Column(String(50), default="medium")  # small, medium, large
    crust_type = Column(String(50), default="neapolitan")
    sauce_type = Column(String(50), default="marinara")
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    selected_toppings = Column(JSON, default=list)

    order = relationship("Order", back_populates="items")
