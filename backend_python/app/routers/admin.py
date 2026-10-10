import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List
from app.database import get_db
from app.models import Order, Pizza, Topping, User
from app.schemas import (
    OrderOut, OrderStatusUpdate,
    PizzaCreate, PizzaUpdate, PizzaOut,
    ToppingCreate, ToppingUpdate, ToppingOut,
    AnalyticsSummary
)
from app.auth import get_current_admin
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/admin", tags=["Admin Management"])

# --- Orders Management ---
@router.get("/orders", response_model=List[OrderOut])
async def get_all_orders(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin endpoint to fetch all orders ordered by creation date."""
    result = await db.execute(select(Order).order_by(desc(Order.created_at)))
    orders = result.scalars().all()
    return [OrderOut.model_validate(o) for o in orders]

@router.patch("/orders/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update order status and notify customer & admin via WebSockets."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    order.status = payload.status
    order.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(order)

    # Broadcast status change to live customer tracker and admin board
    order_data = OrderOut.model_validate(order).model_dump(mode="json")
    await ws_manager.broadcast_order_update(order_id, "status_changed", order_data)

    return OrderOut.model_validate(order)

# --- Pizza Management ---
@router.get("/pizzas", response_model=List[PizzaOut])
async def get_all_admin_pizzas(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Pizza).order_by(Pizza.id))
    pizzas = result.scalars().all()
    return [PizzaOut.model_validate(p) for p in pizzas]

@router.post("/pizzas", response_model=PizzaOut, status_code=status.HTTP_201_CREATED)
async def create_pizza(
    payload: PizzaCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = await db.execute(select(Pizza).where(Pizza.slug == payload.slug))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Pizza with this slug already exists.")

    pizza = Pizza(**payload.model_dump())
    db.add(pizza)
    await db.commit()
    await db.refresh(pizza)
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    return PizzaOut.model_validate(pizza)

@router.put("/pizzas/{pizza_id}", response_model=PizzaOut)
async def update_pizza(
    pizza_id: int,
    payload: PizzaUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Pizza).where(Pizza.id == pizza_id))
    pizza = result.scalars().first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(pizza, field, val)

    await db.commit()
    await db.refresh(pizza)
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    return PizzaOut.model_validate(pizza)

@router.patch("/pizzas/{pizza_id}/toggle-stock", response_model=PizzaOut)
async def toggle_pizza_stock(
    pizza_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Pizza).where(Pizza.id == pizza_id))
    pizza = result.scalars().first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found.")

    pizza.is_available = not pizza.is_available
    await db.commit()
    await db.refresh(pizza)
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    await ws_manager.broadcast("storefront", {"event": "menu_updated"})
    return PizzaOut.model_validate(pizza)

@router.delete("/pizzas/{pizza_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pizza(
    pizza_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Pizza).where(Pizza.id == pizza_id))
    pizza = result.scalars().first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found.")
    await db.delete(pizza)
    await db.commit()
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    return None

# --- Toppings Management ---
@router.get("/toppings", response_model=List[ToppingOut])
async def get_all_admin_toppings(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Topping).order_by(Topping.id))
    toppings = result.scalars().all()
    return [ToppingOut.model_validate(t) for t in toppings]

@router.post("/toppings", response_model=ToppingOut, status_code=status.HTTP_201_CREATED)
async def create_topping(
    payload: ToppingCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    topping = Topping(**payload.model_dump())
    db.add(topping)
    await db.commit()
    await db.refresh(topping)
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    return ToppingOut.model_validate(topping)

@router.patch("/toppings/{topping_id}/toggle-stock", response_model=ToppingOut)
async def toggle_topping_stock(
    topping_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Topping).where(Topping.id == topping_id))
    topping = result.scalars().first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found.")

    topping.is_available = not topping.is_available
    await db.commit()
    await db.refresh(topping)
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    await ws_manager.broadcast("storefront", {"event": "menu_updated"})
    return ToppingOut.model_validate(topping)

@router.delete("/toppings/{topping_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topping(
    topping_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    result = await db.execute(select(Topping).where(Topping.id == topping_id))
    topping = result.scalars().first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found.")
    await db.delete(topping)
    await db.commit()
    await ws_manager.broadcast("admin", {"event": "menu_updated"})
    return None

# --- Analytics Summary ---
@router.get("/analytics", response_model=AnalyticsSummary)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Total revenue from delivered orders
    rev_res = await db.execute(select(func.sum(Order.total_amount)).where(Order.status == "delivered"))
    total_rev = rev_res.scalar() or 0.0

    # Total orders
    orders_res = await db.execute(select(func.count(Order.id)))
    total_orders = orders_res.scalar() or 0

    # Active orders (not delivered or cancelled)
    active_res = await db.execute(select(func.count(Order.id)).where(Order.status.in_(["received", "baking", "out_for_delivery"])))
    active_orders = active_res.scalar() or 0

    # Completed orders
    comp_res = await db.execute(select(func.count(Order.id)).where(Order.status == "delivered"))
    completed_orders = comp_res.scalar() or 0

    # Low stock toppings
    low_res = await db.execute(select(func.count(Topping.id)).where(Topping.stock_count < 50))
    low_stock = low_res.scalar() or 0

    # Recent 5 orders
    recent_res = await db.execute(select(Order).order_by(desc(Order.created_at)).limit(5))
    recent_orders = recent_res.scalars().all()

    return AnalyticsSummary(
        total_revenue=round(total_rev, 2),
        total_orders=total_orders,
        active_orders=active_orders,
        completed_orders=completed_orders,
        low_stock_toppings_count=low_stock,
        recent_orders=[OrderOut.model_validate(o) for o in recent_orders]
    )
