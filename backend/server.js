const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let products = [];
let orders = [];

app.get("/products", (req, res) => res.json(products));
app.post("/products", (req, res) => { products.push(req.body); res.json(products); });

app.get("/orders", (req, res) => res.json(orders));
app.post("/orders", (req, res) => { orders.push(req.body); res.json(orders); });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
