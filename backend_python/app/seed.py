import logging
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User, Pizza, Topping, Order, OrderItem
from app.auth import get_password_hash

logger = logging.getLogger("uvicorn")

INITIAL_TOPPINGS = [
    {"name": "Pepperoni Slices", "category": "meat", "price": 2.00, "color_hex": "#D32F2F", "geometry_type": "disc", "stock_count": 120},
    {"name": "Spicy Calabrian Salami", "category": "meat", "price": 2.50, "color_hex": "#C62828", "geometry_type": "disc", "stock_count": 95},
    {"name": "Fennel Sausage", "category": "meat", "price": 2.25, "color_hex": "#8D6E63", "geometry_type": "sphere", "stock_count": 80},
    {"name": "Smoked Pancetta", "category": "meat", "price": 2.75, "color_hex": "#A1887F", "geometry_type": "cylinder", "stock_count": 60},
    {"name": "Fresh Mozzarella", "category": "cheese", "price": 1.75, "color_hex": "#FFF9C4", "geometry_type": "disc", "stock_count": 200},
    {"name": "Gorgonzola Dolce", "category": "cheese", "price": 2.25, "color_hex": "#ECEFF1", "geometry_type": "sphere", "stock_count": 45},
    {"name": "Portobello Mushrooms", "category": "veggie", "price": 1.50, "color_hex": "#6D4C41", "geometry_type": "disc", "stock_count": 110},
    {"name": "Sweet Basil Leaves", "category": "garnish", "price": 1.00, "color_hex": "#2E7D32", "geometry_type": "leaf", "stock_count": 150},
    {"name": "Kalamata Olives", "category": "veggie", "price": 1.50, "color_hex": "#212121", "geometry_type": "sphere", "stock_count": 85},
    {"name": "Fire-Roasted Peppers", "category": "veggie", "price": 1.50, "color_hex": "#E64A19", "geometry_type": "cylinder", "stock_count": 70},
    {"name": "Caramelized Red Onions", "category": "veggie", "price": 1.25, "color_hex": "#880E4F", "geometry_type": "cylinder", "stock_count": 90},
    {"name": "Sun-Dried Cherry Tomatoes", "category": "veggie", "price": 1.50, "color_hex": "#D84315", "geometry_type": "sphere", "stock_count": 75},
    {"name": "Pickled Jalapeños", "category": "veggie", "price": 1.25, "color_hex": "#388E3C", "geometry_type": "disc", "stock_count": 65},
    {"name": "Black Truffle Oil", "category": "garnish", "price": 3.00, "color_hex": "#FBC02D", "geometry_type": "cylinder", "stock_count": 30},
]

INITIAL_PIZZAS = [
    {
        "name": "Truffle Formaggio Funghi",
        "slug": "truffle-formaggio-funghi",
        "description": "Shaved black truffles, wild portobellos, fior di latte, aged pecorino, roasted garlic emulsion, and fragrant thyme butter.",
        "category": "Signature",
        "price_small": 17.99,
        "price_medium": 21.99,
        "price_large": 26.99,
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Portobello Mushrooms", "Fresh Mozzarella", "Black Truffle Oil"]
    },
    {
        "name": "Spicy Diavola Rustica",
        "slug": "spicy-diavola-rustica",
        "description": "San Marzano tomatoes, spicy Calabrian salami, house pickled jalapenos, hot clover honey drizzle, and fresh fior di latte.",
        "category": "Spicy",
        "price_small": 15.99,
        "price_medium": 19.99,
        "price_large": 24.99,
        "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Spicy Calabrian Salami", "Pickled Jalapeños", "Fresh Mozzarella"]
    },
    {
        "name": "Margherita Di Bufala",
        "slug": "margherita-di-bufala",
        "description": "DOP San Marzano tomato reduction, Campania buffalo mozzarella, cold-pressed Ligurian olive oil, and fragrant garden basil.",
        "category": "Classic",
        "price_small": 13.99,
        "price_medium": 16.99,
        "price_large": 21.99,
        "image_url": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Fresh Mozzarella", "Sweet Basil Leaves", "Sun-Dried Cherry Tomatoes"]
    },
    {
        "name": "Verde Bianca Garden",
        "slug": "verde-bianca-garden",
        "description": "Whipped garlic ricotta base, zucchini ribbons, artichoke hearts, roasted pine nuts, and house genovese basil pesto.",
        "category": "Vegetarian",
        "price_small": 14.99,
        "price_medium": 18.49,
        "price_large": 23.49,
        "image_url": "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Fresh Mozzarella", "Sweet Basil Leaves", "Fire-Roasted Peppers", "Kalamata Olives"]
    },
    {
        "name": "Carnivore Inferno Feast",
        "slug": "carnivore-inferno-feast",
        "description": "Calabrian nduja spread, crispy smoked pancetta, artisan pepperoni cups, fennel sausage, and crushed red pepper flakes.",
        "category": "Spicy",
        "price_small": 18.99,
        "price_medium": 23.99,
        "price_large": 28.99,
        "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Pepperoni Slices", "Spicy Calabrian Salami", "Fennel Sausage", "Smoked Pancetta"]
    },
    {
        "name": "Gorgonzola & Fig Balsamic",
        "slug": "gorgonzola-fig-balsamic",
        "description": "Creamy Gorgonzola Dolce, mission fig jam, caramelized red onions, peppery wild arugula, and 25-year aged Modena balsamic.",
        "category": "Signature",
        "price_small": 16.99,
        "price_medium": 20.99,
        "price_large": 25.99,
        "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
        "default_toppings": ["Gorgonzola Dolce", "Caramelized Red Onions", "Portobello Mushrooms"]
    }
]

async def seed_database(db: AsyncSession):
    # 1. Seed Admin User
    admin_result = await db.execute(select(User).where(User.email == "admin@slicecraft.com"))
    if not admin_result.scalars().first():
        admin_user = User(
            email="admin@slicecraft.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Chef Marco Moretti",
            is_admin=True
        )
        db.add(admin_user)
        logger.info("Seeded default admin user: admin@slicecraft.com / admin123")

    # 2. Seed Toppings
    for top_data in INITIAL_TOPPINGS:
        top_result = await db.execute(select(Topping).where(Topping.name == top_data["name"]))
        if not top_result.scalars().first():
            topping = Topping(**top_data)
            db.add(topping)
    
    # 3. Seed Pizzas
    for pizza_data in INITIAL_PIZZAS:
        p_result = await db.execute(select(Pizza).where(Pizza.slug == pizza_data["slug"]))
        if not p_result.scalars().first():
            pizza = Pizza(**pizza_data)
            db.add(pizza)
    
    # 4. Seed Demo Orders if none exist
    order_result = await db.execute(select(Order))
    if not order_result.scalars().first():
        demo_order_1 = Order(
            id="SC-84021",
            customer_name="Eleanor Vance",
            customer_email="eleanor.v@example.com",
            customer_phone="+1 (555) 234-8901",
            delivery_address="742 Evergreen Terrace, Apt 4B",
            delivery_city="Manhattan",
            delivery_notes="Please ring buzzer 4B, leave outside door.",
            status="baking",
            subtotal=41.98,
            tax=3.78,
            delivery_fee=3.99,
            total_amount=49.75,
            payment_method="card",
            estimated_delivery_time="25-35 mins",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=14)
        )
        item1 = OrderItem(
            order_id="SC-84021",
            pizza_name="Truffle Formaggio Funghi",
            size="large",
            crust_type="neapolitan",
            sauce_type="garlic_white",
            quantity=1,
            unit_price=26.99,
            total_price=26.99,
            selected_toppings=["Portobello Mushrooms", "Fresh Mozzarella", "Black Truffle Oil"]
        )
        item2 = OrderItem(
            order_id="SC-84021",
            pizza_name="Spicy Diavola Rustica",
            size="small",
            crust_type="thin",
            sauce_type="marinara",
            quantity=1,
            unit_price=14.99,
            total_price=14.99,
            selected_toppings=["Spicy Calabrian Salami", "Pickled Jalapeños"]
        )
        demo_order_1.items.extend([item1, item2])
        db.add(demo_order_1)

        demo_order_2 = Order(
            id="SC-84022",
            customer_name="David Sterling",
            customer_email="david.s@example.com",
            customer_phone="+1 (555) 876-1122",
            delivery_address="120 Mercer Street, Loft 3",
            delivery_city="SoHo",
            delivery_notes="Call upon arrival.",
            status="received",
            subtotal=23.99,
            tax=2.16,
            delivery_fee=3.99,
            total_amount=30.14,
            payment_method="card",
            estimated_delivery_time="35-45 mins",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
        )
        item3 = OrderItem(
            order_id="SC-84022",
            pizza_name="Carnivore Inferno Feast",
            size="medium",
            crust_type="neapolitan",
            sauce_type="marinara",
            quantity=1,
            unit_price=23.99,
            total_price=23.99,
            selected_toppings=["Pepperoni Slices", "Spicy Calabrian Salami", "Fennel Sausage"]
        )
        demo_order_2.items.append(item3)
        db.add(demo_order_2)

        demo_order_3 = Order(
            id="SC-84020",
            customer_name="Maya Lin",
            customer_email="maya.lin@example.com",
            customer_phone="+1 (555) 432-9090",
            delivery_address="450 West 33rd St, Floor 12",
            delivery_city="Hudson Yards",
            delivery_notes="Reception desk.",
            status="out_for_delivery",
            subtotal=35.48,
            tax=3.19,
            delivery_fee=3.99,
            total_amount=42.66,
            payment_method="card",
            estimated_delivery_time="10-15 mins",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=28)
        )
        item4 = OrderItem(
            order_id="SC-84020",
            pizza_name="Margherita Di Bufala",
            size="medium",
            crust_type="neapolitan",
            sauce_type="marinara",
            quantity=1,
            unit_price=16.99,
            total_price=16.99,
            selected_toppings=["Fresh Mozzarella", "Sweet Basil Leaves"]
        )
        item5 = OrderItem(
            order_id="SC-84020",
            pizza_name="Verde Bianca Garden",
            size="medium",
            crust_type="gluten_free",
            sauce_type="pesto",
            quantity=1,
            unit_price=18.49,
            total_price=18.49,
            selected_toppings=["Fresh Mozzarella", "Sweet Basil Leaves", "Fire-Roasted Peppers"]
        )
        demo_order_3.items.extend([item4, item5])
        db.add(demo_order_3)

    await db.commit()
    logger.info("Database seeding completed successfully.")
