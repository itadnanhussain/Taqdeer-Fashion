/*=========================================================
        TAQDEER FASHION
        CHECKOUT PAGE FINAL CLEAN JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const checkoutItems = document.querySelector("#checkout-items");
    const subtotalElement = document.querySelector("#checkout-subtotal");
    const subtotalLabel = document.querySelector("#checkout-subtotal-label");
    const deliveryElement = document.querySelector("#checkout-delivery");
    const discountElement = document.querySelector("#checkout-discount");
    const totalElement = document.querySelector("#checkout-total");
    const checkoutForm = document.querySelector("#checkout-form");
    const placeOrderBtn = document.querySelector(".place-order-btn");
    const paymentMethods = document.querySelectorAll(".payment-method");

    const citySelect = document.querySelector("#customer-city");
    const areaSelect = document.querySelector("#customer-area");

    const couponInput = document.querySelector(".coupon-input-row input");
    const couponBtn = document.querySelector(".coupon-input-row button");

    let selectedPayment = "Cash on Delivery";

    const areaSuggestions = {
        Dhaka: [
            "Dhanmondi", "Mirpur", "Uttara", "Banani", "Gulshan",
            "Mohammadpur", "Bashundhara", "Badda", "Jatrabari", "Motijheel"
        ],
        Chattogram: [
            "Agrabad", "GEC", "Halishahar", "Panchlaish", "Nasirabad",
            "Chawkbazar", "Patenga", "Khulshi"
        ],
        Sylhet: [
            "Zindabazar", "Ambarkhana", "Subid Bazar", "Shahjalal Upashahar",
            "Tilagor", "Bandar Bazar"
        ],
        Sunamganj: [
            "Sunamganj Sadar", "Gobindoganj Point", "Chhatak", "Tahirpur",
            "Jagannathpur", "Derai", "Shalla", "Dharampasha", "Dowarabazar"
        ],
        Pabna: [
            "Pabna Sadar", "Ishwardi", "Sujanagar", "Bera", "Santhia", "Atgharia"
        ],
        Rajshahi: [
            "Shaheb Bazar", "Boalia", "Rajpara", "Motihar", "Kazla", "Binodpur"
        ],
        Khulna: [
            "Sonadanga", "Khalishpur", "Daulatpur", "Boyra", "Gollamari"
        ],
        Barishal: [
            "Nathullabad", "Rupatali", "Notun Bazar", "C&B Road", "Kawnia"
        ],
        Rangpur: [
            "Jahaj Company", "Modern Mor", "Lalbag", "Dhap", "Shapla Chattar"
        ],
        Mymensingh: [
            "Town Hall", "Ganginarpar", "Charpara", "Kachijhuli", "Maskanda"
        ],
        "Cox's Bazar": [
            "Kolatoli", "Sugandha Point", "Laboni Point", "Teknaf", "Ramu", "Ukhiya"
        ]
    };

    function money(value) {
        return "৳" + Number(value || 0).toLocaleString();
    }

    function getCartService() {
        return window.CartService || window.cartService || null;
    }

    function getCart() {
        const cartService = getCartService();

        if (cartService && typeof cartService.getCart === "function") {
            return cartService.getCart() || [];
        }

        try {
            return JSON.parse(localStorage.getItem("taqdeerCart")) || [];
        } catch {
            return [];
        }
    }

    function clearCart() {
        const cartService = getCartService();

        if (cartService && typeof cartService.clearCart === "function") {
            cartService.clearCart();
        } else {
            localStorage.removeItem("taqdeerCart");
        }

        window.dispatchEvent(new Event("cartUpdated"));
    }

    function getPrice(item) {
        return Number(
            item.price ||
            item.salePrice ||
            item.finalPrice ||
            item.discountPrice ||
            item.newPrice ||
            item.currentPrice ||
            0
        );
    }

    function getImagePath(path) {
        const fallback = "../../assets/placeholders/product.jpg";

        if (!path) return fallback;

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

    function getSubtotal(cart) {
        return cart.reduce((total, item) => {
            return total + getPrice(item) * Number(item.quantity || 1);
        }, 0);
    }

    function getDelivery(cart) {
        return cart.length ? 80 : 0;
    }

    function getDiscount(cart) {
        const appliedCoupon = localStorage.getItem("taqdeerAppliedCoupon");
        const subtotal = getSubtotal(cart);

        if (!appliedCoupon) return 0;

        if (appliedCoupon === "TAQDEER10") {
            return Math.round(subtotal * 0.10);
        }

        if (appliedCoupon === "FASHION130") {
            return Math.min(130, subtotal);
        }

        return 0;
    }

    function getQuantityCount(cart) {
        return cart.reduce((total, item) => {
            return total + Number(item.quantity || 1);
        }, 0);
    }

    function generateOrderId() {
        const savedId = localStorage.getItem("taqdeerPendingOrderId");

        if (savedId) return savedId;

        const random = Math.floor(100000000 + Math.random() * 900000000);
        const orderId = "#TF" + random;

        localStorage.setItem("taqdeerPendingOrderId", orderId);

        return orderId;
    }

    function getSelectedPayment() {
        const checked = document.querySelector("input[name='payment']:checked");
        return checked ? checked.value : selectedPayment;
    }

    function getUserEmailFallback() {
        if (window.auth && window.auth.currentUser && window.auth.currentUser.email) {
            return window.auth.currentUser.email;
        }

        return "customer@email.com";
    }

    function updateAreaOptions() {
        if (!citySelect || !areaSelect) return;

        const city = citySelect.value;
        const areas = areaSuggestions[city] || [];

        areaSelect.innerHTML = `<option value="">Select area</option>`;

        areas.forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    }

    if (citySelect) {
        citySelect.addEventListener("change", updateAreaOptions);
        updateAreaOptions();
    }

    paymentMethods.forEach(method => {
        method.addEventListener("click", () => {
            paymentMethods.forEach(item => item.classList.remove("active"));

            method.classList.add("active");

            const input = method.querySelector("input");

            if (input) {
                input.checked = true;
                selectedPayment = input.value;
            }
        });
    });

    function loadUserData() {
        const nameInput = document.querySelector("#customer-name");
        const emailInput = document.querySelector("#customer-email");

        if (!window.auth || !window.auth.currentUser) return;

        const user = window.auth.currentUser;

        if (nameInput && user.displayName && !nameInput.value) {
            nameInput.value = user.displayName;
        }

        if (emailInput && user.email && !emailInput.value) {
            emailInput.value = user.email;
        }
    }

    if (window.auth && typeof window.auth.onAuthStateChanged === "function") {
        window.auth.onAuthStateChanged(() => loadUserData());
    } else {
        loadUserData();
    }

    function renderCheckoutItems() {
        if (!checkoutItems) return;

        const cart = getCart();

        checkoutItems.innerHTML = "";

        if (!cart.length) {
            checkoutItems.innerHTML = `
                <div class="empty-checkout">
                    <h3>Cart is empty</h3>
                    <p>Please add products first.</p>
                    <a href="../shop/index.html">Continue Shopping</a>
                </div>
            `;

            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.innerHTML = "Cart Is Empty";
            }

            updateTotals();
            return;
        }

        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = `
                Place Order
                <i data-lucide="arrow-right"></i>
            `;
        }

        cart.forEach(item => {
            const price = getPrice(item);
            const quantity = Number(item.quantity || 1);
            const image = getImagePath(item.image || item.imageUrl || item.thumbnail);
            const size = item.size ? `Size: ${item.size}` : "Size: M";
            const color = item.color ? ` | Color: ${item.color}` : "";

            const itemElement = document.createElement("div");
            itemElement.className = "checkout-item";

            itemElement.innerHTML = `
                <img
                    src="${image}"
                    alt="${item.name || "Product"}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';"
                >

                <div>
                    <h4>${item.name || "Product"}</h4>
                    <p>${size}${color}</p>

                    <span class="mini-qty">
                        Qty:
                        <strong>${quantity}</strong>
                    </span>
                </div>

                <strong>${money(price * quantity)}</strong>
            `;

            checkoutItems.appendChild(itemElement);
        });

        updateTotals();

        if (window.lucide) lucide.createIcons();
    }

    function updateTotals() {
        const cart = getCart();

        const subtotal = getSubtotal(cart);
        const delivery = getDelivery(cart);
        const discount = getDiscount(cart);
        const total = Math.max(0, subtotal + delivery - discount);
        const count = getQuantityCount(cart);

        if (subtotalLabel) {
            subtotalLabel.textContent =
                `Subtotal (${count} ${count === 1 ? "Item" : "Items"})`;
        }

        if (subtotalElement) subtotalElement.textContent = money(subtotal);
        if (deliveryElement) deliveryElement.textContent = money(delivery);
        if (discountElement) discountElement.textContent = "-৳" + Number(discount).toLocaleString();
        if (totalElement) totalElement.textContent = money(total);
    }

    function applyCoupon() {
        if (!couponInput || !couponBtn) return;

        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            alert("Please enter a coupon code");
            return;
        }

        const validCoupons = ["TAQDEER10", "FASHION130"];

        if (!validCoupons.includes(code)) {
            alert("Invalid coupon code");
            return;
        }

        localStorage.setItem("taqdeerAppliedCoupon", code);

        couponBtn.textContent = "Applied";
        couponBtn.disabled = true;

        updateTotals();
    }

    if (couponBtn) {
        couponBtn.addEventListener("click", applyCoupon);
    }

    function saveLastOrder(orderData) {
        localStorage.setItem("taqdeerLastOrder", JSON.stringify(orderData));
        localStorage.setItem("taqdeerLastOrderItems", JSON.stringify(orderData.items || []));
        localStorage.setItem("taqdeerLastOrderId", orderData.orderId);
    }

    async function createOrder(orderData) {
        if (
            window.OrderService &&
            typeof window.OrderService.createOrder === "function"
        ) {
            return await window.OrderService.createOrder(orderData);
        }

        const orders = JSON.parse(localStorage.getItem("taqdeerOrders")) || [];

        orders.unshift(orderData);

        localStorage.setItem("taqdeerOrders", JSON.stringify(orders));

        return orderData.orderId;
    }

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async event => {
            event.preventDefault();

            const cart = getCart();

            if (!cart.length) {
                alert("Your cart is empty");
                return;
            }

            const formData = new FormData(checkoutForm);

            const name = formData.get("name")?.trim();
            const phone = formData.get("phone")?.trim();
            const email = formData.get("email")?.trim() || getUserEmailFallback();
            const country = formData.get("country")?.trim() || "Bangladesh";
            const city = formData.get("city")?.trim();
            const area = formData.get("area")?.trim();
            const address = formData.get("address")?.trim();
            const note = formData.get("note")?.trim();

            if (!name || !phone || !email || !city || !area || !address) {
                alert("Please fill in all required shipping information.");
                return;
            }

            const subtotal = getSubtotal(cart);
            const delivery = getDelivery(cart);
            const discount = getDiscount(cart);
            const total = Math.max(0, subtotal + delivery - discount);

            const user =
                window.auth && window.auth.currentUser
                    ? window.auth.currentUser
                    : null;

            const orderId = generateOrderId();

            const orderData = {
                id: orderId.replace("#", ""),
                orderId,

                userId: user ? user.uid : null,

                customer: {
                    name,
                    phone,
                    email,
                    country,
                    city,
                    area,
                    address,
                    note
                },

                items: cart,

                paymentMethod: getSelectedPayment(),

                subtotal,
                delivery,
                discount,
                total,

                status: "pending",
                createdAt: new Date().toISOString()
            };

            try {
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = true;
                    placeOrderBtn.innerHTML = "Placing Order...";
                }

                const createdOrderId = await createOrder(orderData);
                const finalOrderId = createdOrderId || orderId;

                orderData.orderId =
                    String(finalOrderId).startsWith("#")
                        ? finalOrderId
                        : "#" + finalOrderId;

                saveLastOrder(orderData);
                clearCart();

                localStorage.removeItem("taqdeerPendingOrderId");
                localStorage.removeItem("taqdeerAppliedCoupon");

                window.location.href =
                    `../orders/success.html?id=${encodeURIComponent(orderData.orderId)}`;
            }

            catch (error) {
                console.error("Order Create Error:", error);
                alert("Order failed. Please try again.");

                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerHTML = `
                        Place Order
                        <i data-lucide="arrow-right"></i>
                    `;
                }

                if (window.lucide) lucide.createIcons();
            }
        });
    }

    renderCheckoutItems();

    window.addEventListener("cartUpdated", renderCheckoutItems);

    if (window.lucide) lucide.createIcons();

});