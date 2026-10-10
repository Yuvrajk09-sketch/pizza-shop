import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import Order, OrderItem, Pizza, Topping
from app.schemas import OrderCreate, OrderOut
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_id() -> str:
    random_num = random.randint(10000, 99999)
    return f"SC-{random_num}"

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Create a new customer order and broadcast to admin live feed."""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item."
        )

    order_id = generate_order_id()
    # Check uniqueness
    existing = await db.execute(select(Order).where(Order.id == order_id))
    while existing.scalars().first():
        order_id = generate_order_id()
        existing = await db.execute(select(Order).where(Order.id == order_id))

    subtotal = sum(item.total_price for item in payload.items)
    delivery_fee = 3.99
    tax = round(subtotal * 0.08875, 2)  # 8.875% tax
    total_amount = round(subtotal + tax + delivery_fee, 2)

    order = Order(
        id=order_id,
        customer_name=payload.customer_name,
        customer_email=str(payload.customer_email),
        customer_phone=payload.customer_phone,
        delivery_address=payload.delivery_address,
        delivery_city=payload.delivery_city,
        delivery_notes=payload.delivery_notes,
        status="received",
        subtotal=round(subtotal, 2),
        tax=tax,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        payment_method=payload.payment_method,
        estimated_delivery_time="30-40 mins",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )

    for itm in payload.items:
        pizza_obj = None

        # 1. Validate Pizza Availability
        if itm.pizza_id:
            pizza_result = await db.execute(select(Pizza).where(Pizza.id == itm.pizza_id))
            pizza_obj = pizza_result.scalars().first()
            if not pizza_obj or not pizza_obj.is_available:
                pizza_display_name = pizza_obj.name if pizza_obj else itm.pizza_name
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pizza '{pizza_display_name}' is currently sold out."
                )
        else:
            # Check by pizza_name if it matches any signature pizza in database
            pizza_result = await db.execute(
                select(Pizza).where(func.lower(func.trim(Pizza.name)) == itm.pizza_name.strip().lower())
            )
            pizza_obj = pizza_result.scalars().first()
            if pizza_obj and not pizza_obj.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pizza '{pizza_obj.name}' is currently sold out."
                )

        # 2. Validate Toppings Availability (both custom selected and default recipe toppings)
        toppings_to_check = set(itm.selected_toppings or [])
        if pizza_obj and pizza_obj.default_toppings:
            for default_top in pizza_obj.default_toppings:
                toppings_to_check.add(default_top)

        for top_name in toppings_to_check:
            top_result = await db.execute(
                select(Topping).where(func.lower(func.trim(Topping.name)) == top_name.strip().lower())
            )
            top_obj = top_result.scalars().first()
            if top_obj and (not top_obj.is_available or (top_obj.stock_count is not None and top_obj.stock_count <= 0)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Topping '{top_obj.name}' is currently sold out."
                )

        order_item = OrderItem(
            order_id=order_id,
            pizza_id=itm.pizza_id,
            pizza_name=itm.pizza_name,
            size=itm.size,
            crust_type=itm.crust_type,
            sauce_type=itm.sauce_type,
            quantity=itm.quantity,
            unit_price=itm.unit_price,
            total_price=itm.total_price,
            selected_toppings=itm.selected_toppings
        )
        order.items.append(order_item)

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Broadcast new order event to Admin WebSocket
    order_data = OrderOut.model_validate(order).model_dump(mode="json")
    await ws_manager.broadcast("admin", {
        "event": "new_order",
        "order": order_data
    })

    return OrderOut.model_validate(order)

@router.get("/{order_id}", response_model=OrderOut)
async def get_order_by_id(order_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch order details and current status for live tracking."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found."
        )
    return OrderOut.model_validate(order)
