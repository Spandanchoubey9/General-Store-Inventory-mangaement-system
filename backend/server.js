const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let products = [];
let orders = [];

// Get all products
app.get("/products", (req, res) => res.json(products));

// Add a new product
app.post("/products", (req, res) => {
    // Expecting an object with: { name, price, quantity }
    products.push(req.body);
    res.json(products);
});

// Get all orders
app.get("/orders", (req, res) => res.json(orders));

// Place a new order with inventory check
app.post("/orders", (req, res) => {
    const { customer, product, quantity } = req.body;
    
    // Find the product in the inventory
    const prodIndex = products.findIndex(p => p.name.toLowerCase() === product.toLowerCase());
    
    if (prodIndex === -1) {
        return res.status(400).json({ error: "Product not found in inventory." });
    }
    
    // Check if there is enough quantity available
    if (products[prodIndex].quantity < quantity) {
        return res.status(400).json({ error: "Not enough inventory available." });
    }
    
    // Deduct the ordered quantity from the inventory
    products[prodIndex].quantity -= quantity;
    
    // Create and store the order
    const newOrder = { customer, product, quantity };
    orders.push(newOrder);
    
    res.json({ order: newOrder, updatedProduct: products[prodIndex] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
