const bcrypt = require('bcrypt');
const { sequelize, User, Pizza, Topping } = require('./models');

const INITIAL_TOPPINGS = [
    {name: "Pepperoni Slices", category: "meat", price: 99.00, color_hex: "#D32F2F", geometry_type: "disc", stock_count: 120},
    {name: "Spicy Calabrian Salami", category: "meat", price: 119.00, color_hex: "#C62828", geometry_type: "disc", stock_count: 95},
    {name: "Fennel Sausage", category: "meat", price: 109.00, color_hex: "#8D6E63", geometry_type: "sphere", stock_count: 80},
    {name: "Smoked Pancetta", category: "meat", price: 129.00, color_hex: "#A1887F", geometry_type: "cylinder", stock_count: 60},
    {name: "Fresh Mozzarella", category: "cheese", price: 89.00, color_hex: "#FFF9C4", geometry_type: "disc", stock_count: 200},
    {name: "Gorgonzola Dolce", category: "cheese", price: 119.00, color_hex: "#ECEFF1", geometry_type: "sphere", stock_count: 45},
    {name: "Portobello Mushrooms", category: "veggie", price: 69.00, color_hex: "#6D4C41", geometry_type: "disc", stock_count: 110},
    {name: "Sweet Basil Leaves", category: "garnish", price: 49.00, color_hex: "#2E7D32", geometry_type: "leaf", stock_count: 150},
    {name: "Kalamata Olives", category: "veggie", price: 69.00, color_hex: "#212121", geometry_type: "sphere", stock_count: 85},
    {name: "Fire-Roasted Peppers", category: "veggie", price: 69.00, color_hex: "#E64A19", geometry_type: "cylinder", stock_count: 70},
    {name: "Caramelized Red Onions", category: "veggie", price: 59.00, color_hex: "#880E4F", geometry_type: "cylinder", stock_count: 90},
    {name: "Sun-Dried Cherry Tomatoes", category: "veggie", price: 69.00, color_hex: "#D84315", geometry_type: "sphere", stock_count: 75},
    {name: "Pickled Jalapeños", category: "veggie", price: 59.00, color_hex: "#388E3C", geometry_type: "disc", stock_count: 65},
    {name: "Black Truffle Oil", category: "garnish", price: 149.00, color_hex: "#FBC02D", geometry_type: "cylinder", stock_count: 30}
];

const INITIAL_PIZZAS = [
    {
        name: "Truffle Formaggio Funghi", slug: "truffle-formaggio-funghi", category: "Signature", price_small: 699.00, price_medium: 899.00, price_large: 1149.00,
        description: "Shaved black truffles, wild portobellos, fior di latte, aged pecorino, roasted garlic emulsion, and fragrant thyme butter.",
        image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Portobello Mushrooms", "Fresh Mozzarella", "Black Truffle Oil"]
    },
    {
        name: "Spicy Diavola Rustica", slug: "spicy-diavola-rustica", category: "Spicy", price_small: 599.00, price_medium: 799.00, price_large: 1049.00,
        description: "San Marzano tomatoes, spicy Calabrian salami, house pickled jalapenos, hot clover honey drizzle, and fresh fior di latte.",
        image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Spicy Calabrian Salami", "Pickled Jalapeños", "Fresh Mozzarella"]
    },
    {
        name: "Margherita Di Bufala", slug: "margherita-di-bufala", category: "Classic", price_small: 499.00, price_medium: 699.00, price_large: 899.00,
        description: "DOP San Marzano tomato reduction, Campania buffalo mozzarella, cold-pressed Ligurian olive oil, and fragrant garden basil.",
        image_url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Fresh Mozzarella", "Sweet Basil Leaves", "Sun-Dried Cherry Tomatoes"]
    },
    {
        name: "Verde Bianca Garden", slug: "verde-bianca-garden", category: "Vegetarian", price_small: 549.00, price_medium: 749.00, price_large: 949.00,
        description: "Whipped garlic ricotta base, zucchini ribbons, artichoke hearts, roasted pine nuts, and house genovese basil pesto.",
        image_url: "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Fresh Mozzarella", "Sweet Basil Leaves", "Fire-Roasted Peppers", "Kalamata Olives"]
    },
    {
        name: "Carnivore Inferno Feast", slug: "carnivore-inferno-feast", category: "Spicy", price_small: 749.00, price_medium: 949.00, price_large: 1199.00,
        description: "Calabrian nduja spread, crispy smoked pancetta, artisan pepperoni cups, fennel sausage, and crushed red pepper flakes.",
        image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Pepperoni Slices", "Spicy Calabrian Salami", "Fennel Sausage", "Smoked Pancetta"]
    },
    {
        name: "Gorgonzola & Fig Balsamic", slug: "gorgonzola-fig-balsamic", category: "Signature", price_small: 649.00, price_medium: 849.00, price_large: 1099.00,
        description: "Creamy Gorgonzola Dolce, mission fig jam, caramelized red onions, peppery wild arugula, and 25-year aged Modena balsamic.",
        image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
        default_toppings: ["Gorgonzola Dolce", "Caramelized Red Onions", "Portobello Mushrooms"]
    }
];

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database reset!");

    const hashed_password = await bcrypt.hash("admin123", 10);
    await User.findOrCreate({
      where: { email: "admin@slicecraft.com" },
      defaults: {
        hashed_password,
        full_name: "Chef Marco Moretti",
        is_admin: true
      }
    });

    for (const top of INITIAL_TOPPINGS) {
      await Topping.findOrCreate({ where: { name: top.name }, defaults: top });
    }

    for (const piz of INITIAL_PIZZAS) {
      await Pizza.findOrCreate({ where: { slug: piz.slug }, defaults: piz });
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
