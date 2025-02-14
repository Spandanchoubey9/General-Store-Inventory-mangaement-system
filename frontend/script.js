document.addEventListener("DOMContentLoaded", loadProducts);

// Function to add product to the table
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
        <td><button class="delete-btn btn btn-danger btn-sm" onclick="deleteProduct(this)">Delete</button></td>
    `;

    saveProduct({ name, price, quantity });

    // Clear input fields
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

// Function to delete product from the table
function deleteProduct(btn) {
    let row = btn.parentElement.parentElement;
    let productName = row.cells[0].textContent;

    row.remove();
    removeProduct(productName);
}

// Function to search products
function searchProducts() {
    let query = document.getElementById("searchBar").value.toLowerCase();
    let rows = document.querySelectorAll("#productTable tr");

    rows.forEach(row => {
        let productName = row.cells[0]?.textContent.toLowerCase();
        if (productName.includes(query)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Function to save products to localStorage
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

    products.forEach(product => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.quantity}</td>
            <td><button class="delete-btn btn btn-danger btn-sm" onclick="deleteProduct(this)">Delete</button></td>
        `;
    });
}
