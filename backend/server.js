const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

app.use(cors());
app.use(express.json());

const users = [
    { email: "admin@example.com", password: "admin123", role: "admin", name: "Admin User" },
    { email: "user@example.com", password: "user123", role: "user", name: "Regular User" }
];

let products = [];
let orders = [];

function createProduct(payload) {
    return {
        id: payload.id,
        name: payload.name,
        brand: payload.brand || "Generic",
        price: Number(payload.price) || 0,
        quantity: Number(payload.quantity) || 0,
        views: Number(payload.views) || 0,
        lastViewed: payload.lastViewed || null
    };
}

function createOrder(payload) {
    return {
        orderId: payload.orderId || `ORD-${Date.now()}`,
        productId: payload.productId,
        productName: payload.productName,
        brand: payload.brand || "Generic",
        price: Number(payload.price) || 0,
        quantity: Number(payload.quantity) || 0,
        status: payload.status || "Confirmed",
        timestamp: payload.timestamp || new Date().toISOString()
    };
}

function computeStats() {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const topProduct = orders.reduce((map, order) => {
        const key = order.productId || `${order.productName}-${order.brand}`;
        if (!map[key]) {
            map[key] = { productName: order.productName, brand: order.brand, quantity: 0, revenue: 0 };
        }
        map[key].quantity += order.quantity;
        map[key].revenue += order.price * order.quantity;
        return map;
    }, {});

    const topProducts = Object.values(topProduct).sort((a, b) => b.revenue - a.revenue);
    const topViewed = products.slice().sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null;

    return {
        totalRevenue,
        totalOrders,
        totalProducts,
        topProduct: topProducts[0] || null,
        topViewed
    };
}

async function verifyGoogleToken(idToken) {
    if (!googleClient) {
        return { email: "google.user@example.com", name: "Google User" };
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        email: payload.email,
        name: payload.name || payload.email
    };
}

app.get("/health", (req, res) => {
    res.json({ status: "ok", backend: true });
});

app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({ user: { email: user.email, name: user.name, role: user.role } });
});

app.post("/auth/google", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: "Google ID token is required" });
    }

    try {
        const googleUser = await verifyGoogleToken(idToken);
        let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
        if (!user) {
            user = {
                email: googleUser.email,
                password: "",
                role: "user",
                name: googleUser.name
            };
            users.push(user);
        }
        return res.json({ user: { email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        return res.status(401).json({ error: "Unable to verify Google token" });
    }
});

app.get("/products", (req, res) => res.json(products));

app.post("/products", (req, res) => {
    const item = createProduct(req.body);
    if (!item.id || !item.name) {
        return res.status(400).json({ error: "Product id and name are required" });
    }

    const existingIndex = products.findIndex(p => p.id === item.id);
    if (existingIndex !== -1) {
        products[existingIndex] = { ...products[existingIndex], ...item };
        return res.json(products[existingIndex]);
    }

    products.push(item);
    return res.json(item);
});

app.get("/orders", (req, res) => res.json(orders));

app.post("/orders", (req, res) => {
    const payload = req.body;
    const product = products.find(p => p.id === payload.productId);

    if (!product) {
        return res.status(400).json({ error: "Product not found" });
    }
    if (product.quantity < payload.quantity) {
        return res.status(400).json({ error: "Insufficient inventory" });
    }

    product.quantity -= payload.quantity;
    const order = createOrder({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        price: product.price,
        quantity: payload.quantity,
        status: "Confirmed"
    });
    orders.push(order);
    return res.json(order);
});

app.get("/stats", (req, res) => {
    res.json(computeStats());
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
