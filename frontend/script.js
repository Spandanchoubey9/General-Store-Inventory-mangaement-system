// Function to add product to the table
function addProduct() {
    let name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    let quantity = document.getElementById("productQuantity").value;

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
        <td><button class="btn btn-danger btn-sm" onclick="deleteProduct(this)">Delete</button></td>
    `;

    // Save to local storage
    saveToLocalStorage();

    // Clear input fields
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

// Function to delete product from the table
function deleteProduct(btn) {
    let row = btn.parentElement.parentElement;
    row.remove();
    saveToLocalStorage();
}

// Function to search products
function searchProducts() {
    let searchInput = document.getElementById("searchBar").value.toLowerCase();
    let tableRows = document.querySelectorAll("#productTable tr");

    tableRows.forEach(row => {
        let productName = row.cells[0].textContent.toLowerCase();
        row.style.display = productName.includes(searchInput) ? "" : "none";
    });
}

// Function to save inventory to local storage
function saveToLocalStorage() {
    let table = document.getElementById("productTable");
    let products = [];

    for (let i = 0; i < table.rows.length; i++) {
        let cells = table.rows[i].cells;
        let product = {
            name: cells[0].textContent,
            price: cells[1].textContent.replace("$", ""),
            quantity: cells[2].textContent
        };
        products.push(product);
    }

    localStorage.setItem("inventory", JSON.stringify(products));
}

// Function to load inventory from local storage
function loadFromLocalStorage() {
    let table = document.getElementById("productTable");
    let storedProducts = localStorage.getItem("inventory");

    if (storedProducts) {
        JSON.parse(storedProducts).forEach(product => {
            let row = table.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.quantity}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteProduct(this)">Delete</button></td>
            `;
        });
    }
}

// Load inventory when the page loads
document.addEventListener("DOMContentLoaded", loadFromLocalStorage);
