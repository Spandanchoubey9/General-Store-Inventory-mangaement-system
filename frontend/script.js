// Function to add a new product
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

    // Clear input fields
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

// Function to delete a product
function deleteProduct(btn) {
    let row = btn.parentElement.parentElement;
    row.remove();
}

// Function to search for products
function searchProducts() {
    let searchValue = document.getElementById("searchBar").value.toLowerCase();
    let rows = document.querySelectorAll("#productTable tr");

    rows.forEach(row => {
        let name = row.cells[0].innerText.toLowerCase();
        if (name.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
