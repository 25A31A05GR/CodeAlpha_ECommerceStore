const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= DATABASE =================

const db = new DatabaseSync(path.join(__dirname, "store.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        total INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL
    );
`);

// Add products only if table is empty
const productCount = db.prepare(
    "SELECT COUNT(*) AS count FROM products"
).get();

if (productCount.count === 0) {
    const insertProduct = db.prepare(`
        INSERT INTO products (name, price, image, description)
        VALUES (?, ?, ?, ?)
    `);

    insertProduct.run(
        "Wireless Headphones",
        999,
        "headphones.jpg",
        "Comfortable wireless headphones with high-quality sound and long battery life."
    );

    insertProduct.run(
        "Smart Watch",
        1499,
        "watch.jpg",
        "Modern smart watch with stylish design and useful everyday features."
    );

    insertProduct.run(
        "Bluetooth Speaker",
        799,
        "speaker.jpg",
        "Portable Bluetooth speaker with clear sound and compact design."
    );
}

// ================= PASSWORD =================

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

// ================= PRODUCTS =================

app.get("/api/products", (req, res) => {
    const products = db.prepare(
        "SELECT * FROM products"
    ).all();

    res.json(products);
});

app.get("/api/products/:id", (req, res) => {
    const product = db.prepare(
        "SELECT * FROM products WHERE id = ?"
    ).get(Number(req.params.id));

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

// ================= REGISTER =================

app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    try {

        const hashedPassword = hashPassword(password);

        const result = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(
            name,
            email,
            hashedPassword
        );

        res.json({
            message: "Registration successful",
            userId: Number(result.lastInsertRowid)
        });

    } catch (error) {

        res.status(400).json({
            message: "Email already registered"
        });
    }
});

// ================= LOGIN =================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const user = db.prepare(`
        SELECT * FROM users
        WHERE email = ?
    `).get(email);

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const hashedPassword = hashPassword(password);

    if (hashedPassword !== user.password) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ================= ORDER =================

app.post("/api/orders", (req, res) => {

    const {
        userId,
        customerName,
        address,
        phone,
        items,
        total
    } = req.body;

    if (
        !customerName ||
        !address ||
        !phone ||
        !items ||
        items.length === 0
    ) {
        return res.status(400).json({
            message: "Please provide all order details"
        });
    }

    try {

        const orderResult = db.prepare(`
            INSERT INTO orders
            (user_id, customer_name, address, phone, total)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            userId || null,
            customerName,
            address,
            phone,
            total
        );

        const orderId = Number(orderResult.lastInsertRowid);

        const insertItem = db.prepare(`
            INSERT INTO order_items
            (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `);

        for (const item of items) {

            insertItem.run(
                orderId,
                item.id,
                item.quantity,
                item.price
            );
        }

        res.json({
            message: "Order placed successfully",
            orderId: orderId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Could not place order"
        });
    }
});

// ================= SERVER =================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});