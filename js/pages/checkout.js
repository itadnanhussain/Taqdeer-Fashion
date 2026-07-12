/*=========================================================
        TAQDEER FASHION
        CHECKOUT SYSTEM FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const checkoutItems = document.querySelector("#checkout-items");
    const subtotalElement = document.querySelector("#checkout-subtotal");
    const deliveryElement = document.querySelector("#checkout-delivery");
    const totalElement = document.querySelector("#checkout-total");
    const checkoutForm = document.querySelector("#checkout-form");
    const placeOrderBtn = document.querySelector(".place-order-btn");

    let selectedPayment = "COD";


    /*=========================================
            HELPERS
    =========================================*/

    function money(value) {
        return "৳" + Number(value || 0).toLocaleString();
    }


    function getCheckoutImagePath(path) {

        const fallback = "../../assets/placeholders/product.jpg";

        if (!path) {
            return fallback;
        }

        if (
            path.startsWith("http") ||
            path.startsWith("data:") ||
            path.startsWith("../../") ||
            path.startsWith("../")
        ) {
            return path;
        }

        if (path.startsWith("assets/")) {
            return "../../" + path;
        }

        return fallback;
    }


    /*=========================================
            PAYMENT SELECT
    =========================================*/

    document
        .querySelectorAll("input[name='payment']")
        .forEach(input => {

            input.addEventListener("change", () => {
                selectedPayment = input.value;
            });

        });


    /*=========================================
            LOAD CHECKOUT
    =========================================*/

    function loadCheckout() {

        if (!window.CartService || !checkoutItems) {
            return;
        }

        const cart = window.CartService.getCart();

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <div class="empty-checkout">
                    <h3>Cart is empty</h3>
                    <p>Please add products first.</p>
                    <a href="../shop/index.html">Continue Shopping</a>
                </div>
            `;

            updateTotal();

            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.innerText = "Cart Is Empty";
            }

            return;
        }


        cart.forEach(item => {

            const div = document.createElement("div");

            div.className = "checkout-item";

            const imagePath = getCheckoutImagePath(item.image);

            div.innerHTML = `
                <img
                src="${imagePath}"
                alt="${item.name || "Product"}"
                onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                <div>
                    <h4>${item.name || "Product"}</h4>
                    <p>
                        Qty: ${item.quantity || 1}
                        ${item.size ? `• Size: ${item.size}` : ""}
                    </p>
                </div>

                <strong>
                    ${money(Number(item.price || 0) * Number(item.quantity || 1))}
                </strong>
            `;

            checkoutItems.appendChild(div);

        });

        updateTotal();

    }


    /*=========================================
            TOTAL
    =========================================*/

    function updateTotal() {

        if (!window.CartService) {
            return;
        }

        const subtotal = window.CartService.getCartTotal();
        const delivery = window.CartService.getDeliveryCharge();
        const total = window.CartService.getGrandTotal();

        if (subtotalElement) {
            subtotalElement.innerText = money(subtotal);
        }

        if (deliveryElement) {
            deliveryElement.innerText = money(delivery);
        }

        if (totalElement) {
            totalElement.innerText = money(total);
        }

    }


    /*=========================================
            PLACE ORDER
    =========================================*/

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            if (!window.CartService) {
                alert("Cart service missing");
                return;
            }

            if (!window.OrderService) {
                alert("Order service missing");
                return;
            }

            const cart = window.CartService.getCart();

            if (cart.length === 0) {
                alert("Your cart is empty");
                return;
            }


            const formData = new FormData(checkoutForm);

            const name = formData.get("name")?.trim();
            const phone = formData.get("phone")?.trim();
            const email = formData.get("email")?.trim();
            const address = formData.get("address")?.trim();

            if (!name || !phone || !address) {
                alert("Please fill in your name, phone number, and address.");
                return;
            }


            const user =
                window.auth && window.auth.currentUser
                    ? window.auth.currentUser
                    : null;


            const orderData = {

                userId: user ? user.uid : null,

                customer: {
                    name,
                    phone,
                    email,
                    address
                },

                items: cart,

                paymentMethod: selectedPayment,

                subtotal: window.CartService.getCartTotal(),

                delivery: window.CartService.getDeliveryCharge(),

                total: window.CartService.getGrandTotal(),

                status: "pending",

                createdAt: new Date().toISOString()

            };


            try {

                if (placeOrderBtn) {
                    placeOrderBtn.disabled = true;
                    placeOrderBtn.innerText = "Placing Order...";
                }

                const orderId =
                    await window.OrderService.createOrder(orderData);

                window.CartService.clearCart();

                window.location.href =
                    `../orders/success.html?id=${orderId}`;

            }

            catch (error) {

                console.error("Order Create Error:", error);

                alert("Order failed. Please try again.");

                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerText = "Place Order";
                }

            }

        });

    }


    loadCheckout();

});