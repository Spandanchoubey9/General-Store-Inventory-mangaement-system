// Storage Functions
function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory")) || [];
}

function saveInventory(inventory) {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function loadOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
    localStorage.setItem("orders", JSON.stringify(orders));
}

// Product Functions
function displayInventory() {
    const inventory = loadInventory();
    const tableBody = document.getElementById("productTable");
    
    if (!tableBody) return;
    
    tableBody.innerHTML = inventory.map((product, index) => `
        <tr>
            <td>${product.id || 'N/A'}</td>
            <td>${product.name || 'Unnamed'}</td>
            <td>${product.brand || 'Generic'}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.quantity || 0}</td>
            <td>${product.views || 0}</td>
            <td>${product.lastViewed ? new Date(product.lastViewed).toLocaleDateString() : '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="viewProduct(${index})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function addProduct() {
    const id = document.getElementById("productId").value.trim();
    const name = document.getElementById("productName").value.trim();
    const brand = document.getElementById("productBrand").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);

    document.getElementById("productId").classList.remove("is-invalid");
    document.getElementById("productName").classList.remove("is-invalid");
    document.getElementById("productPrice").classList.remove("is-invalid");
    document.getElementById("productQuantity").classList.remove("is-invalid");

    if (!id || id.length < 3 || !/^[a-zA-Z0-9-]+$/.test(id)) {
        document.getElementById("productId").classList.add("is-invalid");
        alert("? Product ID must be at least 3 characters (letters/numbers/hyphens only)");
        return;
    }

    if (!name || name.length < 3) {
        document.getElementById("productName").classList.add("is-invalid");
        alert("? Product Name must be at least 3 characters");
        return;
    }

    if (isNaN(price) || price <= 0) {
        document.getElementById("productPrice").classList.add("is-invalid");
        alert("? Price must be greater than $0");
        return;
    }

    if (isNaN(quantity) || quantity < 1) {
        document.getElementById("productQuantity").classList.add("is-invalid");
        alert("? Quantity must be at least 1");
        return;
    }

    const inventory = loadInventory();
    const existingProductIndex = inventory.findIndex(p => p.id.toLowerCase() === id.toLowerCase());
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert('?? Only admin users can add or edit products.');
        return;
    }

    if (existingProductIndex !== -1) {
        const existingProduct = inventory[existingProductIndex];
        if (existingProduct.name !== name || existingProduct.brand !== brand || existingProduct.price !== price) {
            if (!confirm(`?? Product with ID ${id} exists but has different details. Update all fields?`)) {
                return;
            }
        }

        inventory[existingProductIndex] = {
            id,
            name,
            brand,
            price,
            quantity: existingProduct.quantity + quantity,
            views: existingProduct.views || 0,
            lastViewed: existingProduct.lastViewed || null
        };

        saveInventory(inventory);
        displayInventory();
        clearProductForm();
        alert(`? Updated existing product "${name}". New quantity: ${inventory[existingProductIndex].quantity}`);
    } else {
        inventory.push({ id, name, brand, price, quantity, views: 0, lastViewed: null });
        saveInventory(inventory);
        displayInventory();
        clearProductForm();
        alert("? Product added successfully!");
    }
}

function clearProductForm() {
    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productBrand").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productQuantity").value = "";
}

function deleteProduct(index) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert('?? Only admin users can delete products.');
        return;
    }
    const inventory = loadInventory();
    inventory.splice(index, 1);
    saveInventory(inventory);
    displayInventory();
}

function searchProducts() {
    const searchQuery = document.getElementById("searchBar").value.trim().toLowerCase();
    const inventory = loadInventory();
    const tableBody = document.getElementById("productTable");
    
    if (!tableBody) return;
    
    if (!searchQuery) {
        displayInventory();
        return;
    }
    
    const filtered = inventory.filter(product => 
        (product.name && product.name.toLowerCase().includes(searchQuery)) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery)) ||
        (product.id && product.id.toLowerCase().includes(searchQuery))
    );
    
    tableBody.innerHTML = filtered.map((product, index) => `
        <tr>
            <td>${product.id || 'N/A'}</td>
            <td>${product.name || 'Unnamed'}</td>
            <td>${product.brand || 'Generic'}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.quantity || 0}</td>
            <td>${product.views || 0}</td>
            <td>${product.lastViewed ? new Date(product.lastViewed).toLocaleDateString() : '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="viewProduct(${index})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function displayOrders() {
    const orders = loadOrders();
    const tableBody = document.getElementById("orderTable");
    
    if (!tableBody) return;
    
    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">No orders found</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderId || 'N/A'}</td>
            <td>${order.productName || 'N/A'}</td>
            <td>${order.brand || 'Generic'}</td>
            <td>${order.quantity || 0}</td>
            <td>$${(order.price || 0).toFixed(2)}</td>
            <td>$${(order.quantity * order.price || 0).toFixed(2)}</td>
            <td><span class="badge bg-${order.status === 'Confirmed' ? 'success' : 'warning'}">${order.status || 'Pending'}</span></td>
            <td>${order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A'}</td>
        </tr>
    `).join('');
}

function placeOrder() {
    const productId = document.getElementById("productId").value.trim();
    const orderQuantity = parseInt(document.getElementById("orderQuantity").value);

    document.getElementById("productId").classList.remove("is-invalid");
    document.getElementById("orderQuantity").classList.remove("is-invalid");

    let isValid = true;
    if (!productId) {
        document.getElementById("productId").classList.add("is-invalid");
        isValid = false;
    }
    if (isNaN(orderQuantity) || orderQuantity < 1) {
        document.getElementById("orderQuantity").classList.add("is-invalid");
        isValid = false;
    }
    if (!isValid) return;

    const inventory = loadInventory();
    const product = inventory.find(p => p.id.toLowerCase() === productId.toLowerCase());

    if (!product) {
        alert(`? Product with ID "${productId}" not found!`);
        return;
    }
    
    if (product.quantity < orderQuantity) {
        alert(`? Only ${product.quantity} available for ${product.name} (${product.brand})!`);
        return;
    }

    product.quantity -= orderQuantity;
    saveInventory(inventory);

    const newOrder = {
        orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        price: product.price,
        quantity: orderQuantity,
        status: "Confirmed",
        timestamp: new Date().toISOString()
    };

    const orders = loadOrders();
    orders.push(newOrder);
    saveOrders(orders);

    displayInventory();
    displayOrders();

    document.getElementById("productId").value = "";
    document.getElementById("orderQuantity").value = "";
    alert(`? Ordered ${orderQuantity}x ${product.name} (${product.brand})`);
}

function resetAllData() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert('?? Only admin users can reset the data.');
        return;
    }

    if (confirm("WARNING: This will delete ALL data. Continue?")) {
        localStorage.removeItem("inventory");
        localStorage.removeItem("orders");
        if (document.getElementById("productTable")) displayInventory();
        if (document.getElementById("orderTable")) displayOrders();
        alert("All data has been reset!");
    }
}

function createSampleData() {
    const sampleInventory = [
        { id: "PRD-001", name: "Laptop", brand: "Dell", price: 999, quantity: 10, views: 16, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop" },
        { id: "PRD-002", name: "Mouse", brand: "Logitech", price: 25, quantity: 50, views: 42, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=200&fit=crop" },
        { id: "PRD-003", name: "Keyboard", brand: "Corsair", price: 45, quantity: 30, views: 27, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=200&fit=crop" },
        { id: "PRD-004", name: "Monitor", brand: "Samsung", price: 299, quantity: 15, views: 33, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop" },
        { id: "PRD-005", name: "Headphones", brand: "Sony", price: 89, quantity: 25, views: 51, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop" },
        { id: "PRD-006", name: "Printer", brand: "HP", price: 149, quantity: 8, views: 19, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&h=200&fit=crop" },
        { id: "PRD-007", name: "Tablet", brand: "Apple", price: 599, quantity: 12, views: 67, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop" },
        { id: "PRD-008", name: "Smartphone", brand: "Samsung", price: 699, quantity: 20, views: 89, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop" },
        { id: "PRD-009", name: "Router", brand: "Netgear", price: 79, quantity: 18, views: 23, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop" },
        { id: "PRD-010", name: "External Hard Drive", brand: "Western Digital", price: 119, quantity: 22, views: 31, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=300&h=200&fit=crop" },
        { id: "PRD-011", name: "Webcam", brand: "Logitech", price: 59, quantity: 35, views: 45, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=200&fit=crop" },
        { id: "PRD-012", name: "Microphone", brand: "Blue Yeti", price: 129, quantity: 14, views: 28, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=200&fit=crop" },
        { id: "PRD-013", name: "Graphics Card", brand: "NVIDIA", price: 499, quantity: 6, views: 72, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=200&fit=crop" },
        { id: "PRD-014", name: "Power Supply", brand: "Corsair", price: 89, quantity: 16, views: 17, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop" },
        { id: "PRD-015", name: "Motherboard", brand: "ASUS", price: 199, quantity: 9, views: 24, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop" },
        { id: "PRD-016", name: "RAM Module", brand: "Kingston", price: 79, quantity: 28, views: 36, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1542978709-19c95dc3bc7e?w=300&h=200&fit=crop" },
        { id: "PRD-017", name: "SSD Drive", brand: "Samsung", price: 149, quantity: 21, views: 53, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=200&fit=crop" },
        { id: "PRD-018", name: "CPU Cooler", brand: "Cooler Master", price: 69, quantity: 19, views: 22, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop" },
        { id: "PRD-019", name: "Case Fan", brand: "Noctua", price: 29, quantity: 42, views: 15, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop" },
        { id: "PRD-020", name: "Gaming Chair", brand: "Secretlab", price: 399, quantity: 7, views: 61, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" },
        { id: "PRD-021", name: "Desk Lamp", brand: "IKEA", price: 39, quantity: 33, views: 29, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop" },
        { id: "PRD-022", name: "Wireless Charger", brand: "Anker", price: 24, quantity: 48, views: 38, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop" },
        { id: "PRD-023", name: "Bluetooth Speaker", brand: "JBL", price: 79, quantity: 26, views: 44, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop" },
        { id: "PRD-024", name: "Smart Watch", brand: "Garmin", price: 299, quantity: 13, views: 76, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop" },
        { id: "PRD-025", name: "E-Reader", brand: "Kindle", price: 129, quantity: 17, views: 55, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=300&h=200&fit=crop" },
        { id: "PRD-026", name: "Coffee Maker", brand: "Keurig", price: 89, quantity: 23, views: 32, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop" },
        { id: "PRD-027", name: "Air Fryer", brand: "Ninja", price: 149, quantity: 11, views: 47, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
        { id: "PRD-028", name: "Blender", brand: "Vitamix", price: 399, quantity: 8, views: 39, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=200&fit=crop" },
        { id: "PRD-029", name: "Vacuum Cleaner", brand: "Dyson", price: 499, quantity: 5, views: 68, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop" },
        { id: "PRD-030", name: "Washing Machine", brand: "LG", price: 799, quantity: 4, views: 41, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&h=200&fit=crop" },
        { id: "PRD-031", name: "Refrigerator", brand: "Samsung", price: 1299, quantity: 3, views: 84, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop" },
        { id: "PRD-032", name: "Microwave", brand: "Panasonic", price: 199, quantity: 12, views: 26, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop" },
        { id: "PRD-033", name: "Dishwasher", brand: "Bosch", price: 699, quantity: 6, views: 33, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop" },
        { id: "PRD-034", name: "Toaster", brand: "Breville", price: 79, quantity: 27, views: 21, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
        { id: "PRD-035", name: "Rice Cooker", brand: "Instant Pot", price: 89, quantity: 19, views: 37, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
        { id: "PRD-036", name: "Slow Cooker", brand: "Cuisinart", price: 59, quantity: 31, views: 29, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
        { id: "PRD-037", name: "Pressure Cooker", brand: "Instant Pot", price: 99, quantity: 15, views: 43, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
        { id: "PRD-038", name: "Stand Mixer", brand: "KitchenAid", price: 349, quantity: 9, views: 56, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=200&fit=crop" },
        { id: "PRD-039", name: "Food Processor", brand: "Cuisinart", price: 149, quantity: 14, views: 34, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=200&fit=crop" },
        { id: "PRD-040", name: "Juicer", brand: "Breville", price: 199, quantity: 10, views: 27, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=200&fit=crop" },
        { id: "PRD-041", name: "Treadmill", brand: "NordicTrack", price: 1499, quantity: 2, views: 92, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
        { id: "PRD-042", name: "Dumbbells", brand: "Bowflex", price: 299, quantity: 8, views: 48, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
        { id: "PRD-043", name: "Yoga Mat", brand: "Manduka", price: 89, quantity: 22, views: 35, lastViewed: new Date(Date.now() - 1800000).toISOString(), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
        { id: "PRD-044", name: "Resistance Bands", brand: "Fitbit", price: 29, quantity: 45, views: 23, lastViewed: new Date(Date.now() - 5400000).toISOString(), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
        { id: "PRD-045", name: "Protein Powder", brand: "Optimum Nutrition", price: 49, quantity: 38, views: 67, lastViewed: new Date(Date.now() - 900000).toISOString(), image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" },
        { id: "PRD-046", name: "Water Bottle", brand: "Hydro Flask", price: 39, quantity: 52, views: 41, lastViewed: new Date(Date.now() - 10800000).toISOString(), image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&h=200&fit=crop" },
        { id: "PRD-047", name: "Camping Tent", brand: "REI", price: 199, quantity: 11, views: 53, lastViewed: new Date(Date.now() - 2700000).toISOString(), image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=300&h=200&fit=crop" },
        { id: "PRD-048", name: "Sleeping Bag", brand: "Patagonia", price: 149, quantity: 16, views: 29, lastViewed: new Date(Date.now() - 4500000).toISOString(), image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=300&h=200&fit=crop" },
        { id: "PRD-049", name: "Backpack", brand: "Osprey", price: 129, quantity: 24, views: 58, lastViewed: new Date(Date.now() - 7200000).toISOString(), image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop" },
        { id: "PRD-050", name: "Hiking Boots", brand: "Salomon", price: 179, quantity: 18, views: 44, lastViewed: new Date(Date.now() - 3600000).toISOString(), image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=200&fit=crop" }
    ];
    
    const sampleOrders = [
        {
            orderId: "ORD-1001",
            productId: "PRD-001",
            productName: "Laptop",
            brand: "Dell",
            quantity: 1,
            price: 999,
            status: "Confirmed",
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            orderId: "ORD-1002",
            productId: "PRD-002",
            productName: "Mouse",
            brand: "Logitech",
            quantity: 2,
            price: 25,
            status: "Confirmed",
            timestamp: new Date().toISOString()
        }
    ];
    
    localStorage.setItem("inventory", JSON.stringify(sampleInventory));
    localStorage.setItem("orders", JSON.stringify(sampleOrders));
    displayInventory();
    displayOrders();
    alert("Sample data created!");
}

// Authentication Helpers
const GOOGLE_CLIENT_ID = "";
const API_BASE = "http://localhost:5000";

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function renderAuthBar() {
    const user = getCurrentUser();
    const authGreeting = document.getElementById("authGreeting");
    const authActionBtn = document.getElementById("authActionBtn");

    if (!authGreeting || !authActionBtn) return;

    if (user) {
        authGreeting.textContent = `Signed in as ${user.name} (${user.role})`;
        authGreeting.classList.remove("d-none");
        authActionBtn.textContent = "Logout";
        authActionBtn.classList.remove("btn-outline-light");
        authActionBtn.classList.add("btn-light");
        authActionBtn.href = "#";
        authActionBtn.onclick = function(event) {
            event.preventDefault();
            logout();
        };
    } else {
        authGreeting.classList.add("d-none");
        authActionBtn.textContent = "Login";
        authActionBtn.classList.remove("btn-light");
        authActionBtn.classList.add("btn-outline-light");
        authActionBtn.href = "login.html";
        authActionBtn.onclick = null;
    }
}

function requireLogin() {
    const user = getCurrentUser();
    const isLoginPage = window.location.pathname.endsWith("login.html");
    if (!user && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }
    if (user && isLoginPage) {
        window.location.href = "index.html";
        return;
    }
    renderAuthBar();
}

async function loginEmailPassword(email, password) {
    if (!email || !password) {
        alert("Please enter an email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const payload = await response.json();
            throw new Error(payload.error || "Login failed");
        }

        const result = await response.json();
        saveCurrentUser(result.user);
        window.location.href = "index.html";
    } catch (error) {
        const localUser = authenticateLocalUser(email, password);
        if (localUser) {
            saveCurrentUser(localUser);
            window.location.href = "index.html";
            return;
        }
        alert(`? ${error.message}`);
    }
}

function authenticateLocalUser(email, password) {
    const normalized = email.trim().toLowerCase();
    if (normalized === "admin@example.com" && password === "admin123") {
        return { email: normalized, name: "Admin User", role: "admin" };
    }
    if (normalized === "user@example.com" && password === "user123") {
        return { email: normalized, name: "Regular User", role: "user" };
    }
    return null;
}

async function loginWithGoogle() {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
        google.accounts.id.prompt();
        return;
    }
    fallbackGoogleLogin();
}

function fallbackGoogleLogin() {
    const user = {
        email: "google.user@example.com",
        name: "Google Demo User",
        role: "user"
    };
    saveCurrentUser(user);
    window.location.href = "index.html";
}

async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
        alert("Google sign-in was not successful.");
        return;
    }

    try {
        const authResponse = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: response.credential })
        });
        if (!authResponse.ok) {
            throw new Error("Google auth verification failed");
        }

        const result = await authResponse.json();
        saveCurrentUser(result.user);
        window.location.href = "index.html";
    } catch (error) {
        fallbackGoogleLogin();
    }
}

function initializeGoogleButton() {
    const container = document.getElementById("googleSignInButton");
    if (!container) return;

    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            ux_mode: "popup"
        });
        google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: "100%"
        });
    } else {
        container.innerHTML = `<div class="alert alert-warning small text-center">
            Google sign-in is available when a valid client ID is configured.
        </div>`;
    }
}

function viewProduct(index) {
    const inventory = loadInventory();
    const product = inventory[index];
    if (!product) return;

    product.views = (product.views || 0) + 1;
    product.lastViewed = new Date().toISOString();
    saveInventory(inventory);
    displayInventory();
    alert(`?? Viewed ${product.name}. Total views: ${product.views}`);
}

function normalizeHistoricalData() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    if (orders.some(o => o.status === "Completed" || !o.productName)) {
        const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
        const normalized = orders.map(order => normalizeOrder(order, inventory));
        localStorage.setItem("orders", JSON.stringify(normalized));
    }
}

function normalizeOrder(order, inventory) {
    let productName = order.productName || order.name || "Unknown";
    let brand = "Unknown";
    let price = order.price || 0;

    if (order.productId) {
        const inventoryProduct = inventory.find(p => p.id === order.productId);
        if (inventoryProduct) {
            productName = inventoryProduct.name;
            brand = inventoryProduct.brand || "Generic";
            price = inventoryProduct.price;
        }
    }
    if ((productName === "Unknown" || brand === "Unknown") && order.productName) {
        const inventoryProduct = inventory.find(p => p.name && p.name.toLowerCase() === order.productName.toLowerCase());
        if (inventoryProduct) {
            productName = inventoryProduct.name;
            brand = inventoryProduct.brand || "Generic";
            price = inventoryProduct.price;
        }
    }
    return { ...order, name: productName, brand, price, status: order.status || "Confirmed" };
}

// Initialize all pages
document.addEventListener("DOMContentLoaded", function() {
    requireLogin();
    initializeGoogleButton();

    if (document.getElementById("loginForm")) {
        document.getElementById("loginForm").addEventListener("submit", function(e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            loginEmailPassword(email, password);
        });
        document.getElementById("localGoogleButton").addEventListener("click", function() {
            loginWithGoogle();
        });
    }

    if (document.getElementById("productTable")) {
        displayInventory();
        const addProductForm = document.getElementById("addProductForm");
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role !== 'admin') {
            addProductForm?.classList.add('d-none');
        }
        addProductForm?.addEventListener("submit", function(e) {
            e.preventDefault();
            addProduct();
        });
        document.getElementById("searchBar")?.addEventListener("input", searchProducts);
    }

    if (document.getElementById("orderTable")) {
        displayOrders();
        document.getElementById("placeOrderBtn")?.addEventListener("click", placeOrder);
        document.getElementById("orderQuantity")?.addEventListener("input", function() {
            this.classList.remove("is-invalid");
        });
    }

    if (window.location.pathname.endsWith("analytics.html")) {
        const refreshButton = document.getElementById("refreshAnalytics");
        refreshButton?.addEventListener("click", function() {
            if (typeof updateAnalytics === "function") {
                updateAnalytics();
            }
        });
    }

    if ((!localStorage.getItem("inventory") || JSON.parse(localStorage.getItem("inventory")).length === 0) &&
        window.location.pathname.includes("products.html")) {
        if (confirm("No inventory found. Create sample data?")) {
            createSampleData();
        }
    }
});
