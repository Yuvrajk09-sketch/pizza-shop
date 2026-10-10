# 🍕 SliceCraft — State-of-the-Art Artisan Pizza Application

> An elite, full-stack wood-fired artisan pizza experience powered by **Next.js (App Router)**, **React Three Fiber (3D)**, **GSAP animations**, **Zustand**, and a **Python FastAPI** backend with **PostgreSQL (Asyncpg + SQLAlchemy)**, **JWT Authentication**, and **WebSockets**.

---

## 🌟 Key Architecture & Features

### 1. Customer Storefront (`/`)
* **Hero Experience:** High-end artisanal typography and GSAP reveals with obsidian charcoal (`#08090C`) and volcanic ember (`#FF5B26`) styling.
* **3D Interactive Configurator (`PizzaCanvas`):**
  * Real-time 3D viewport powered by **React Three Fiber** and **@react-three/drei**.
  * Procedural wood-fired crust (Neapolitan with charred spots, Thin Crisp, Chicago Deep Pan, Gluten-Free).
  * Dynamic sauces (San Marzano Marinara, Roasted Garlic White, Genovese Basil Pesto, Bourbon BBQ).
  * Concentric 3D procedural toppings (Pepperoni cups, Portobello mushrooms, Basil leaves, Kalamata olives, Bell peppers & onions).
  * Interactive OrbitControls (360° rotation, camera angles, auto-rotation toggle).
  * Real-time computed pricing ticker and "Add 3D Pizza to Cart".
* **Master Pizzaiolo Collection:**
  * Animated grid of signature pizzas with dietary tags, high-res photos, size selectors (10", 12", 16"), and GSAP ScrollTrigger reveals.
* **Global Cart & Checkout (Zustand):**
  * Glassmorphic sliding drawer with quantity adjustments, toppings breakdowns, and price calculations.
  * Encrypted checkout modal capturing customer delivery address, contact info, notes, and payment preference.
  * Triggers celebratory confetti upon placement and redirects to real-time tracking!

### 2. Real-Time Live Order Tracking (`/orders/[id]`)
* 4-Stage Live Progression Stepper with active pulsing radar:
  1. **Order Confirmed** (Recipe transmitted to pizzaiolo)
  2. **Fired in 900° Wood Oven** (Baking on Biscotto clay)
  3. **Courier Dispatched** (Thermal hot-bag locked on high-speed delivery)
  4. **Arrived at Doorstep** (Enjoy piping-hot artisan craftsmanship)
* **Live WebSockets:** Directly connected to FastAPI `ws://127.0.0.1:8000/api/ws/orders/{id}` for instant status updates when kitchen advances the order without any page refresh!
* Simulated live courier route telemetry HUD and itemized financial receipt.

### 3. Chef's Admin Command Center (`/admin`)
* **Secure JWT Login:** Protected route with seeded Master Pizzaiolo credentials.
* **Live Kitchen Kanban Board:**
  * 4 Live Lanes: *New Orders*, *In Oven (900°)*, *Out with Courier*, *Delivered / Completed*.
  * Connected to `ws://127.0.0.1:8000/api/ws/admin` for real-time incoming order audio/visual pings.
  * One-click status triggers (`Move to Oven` -> `Dispatch Courier` -> `Mark Delivered`) that instantly notify customers via WebSockets.
* **Inventory & Stock Control:**
  * Live toggles to mark toppings or signature pizzas *In Stock* or *Sold Out*.
* **Executive KPI Cards:** Live revenue, active kitchen orders count, total volume, and ingredient stock alerts.

---

## 🛠️ Tech Stack & Directory Structure

```
newone/
├── frontend/                # Next.js 16 (App Router) + Tailwind CSS + Three.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Storefront & 3D Configurator
│   │   │   ├── orders/[id]/page.tsx   # Live Order Tracking with WebSockets
│   │   │   ├── admin/page.tsx         # Dark-Glassmorphic Admin Kanban & Stock
│   │   │   ├── globals.css            # Obsidian & Ember Design System
│   │   │   └── layout.tsx             # Root Metadata & Fonts
│   │   ├── components/
│   │   │   ├── 3d/PizzaCanvas.tsx     # Three.js / React Three Fiber Studio
│   │   │   ├── Navbar.tsx             # Glassmorphic Header & Cart Trigger
│   │   │   ├── Hero.tsx               # GSAP Typography & Metrics
│   │   │   ├── MenuSection.tsx        # Signature Menu & GSAP ScrollTrigger
│   │   │   ├── CartDrawer.tsx         # Sliding Zustand Cart
│   │   │   └── CheckoutModal.tsx      # Order Checkout & Confetti
│   │   ├── store/useCartStore.ts      # Global Zustand Cart & 3D State
│   │   ├── types/pizza.ts             # TypeScript Models & Interfaces
│   │   └── lib/api.ts                 # Typed FastAPI Client with Fallback
│   └── package.json
│
└── backend/                 # FastAPI (Async Python) + PostgreSQL
    ├── app/
    │   ├── main.py                    # App entry, CORS & Lifespan Seeder
    │   ├── config.py                  # Settings (DATABASE_URL, JWT_SECRET)
    │   ├── database.py                # Async engine & resilient SQLite fallback
    │   ├── models.py                  # SQLAlchemy ORM (Pizzas, Toppings, Orders, Users)
    │   ├── schemas.py                 # Pydantic v2 validation models
    │   ├── auth.py                    # Passlib bcrypt & JWT token auth
    │   ├── seed.py                    # Gourmet menu, toppings & admin seeder
    │   ├── websocket_manager.py       # Live order & admin push sockets
    │   └── routers/
    │       ├── menu.py                # GET /api/menu
    │       ├── orders.py              # POST /api/orders & GET /api/orders/{id}
    │       ├── auth.py                # POST /api/auth/login & GET /api/auth/me
    │       ├── admin.py               # Kanban CRUD, Stock toggles & Analytics
    │       └── ws.py                  # Live customer & admin WebSockets
    ├── requirements.txt
    └── .env
```

---

## ⚡ How to Connect Your PostgreSQL Database

The backend is built with a smart auto-detecting database engine:
1. When your PostgreSQL instance is ready, open [`backend/.env`](file:///c:/Users/ASUS/Desktop/newone/backend/.env) and set your connection URL:
   ```env
   DATABASE_URL=postgresql+asyncpg://<username>:<password>@localhost:5432/<database_name>
   ```
2. Restart the backend. It will connect to PostgreSQL, automatically execute `create_all` to build the tables, and seed the default admin, toppings, pizzas, and demo orders.
3. *Note:* While PostgreSQL was installing, the backend automatically used a local async database (`pizza_app.db`) so development never stopped and you can test the entire app right now!

---

## 🚀 Running the Project

### 1. Backend (FastAPI + Async Python)
```powershell
cd backend
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API URL:** `http://127.0.0.1:8000`
* **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`

### 2. Frontend (Next.js)
```powershell
cd frontend
npm run dev -- -p 3000
```
* **Storefront:** `http://localhost:3000`
* **Chef's Admin:** `http://localhost:3000/admin`
* **Demo Order Tracking:** `http://localhost:3000/orders/SC-84021`

---

## 🔑 Default Admin Credentials

* **Email:** `admin@slicecraft.com`
* **Password:** `admin123`
