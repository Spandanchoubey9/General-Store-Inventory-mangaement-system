const backendUrl = "http://localhost:5000";

// Fetch and display products
async function loadProducts() {
    let response = await fetch(`${backendUrl}/products`);
    let products = await response.json();
    let table = document.getElementById("productTable");
    table.innerHTML = "";
    products.forEach(product => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.quantity}</td>
            <td><button onclick="deleteProduct('${product.name}')">Delete</button></td>
        `;
    });
}

// Add product
async function addProduct() {
    let name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    let quantity = document.getElementById("productQuantity").value;

    await fetch(`${backendUrl}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, quantity })
    });

    loadProducts();
}

// Place order
async function placeOrder() {
    let customer = document.getElementById("customerName").value;
    let product = document.getElementById("orderedProduct").value;
    let quantity = document.getElementById("orderedQuantity").value;

    await fetch(`${backendUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, product, quantity })
    });

    loadOrders();
}

// Load orders
async function loadOrders() {
    let response = await fetch(`${backendUrl}/orders`);
    let orders = await response.json();
    let table = document.getElementById("orderTable");
    table.innerHTML = "";
    orders.forEach(order => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("productTable")) loadProducts();
    if (document.getElementById("orderTable")) loadOrders();
});
