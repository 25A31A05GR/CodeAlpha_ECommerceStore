// ================= CART =================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= USER =================

function updateUserArea() {

    const userArea =
        document.getElementById("userArea");

    const loginLink =
        document.getElementById("loginLink");

    const registerLink =
        document.getElementById("registerLink");

    if (!userArea) {
        return;
    }

    const user =
        JSON.parse(localStorage.getItem("user"));

    if (user) {

        userArea.innerHTML = `
            <span class="welcome">
                Hi, ${user.name}
            </span>

            <button class="logout-button"
                    onclick="logout()">
                Logout
            </button>
        `;

        if (loginLink) {
            loginLink.style.display = "none";
        }

        if (registerLink) {
            registerLink.style.display = "none";
        }

    } else {

        userArea.innerHTML = "";

        if (loginLink) {
            loginLink.style.display = "inline";
        }

        if (registerLink) {
            registerLink.style.display = "inline";
        }
    }
}


function logout() {

    localStorage.removeItem("user");

    alert("Logged out successfully!");

    window.location.href = "index.html";
}


// ================= ADD TO CART =================

async function addToCart(productId) {

    try {

        const response =
            await fetch(`/api/products/${productId}`);

        if (!response.ok) {
            throw new Error("Product not found");
        }

        const product =
            await response.json();

        const existingItem =
            cart.find(item => item.id === product.id);

        if (existingItem) {

            existingItem.quantity++;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        saveCart();

        displayCart();

        alert(product.name + " added to cart!");

    } catch (error) {

        alert("Could not add product to cart.");

    }
}


// ================= SAVE CART =================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}


// ================= DISPLAY CART =================

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    if (!cartItems) {
        return;
    }

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Cart is empty</p>";

        return;
    }

    let total = 0;
    let itemCount = 0;
    let output = "";

    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        itemCount += item.quantity;

        output += `
            <div class="cart-item">

                <img src="${item.image}"
                     alt="${item.name}">

                <div class="cart-info">

                    <h3>${item.name}</h3>

                    <p>
                        ₹${item.price}
                    </p>

                    <div class="quantity">

                        <button
                            onclick="decreaseQuantity(${index})">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="increaseQuantity(${index})">
                            +
                        </button>

                    </div>

                    <button
                        class="remove-button"
                        onclick="removeFromCart(${index})">
                        Remove
                    </button>

                </div>

                <strong>
                    ₹${itemTotal}
                </strong>

            </div>
        `;
    });

    output += `
        <div class="cart-total">

            <p>
                Items: ${itemCount}
            </p>

            <h3>
                Total: ₹${total}
            </h3>

            <button onclick="goToCheckout()">
                Proceed to Checkout
            </button>

        </div>
    `;

    cartItems.innerHTML = output;
}


// ================= QUANTITY =================

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

    displayCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }

    saveCart();

    displayCart();
}


// ================= REMOVE =================

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    displayCart();
}


// ================= CHECKOUT =================

function goToCheckout() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    window.location.href =
        "checkout.html";
}


// ================= PRODUCT DETAILS =================

async function loadProduct() {

    const productDetails =
        document.getElementById("productDetails");

    if (!productDetails) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    if (!id) {

        productDetails.innerHTML =
            "<h2>Product not found</h2>";

        return;
    }

    try {

        const response =
            await fetch(`/api/products/${id}`);

        const product =
            await response.json();

        productDetails.innerHTML = `

            <img src="${product.image}"
                 alt="${product.name}">

            <div>

                <h2>
                    ${product.name}
                </h2>

                <p class="price">
                    ₹${product.price}
                </p>

                <p>
                    ${product.description}
                </p>

                <br>

                <h3>
                    Features
                </h3>

                <ul>
                    <li>Good quality product</li>
                    <li>Modern design</li>
                    <li>Easy to use</li>
                    <li>Suitable for everyday use</li>
                </ul>

                <button
                    onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <br><br>

                <a href="index.html">
                    ← Back to Store
                </a>

            </div>
        `;

    } catch (error) {

        productDetails.innerHTML =
            "<h2>Unable to load product</h2>";
    }
}


// ================= REGISTER =================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();

            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;

            const message =
                document.getElementById(
                    "registerMessage"
                );

            try {

                const response =
                    await fetch("/api/register", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    });

                const data =
                    await response.json();

                message.textContent =
                    data.message;

                if (response.ok) {

                    message.className =
                        "success-message";

                    registerForm.reset();

                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 1200);

                } else {

                    message.className =
                        "error-message";
                }

            } catch (error) {

                message.textContent =
                    "Server error. Please try again.";

                message.className =
                    "error-message";
            }
        }
    );
}


// ================= LOGIN =================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById(
                    "loginMessage"
                );

            try {

                const response =
                    await fetch("/api/login", {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    });

                const data =
                    await response.json();

                message.textContent =
                    data.message;

                if (response.ok) {

                    message.className =
                        "success-message";

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 1000);

                } else {

                    message.className =
                        "error-message";
                }

            } catch (error) {

                message.textContent =
                    "Server error. Please try again.";

                message.className =
                    "error-message";
            }
        }
    );
}


// ================= CHECKOUT PAGE =================

function loadCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    if (!checkoutItems) {
        return;
    }

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>
            <br>
            <a href="index.html">
                ← Back to Store
            </a>
        `;

        return;
    }

    let total = 0;
    let output = "";

    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        output += `
            <div class="checkout-item">

                <span>
                    ${item.name} × ${item.quantity}
                </span>

                <strong>
                    ₹${itemTotal}
                </strong>

            </div>
        `;
    });

    checkoutItems.innerHTML =
        output;

    document.getElementById(
        "checkoutTotal"
    ).textContent =
        `Total: ₹${total}`;
}


// ================= PLACE ORDER =================

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (cart.length === 0) {

                alert("Cart is empty!");

                return;
            }

            const user =
                JSON.parse(
                    localStorage.getItem("user")
                );

            let total = 0;

            cart.forEach(item => {

                total +=
                    item.price * item.quantity;

            });

            const orderData = {

                userId:
                    user ? user.id : null,

                customerName:
                    document.getElementById(
                        "customerName"
                    ).value.trim(),

                address:
                    document.getElementById(
                        "address"
                    ).value.trim(),

                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),

                total: total,

                items: cart
            };

            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )
                        }
                    );

                const data =
                    await response.json();

                if (response.ok) {

                    cart = [];

                    saveCart();

                    localStorage.setItem(
                        "lastOrder",
                        JSON.stringify({
                            orderId:
                                data.orderId,
                            total:
                                data.total,
                            customerName:
                                orderData.customerName
                        })
                    );

                    window.location.href =
                        "order-success.html";

                } else {

                    alert(data.message);
                }

            } catch (error) {

                alert(
                    "Server error. Please try again."
                );
            }
        }
    );
}


// ================= PAGE LOAD =================

displayCart();

loadProduct();

loadCheckout();

updateUserArea();