/*=========================================================
        TAQDEER FASHION
        CART + DRAWER FINAL CLEAN JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /*=====================================================
        SETTINGS
    =====================================================*/

    const CART_KEY = "taqdeerCart";
    const CHECKOUT_KEY = "taqdeerCheckoutCart";
    const DELIVERY_CHARGE = 80;
    const DISCOUNT = 0;


    /*=====================================================
        DOM
    =====================================================*/

    const cartItems = document.getElementById("cart-items");
    const emptyCart = document.getElementById("empty-cart");

    const headerCartCount = document.getElementById("header-cart-count");
    const cartCountLabel = document.getElementById("cart-count");

    const subtotalElement = document.getElementById("subtotal");
    const subtotalLabel = document.getElementById("subtotal-label");
    const deliveryElement = document.getElementById("delivery");
    const discountElement = document.getElementById("discount");
    const totalElement = document.getElementById("total");

    const checkoutBtn = document.getElementById("checkout-btn");
    const clearCartBtn = document.getElementById("clear-cart-btn");

    const recommendProducts = document.getElementById("recommend-products");

    const cartDrawer = document.querySelector(".cart-drawer");
    const cartOverlay = document.querySelector(".cart-overlay");
    const cartDrawerItems = document.getElementById("cart-drawer-items");
    const cartDrawerTotal = document.getElementById("cart-drawer-total");
    const cartDrawerCount = document.getElementById("cart-drawer-count");
    const cartCloseBtn = document.querySelector(".cart-close");


    /*=====================================================
        HELPERS
    =====================================================*/

    function money(value) {
        return "৳" + Number(value || 0).toLocaleString();
    }


    function getCart() {
        try {
            if (
                window.CartService &&
                typeof window.CartService.getCart === "function"
            ) {
                return window.CartService.getCart() || [];
            }

            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        }

        catch (error) {
            console.warn("Cart read failed:", error);
            return [];
        }
    }


    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        if (
            window.CartService &&
            typeof window.CartService.saveCart === "function"
        ) {
            try {
                window.CartService.saveCart(cart);
            }

            catch (error) {
                console.warn("CartService save failed:", error);
            }
        }

        window.dispatchEvent(new Event("cartUpdated"));
    }


    function getImagePath(path) {
        const fallback = "../../assets/placeholders/product.jpg";

        if (!path) {
            return fallback;
        }

        if (
            path.startsWith("http") ||
            path.startsWith("data:") ||
            path.startsWith("../") ||
            path.startsWith("../../")
        ) {
            return path;
        }

        if (path.startsWith("assets/")) {
            return "../../" + path;
        }

        return fallback;
    }


    function getQuantityCount(cart) {
        return cart.reduce((total, item) => {
            return total + Number(item.quantity || 1);
        }, 0);
    }


    function getSubtotal(cart) {
        return cart.reduce((total, item) => {
            return total +
            Number(item.price || 0) *
            Number(item.quantity || 1);
        }, 0);
    }


    function getDelivery(cart) {
        return cart.length > 0 ? DELIVERY_CHARGE : 0;
    }


    function updateIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }


    function updateHeaderCounts(cart) {
        const quantity = getQuantityCount(cart);

        if (headerCartCount) {
            headerCartCount.textContent = quantity;
        }

        document
            .querySelectorAll(".cart-count, .badge.cart-count, #header-cart-count")
            .forEach(badge => {
                badge.textContent = quantity;
            });

        if (
            window.CartService &&
            typeof window.CartService.updateCartCount === "function"
        ) {
            window.CartService.updateCartCount();
        }
    }


    /*=====================================================
        DRAWER
    =====================================================*/

    function openCartDrawer() {
        renderCartDrawer();

        if (cartDrawer) {
            cartDrawer.classList.add("active");
        }

        if (cartOverlay) {
            cartOverlay.classList.add("active");
        }

        document.body.classList.add("drawer-open");
    }


    function closeCartDrawer() {
        if (cartDrawer) {
            cartDrawer.classList.remove("active");
        }

        if (cartOverlay) {
            cartOverlay.classList.remove("active");
        }

        document.body.classList.remove("drawer-open");
    }


    function renderCartDrawer() {
        if (!cartDrawerItems) {
            return;
        }

        const cart = getCart();
        const quantity = getQuantityCount(cart);
        const subtotal = getSubtotal(cart);
        const delivery = getDelivery(cart);
        const total = subtotal + delivery;

        cartDrawerItems.innerHTML = "";

        if (cartDrawerCount) {
            cartDrawerCount.textContent =
                `${quantity} item${quantity !== 1 ? "s" : ""}`;
        }

        if (cartDrawerTotal) {
            cartDrawerTotal.textContent = money(total);
        }

        if (!cart.length) {
            cartDrawerItems.innerHTML = `
                <div class="drawer-empty">
                    <div class="drawer-empty-icon">
                        <i data-lucide="shopping-bag"></i>
                    </div>

                    <h4>Your cart is empty</h4>

                    <p>Add some premium products first.</p>

                    <a href="../shop/index.html">
                        Shop Now
                    </a>
                </div>
            `;

            updateIcons();
            return;
        }

        cart.forEach(item => {
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const lineTotal = price * quantity;

            const div = document.createElement("div");
            div.className = "drawer-cart-item";

            div.innerHTML = `
                <div class="drawer-cart-img">
                    <img
                        src="${getImagePath(item.image)}"
                        alt="${item.name || "Product"}"
                        onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">
                </div>

                <div class="drawer-cart-info">
                    <h4>${item.name || "Product"}</h4>

                    <p>
                        ${item.size ? "Size: " + item.size : "Size: Standard"}
                        ${item.color ? " • Color: " + item.color : ""}
                    </p>

                    <strong>${money(lineTotal)}</strong>

                    <div class="drawer-cart-bottom">
                        <div class="drawer-qty">
                            <button type="button" class="qty-minus" data-id="${item.id}">−</button>
                            <span>${quantity}</span>
                            <button type="button" class="qty-plus" data-id="${item.id}">+</button>
                        </div>

                        <button type="button" class="drawer-remove remove-btn" data-id="${item.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;

            cartDrawerItems.appendChild(div);
        });

        updateIcons();
    }


    window.openCartDrawer = openCartDrawer;
    window.closeCartDrawer = closeCartDrawer;
    window.renderCartDrawer = renderCartDrawer;


    /*=====================================================
        CART PAGE RENDER
    =====================================================*/

    function renderCart() {
        const cart = getCart();

        updateHeaderCounts(cart);
        renderCartDrawer();

        if (!cartItems) {
            return;
        }

        cartItems.innerHTML = "";

        const quantity = getQuantityCount(cart);
        const subtotal = getSubtotal(cart);
        const delivery = getDelivery(cart);
        const discount = cart.length > 0 ? DISCOUNT : 0;
        const total = Math.max(subtotal + delivery - discount, 0);

        if (cartCountLabel) {
            cartCountLabel.textContent =
                `${quantity} Item${quantity !== 1 ? "s" : ""}`;
        }

        if (subtotalLabel) {
            subtotalLabel.textContent =
                `Subtotal${quantity ? ` (${quantity} Item${quantity !== 1 ? "s" : ""})` : ""}`;
        }

        if (subtotalElement) {
            subtotalElement.textContent = money(subtotal);
        }

        if (deliveryElement) {
            deliveryElement.textContent = money(delivery);
        }

        if (discountElement) {
            discountElement.textContent = "-" + money(discount);
        }

        if (totalElement) {
            totalElement.textContent = money(total);
        }

        if (!cart.length) {
            if (emptyCart) {
                emptyCart.classList.add("active");
            }

            updateIcons();
            return;
        }

        if (emptyCart) {
            emptyCart.classList.remove("active");
        }

        cart.forEach(item => {
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const lineTotal = price * quantity;

            const row = document.createElement("article");
            row.className = "cart-item";

            row.innerHTML = `
                <div class="cart-product">
                    <div class="cart-item-image">
                        <img
                            src="${getImagePath(item.image)}"
                            alt="${item.name || "Product"}"
                            onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">
                    </div>

                    <div class="cart-product-info">
                        <h3>${item.name || "Product"}</h3>

                        <p>
                            ${item.size ? `Size: ${item.size}` : "Size: Standard"}
                            ${item.color ? ` | Color: ${item.color}` : ""}
                        </p>

                        <span class="stock-badge">In Stock</span>
                    </div>
                </div>

                <div class="cart-price">
                    ${money(price)}
                </div>

                <div class="quantity-control">
                    <button type="button" class="qty-minus" data-id="${item.id}">−</button>
                    <span>${quantity}</span>
                    <button type="button" class="qty-plus" data-id="${item.id}">+</button>
                </div>

                <div class="cart-line-total">
                    ${money(lineTotal)}
                </div>

                <div class="cart-actions">
                    <button type="button" class="cart-action-btn move-wishlist-btn" data-id="${item.id}">
                        <i data-lucide="heart"></i>
                    </button>

                    <button type="button" class="cart-action-btn remove-btn" data-id="${item.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            cartItems.appendChild(row);
        });

        updateIcons();
    }


    /*=====================================================
        RECOMMENDED PRODUCTS
    =====================================================*/

    function renderRecommended() {
        if (!recommendProducts) {
            return;
        }

        const products = [
            {
                id: "rec-tshirt",
                name: "Premium T-Shirt",
                price: 550,
                image: "../../assets/placeholders/product.jpg",
                link: "../shop/index.html?category=t-shirt"
            },
            {
                id: "rec-shirt",
                name: "Casual Shirt",
                price: 750,
                image: "../../assets/placeholders/product.jpg",
                link: "../shop/index.html?category=shirt"
            },
            {
                id: "rec-panjabi",
                name: "Classic Panjabi",
                price: 1150,
                image: "../../assets/placeholders/product.jpg",
                link: "../shop/index.html?category=panjabi"
            }
        ];

        recommendProducts.innerHTML = products.map(product => {
            return `
                <article class="recommend-card">
                    <a href="${product.link}" class="recommend-img">
                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">
                    </a>

                    <div class="recommend-info">
                        <h4>${product.name}</h4>

                        <strong>${money(product.price)}</strong>

                        <button
                            type="button"
                            class="recommend-add-cart add-to-cart-btn"
                            data-id="${product.id}"
                            data-name="${product.name}"
                            data-price="${product.price}"
                            data-image="${product.image}">
                            <i data-lucide="shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        updateIcons();
    }


    /*=====================================================
        ADD PRODUCT TO CART
    =====================================================*/

    function addProductToCart(product) {
        const cart = getCart();

        const existing = cart.find(item => {
            return String(item.id) === String(product.id) &&
            String(item.size || "") === String(product.size || "") &&
            String(item.color || "") === String(product.color || "");
        });

        if (existing) {
            existing.quantity = Number(existing.quantity || 1) + 1;
        }

        else {
            cart.push({
                id: product.id || Date.now().toString(),
                name: product.name || "Product",
                price: Number(product.price || 0),
                image: product.image || "",
                size: product.size || "M",
                color: product.color || "",
                quantity: Number(product.quantity || 1)
            });
        }

        saveCart(cart);
        renderCart();
        openCartDrawer();
    }


    /*=====================================================
        EVENTS
    =====================================================*/

    document.addEventListener("click", e => {

        const addBtn = e.target.closest(
            ".add-to-cart-btn, .details-add-cart-btn, .product-add-cart-btn, [data-action='add-cart']"
        );

        if (addBtn) {
            e.preventDefault();

            const product = {
                id: addBtn.dataset.id || addBtn.dataset.productId || window.currentProduct?.id,
                name: addBtn.dataset.name || window.currentProduct?.name,
                price: addBtn.dataset.price || window.currentProduct?.price,
                image: addBtn.dataset.image || window.currentProduct?.image,
                size:
                    document.querySelector(".size-options button.active")?.textContent?.trim() ||
                    addBtn.dataset.size ||
                    "M",
                color:
                    document.querySelector(".color-pill.active")?.dataset.color ||
                    addBtn.dataset.color ||
                    ""
            };

            addProductToCart(product);
            return;
        }


        const plus = e.target.closest(".qty-plus");

        if (plus) {
            const id = plus.dataset.id;
            const cart = getCart();
            const item = cart.find(product => String(product.id) === String(id));

            if (item) {
                item.quantity = Number(item.quantity || 1) + 1;
                saveCart(cart);
                renderCart();
            }

            return;
        }


        const minus = e.target.closest(".qty-minus");

        if (minus) {
            const id = minus.dataset.id;
            let cart = getCart();
            const item = cart.find(product => String(product.id) === String(id));

            if (item) {
                item.quantity = Number(item.quantity || 1) - 1;

                if (item.quantity <= 0) {
                    cart = cart.filter(product => String(product.id) !== String(id));
                }

                saveCart(cart);
                renderCart();
            }

            return;
        }


        const remove = e.target.closest(".remove-btn");

        if (remove) {
            const id = remove.dataset.id;

            const cart = getCart().filter(item => {
                return String(item.id) !== String(id);
            });

            saveCart(cart);
            renderCart();
            return;
        }


        if (e.target.closest("#clear-cart-btn")) {
            saveCart([]);
            renderCart();
            return;
        }


        const cartOpenBtn = e.target.closest(
            ".cart-btn, .cart-link, .drawer-cart-open, .header-cart-open"
        );

        if (cartOpenBtn) {
            const href = cartOpenBtn.getAttribute("href") || "";

            if (!href || href === "#" || cartOpenBtn.classList.contains("cart-btn")) {
                e.preventDefault();
                openCartDrawer();
            }

            return;
        }

    });


    if (cartCloseBtn) {
        cartCloseBtn.addEventListener("click", closeCartDrawer);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", closeCartDrawer);
    }

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeCartDrawer();
        }
    });

    window.addEventListener("cartUpdated", () => {
        renderCartDrawer();
    });


    /*=====================================================
        CHECKOUT
    =====================================================*/

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const cart = getCart();

            if (!cart.length) {
                openCartDrawer();
                return;
            }

            localStorage.setItem(CHECKOUT_KEY, JSON.stringify(cart));
            window.location.href = "../checkout/index.html";
        });
    }


    /*=====================================================
        INIT
    =====================================================*/

    renderCart();
    renderRecommended();

    window.CartUI = {
        renderCart,
        renderCartDrawer,
        openCartDrawer,
        closeCartDrawer,
        addProductToCart
    };

});