// Function to add product to inventory
function addProduct() {
    let name = document.getElementById("productName").value.trim();
    let price = document.getElementById("productPrice").value.trim();
    let quantity = document.getElementById("productQuantity").value.trim();

    if (name === "" || price === "" || quantity === "") {
        alert("Please fill all fields!");
        return;
    }

    let table = document.getElementById("productTable");
    let row = table.insertRow();
    row.innerHTML = `
        <td>${name}</td>
        <td>$${price}</td>
        <td>${quantity}</td>
        <td><button class="delete-btn" onclick="deleteProduct(this)">Delete</button></td>
    `;

    // Save product in localStorage
    saveProduct({ name, price, quantity });

    // Clear input fields
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

// Function to delete product from inventory
function deleteProduct(btn) {
    let row = btn.parentElement.parentElement;
    let productName = row.cells[0].innerText;
    row.remove();
    removeProduct(productName);
}

// Function to save products in localStorage
function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
}

// Function to remove product from localStorage
function removeProduct(name) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter(product => product.name !== name);
    localStorage.setItem("products", JSON.stringify(products));
}

// Function to load products from localStorage
function loadProducts() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let table = document.getElementById("productTable");

    table.innerHTML = ""; // Clear existing table data
    products.forEach(product => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.quantity}</td>
            <td><button class="delete-btn" onclick="deleteProduct(this)">Delete</button></td>
        `;
    });
}

// Function to search products
function searchProducts() {
    let searchQuery = document.getElementById("searchBar").value.toLowerCase();
    let rows = document.querySelectorAll("#productTable tr");

    rows.forEach(row => {
        let productName = row.cells[0].innerText.toLowerCase();
        if (productName.includes(searchQuery)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Function to place an order
function placeOrder() {
    let orderName = document.getElementById("orderProductName").value.trim();
    let orderQuantity = parseInt(document.getElementById("orderQuantity").value.trim());

    if (orderName === "" || isNaN(orderQuantity) || orderQuantity <= 0) {
        alert("Enter a valid product name and quantity!");
        return;
    }

    let products = JSON.parse(localStorage.getItem("products")) || [];
    let productIndex = products.findIndex(product => product.name.toLowerCase() === orderName.toLowerCase());

    if (productIndex === -1) {
        alert("Product not found in inventory!");
        return;
    }

    let availableQuantity = parseInt(products[productIndex].quantity);
    if (availableQuantity < orderQuantity) {
        alert("Not enough stock available!");
        return;
    }

    // Update inventory
    products[productIndex].quantity = availableQuantity - orderQuantity;

    if (products[productIndex].quantity === 0) {
        products.splice(productIndex, 1); // Remove product if out of stock
    }

    localStorage.setItem("products", JSON.stringify(products));
    alert(`Order placed successfully!`);
    loadProducts();
}

// Function to toggle navbar in mobile view
function toggleNavbar() {
    let navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("active");
}

// Load inventory when the page loads
document.addEventListener("DOMContentLoaded", loadProducts);
