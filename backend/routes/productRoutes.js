const express = require("express");
const Product = require("../models/product");

const router = express.Router();

// 🔹 Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Add a new product
router.post("/", async (req, res) => {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) return res.status(400).json({ message: "All fields are required!" });

    try {
        const newProduct = new Product({ name, price, quantity });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔹 Delete a product
router.delete("/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
