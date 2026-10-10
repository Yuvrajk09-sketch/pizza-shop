from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.database import get_db
from app.models import Pizza, Topping
from app.schemas import PizzaOut, ToppingOut

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("", response_model=Dict[str, Any])
async def get_full_menu(db: AsyncSession = Depends(get_db)):
    """Fetch complete storefront menu: pizzas, toppings, and categories with availability status."""
    pizzas_res = await db.execute(select(Pizza).order_by(Pizza.id))
    pizzas = pizzas_res.scalars().all()

    toppings_res = await db.execute(select(Topping).order_by(Topping.id))
    toppings = toppings_res.scalars().all()

    categories = list(set(p.category for p in pizzas if p.category))
    if "Signature" in categories:
        categories.remove("Signature")
        categories.insert(0, "Signature")

    return {
        "pizzas": [PizzaOut.model_validate(p) for p in pizzas],
        "toppings": [ToppingOut.model_validate(t) for t in toppings],
        "categories": categories
    }

@router.get("/pizzas", response_model=List[PizzaOut])
async def get_pizzas(only_available: bool = False, db: AsyncSession = Depends(get_db)):
    """Fetch pizzas, optionally filtering by active availability."""
    query = select(Pizza).order_by(Pizza.id)
    if only_available:
        query = query.where(Pizza.is_available == True)
    res = await db.execute(query)
    pizzas = res.scalars().all()
    return [PizzaOut.model_validate(p) for p in pizzas]

@router.get("/toppings", response_model=List[ToppingOut])
async def get_toppings(only_available: bool = False, db: AsyncSession = Depends(get_db)):
    """Fetch toppings with 3D color/geometry metadata, optionally filtering by active availability."""
    query = select(Topping).order_by(Topping.id)
    if only_available:
        query = query.where(Topping.is_available == True)
    res = await db.execute(query)
    toppings = res.scalars().all()
    return [ToppingOut.model_validate(t) for t in toppings]
