// Load inventory from localStorage
function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory")) || [];
}

// Save inventory to localStorage
function saveInventory(inventory) {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

// Load orders from localStorage
function loadOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

// Save orders to localStorage
function saveOrders(orders) {
    localStorage.setItem("orders", JSON.stringify(orders));
}

// Function to add product to inventory
function addProduct() {
    let name = document.getElementById("productName").value.trim();
    let price = parseFloat(document.getElementById("productPrice").value);
    let quantity = parseInt(document.getElementById("productQuantity").value);

    if (!name || isNaN(price) || isNaN(quantity) || quantity <= 0) {
        alert("Please enter valid product details!");
        return;
    }

    let inventory = loadInventory();
    let existingProduct = inventory.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (existingProduct) {
        existingProduct.quantity += quantity;  // Update existing product quantity
    } else {
        inventory.push({ name, price, quantity });
    }

    saveInventory(inventory);
    displayInventory();
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

// Function to display inventory
function displayInventory() {
    let inventory = loadInventory();
    let tableBody = document.getElementById("productTable");
    if (!tableBody) return; // Prevent error if table is not present

    tableBody.innerHTML = "";
    inventory.forEach((product, index) => {
        let row = tableBody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td><button class="delete-btn btn btn-danger" onclick="deleteProduct(${index})">Delete</button></td>
        `;
    });
}

// Function to delete a product from inventory
function deleteProduct(index) {
    let inventory = loadInventory();
    inventory.splice(index, 1);
    saveInventory(inventory);
    displayInventory();
}

// 🔹 **Place Order with Stock Validation**
function placeOrder() {
    let orderName = document.getElementById("orderName").value.trim();
    let orderQuantity = parseInt(document.getElementById("orderQuantity").value);

    if (!orderName || isNaN(orderQuantity) || orderQuantity <= 0) {
        alert("Please enter valid order details!");
        return;
    }

    let inventory = loadInventory();
    let orders = loadOrders();
    let product = inventory.find(p => p.name.toLowerCase() === orderName.toLowerCase());

    if (!product) {
        alert("Product not found in inventory!");
        return;
    } else if (product.quantity < orderQuantity) {
        alert("Insufficient stock available!");
        return;
    } else {
        product.quantity -= orderQuantity;
        orders.push({ name: orderName, quantity: orderQuantity, status: "Confirmed" });
        saveInventory(inventory);
        saveOrders(orders);
        displayInventory();
        displayOrders();
        alert(`Order placed successfully for ${orderQuantity} ${orderName}(s)!`);
    }

    document.getElementById("orderName").value = "";
    document.getElementById("orderQuantity").value = "";
}

// Function to display orders
function displayOrders() {
    let orders = loadOrders();
    let tableBody = document.getElementById("orderTable");
    if (!tableBody) return; // Prevent error if table is not present

    tableBody.innerHTML = "";
    orders.forEach(order => {
        let row = tableBody.insertRow();
        row.innerHTML = `
            <td>${order.name}</td>
            <td>${order.quantity}</td>
            <td>${order.status}</td>
        `;
    });
}

// Function to search products in inventory
function searchProducts() {
    let searchQuery = document.getElementById("searchBar").value.trim().toLowerCase();
    let inventory = loadInventory();
    let tableBody = document.getElementById("productTable");
    if (!tableBody) return; // Prevent error if table is not present

    tableBody.innerHTML = "";
    inventory.forEach((product, index) => {
        if (product.name.toLowerCase().includes(searchQuery)) {
            let row = tableBody.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td><button class="delete-btn btn btn-danger" onclick="deleteProduct(${index})">Delete</button></td>
            `;
        }
    });
}

// Load data when the page loads
document.addEventListener("DOMContentLoaded", () => {
    displayInventory();
    displayOrders();
});
