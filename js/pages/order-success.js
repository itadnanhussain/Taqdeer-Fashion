/*=========================================================
        TAQDEER FASHION
        ORDER SUCCESS PAGE - FULL CLEAN FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /*=====================================================
        HELPERS
    =====================================================*/

    const money = (value) => {
        return "৳" + Number(value || 0).toLocaleString();
    };

    function safeJsonParse(value, fallback = null){
        try{
            return JSON.parse(value);
        }
        catch(error){
            return fallback;
        }
    }

    function getStorageJson(key, fallback = null){

        const sessionValue = sessionStorage.getItem(key);
        const localValue = localStorage.getItem(key);

        if(sessionValue){
            return safeJsonParse(sessionValue, fallback);
        }

        if(localValue){
            return safeJsonParse(localValue, fallback);
        }

        return fallback;
    }

    function setStorageJson(key, value){
        sessionStorage.setItem(key, JSON.stringify(value));
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getImagePath(path){

        const fallback = "../../assets/placeholders/product.jpg";

        if(!path){
            return fallback;
        }

        if(
            path.startsWith("http") ||
            path.startsWith("data:") ||
            path.startsWith("../../") ||
            path.startsWith("../")
        ){
            return path;
        }

        if(path.startsWith("assets/")){
            return "../../" + path;
        }

        if(path.startsWith("/assets/")){
            return "../.." + path;
        }

        return fallback;
    }

    function formatDate(date){
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatTime(date){
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }

    function generateOrderId(){

        const savedOrder = getStorageJson("taqdeerLastOrder", null);

        if(savedOrder && savedOrder.orderId){
            return savedOrder.orderId;
        }

        const existing =
            sessionStorage.getItem("taqdeerLastOrderId") ||
            localStorage.getItem("taqdeerLastOrderId");

        if(existing){
            return existing;
        }

        const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
        const orderId = "#TF" + randomNumber;

        sessionStorage.setItem("taqdeerLastOrderId", orderId);
        localStorage.setItem("taqdeerLastOrderId", orderId);

        return orderId;
    }

    function getDeliveryRange(){

        const start = new Date();
        const end = new Date();

        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 5);

        return {
            start: formatDate(start),
            end: formatDate(end)
        };
    }

    function getCustomerEmailFallback(){

        const savedOrder = getStorageJson("taqdeerLastOrder", {});
        const savedUser = getStorageJson("taqdeerUser", {});

        return (
            savedOrder.customerEmail ||
            savedOrder.email ||
            savedUser.email ||
            localStorage.getItem("taqdeerUserEmail") ||
            localStorage.getItem("userEmail") ||
            "customer@email.com"
        );
    }

    function normalizeProduct(product){

        return {
            id: product.id || product.productId || "",
            name: product.name || product.title || "Product",
            price: Number(product.price || product.salePrice || product.currentPrice || 0),
            quantity: Number(product.quantity || product.qty || 1),
            size: product.size || product.selectedSize || "M",
            color: product.color || product.selectedColor || "",
            image: (
                product.image ||
                product.img ||
                product.thumbnail ||
                product.mainImage ||
                product.productImage ||
                "../../assets/placeholders/product.jpg"
            )
        };
    }





    /*=====================================================
        DOM
    =====================================================*/

    const successCard = document.querySelector(".success-hero-card");

    const orderIdElement = document.getElementById("success-order-id");
    const copyBtn = document.getElementById("copy-order-id");
    const copyToast = document.getElementById("copy-toast");

    const orderDateElement = document.getElementById("order-date");
    const deliveryDateElement = document.getElementById("delivery-date");
    const customerEmailElement = document.getElementById("customer-email");
    const paymentMethodElement = document.getElementById("payment-method");

    const summaryProducts = document.getElementById("summary-products");
    const summaryItemCount = document.getElementById("summary-item-count");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryDelivery = document.getElementById("summary-delivery");
    const summaryDiscount = document.getElementById("summary-discount");
    const summaryTotal = document.getElementById("summary-total");

    const recommendProducts = document.getElementById("recommend-products");

    const wishlistCount = document.getElementById("wishlist-count");
    const cartCount = document.getElementById("cart-count");





    /*=====================================================
        ORDER DATA
    =====================================================*/

    function getLastOrder(){

        const savedOrder = getStorageJson("taqdeerLastOrder", null);

        if(savedOrder && typeof savedOrder === "object"){
            return savedOrder;
        }

        return null;
    }

    function getOrderProducts(){

        const lastOrder = getLastOrder();

        if(lastOrder && Array.isArray(lastOrder.items) && lastOrder.items.length){
            return lastOrder.items.map(normalizeProduct);
        }

        const keys = [
            "taqdeerLastOrderItems",
            "taqdeerCheckoutItems",
            "taqdeerOrderItems",
            "taqdeerLastCheckoutItems",
            "taqdeerCart"
        ];

        for(const key of keys){

            const data = getStorageJson(key, []);

            if(Array.isArray(data) && data.length){
                return data.map(normalizeProduct);
            }
        }

        return [];
    }

    function saveLastOrderIfMissing(){

        const currentOrder = getLastOrder();

        if(currentOrder && Array.isArray(currentOrder.items) && currentOrder.items.length){
            return;
        }

        const products = getOrderProducts();

        if(!products.length){
            return;
        }

        const orderId = generateOrderId();

        const orderData = {
            orderId: orderId,
            items: products,
            paymentMethod: "Cash on Delivery",
            customerEmail: getCustomerEmailFallback(),
            orderDate: new Date().toISOString(),
            deliveryCharge: 80,
            discount: Number(sessionStorage.getItem("taqdeerLastOrderDiscount") || 0)
        };

        setStorageJson("taqdeerLastOrder", orderData);
        setStorageJson("taqdeerLastOrderItems", products);
    }





    /*=====================================================
        HEADER COUNTS
    =====================================================*/

    function updateCounts(){

        const wishlist = safeJsonParse(localStorage.getItem("taqdeerWishlist"), []) || [];
        const cart = safeJsonParse(localStorage.getItem("taqdeerCart"), []) || [];

        const cartTotalItems = Array.isArray(cart)
            ? cart.reduce((total, item) => total + Number(item.quantity || item.qty || 1), 0)
            : 0;

        if(wishlistCount){
            wishlistCount.textContent = Array.isArray(wishlist) ? wishlist.length : 0;
        }

        if(cartCount){
            cartCount.textContent = cartTotalItems;
        }
    }





    /*=====================================================
        RENDER ORDER INFO
    =====================================================*/

    function renderOrderInfo(){

        const lastOrder = getLastOrder();
        const orderId = generateOrderId();

        const orderDate = lastOrder && lastOrder.orderDate
            ? new Date(lastOrder.orderDate)
            : new Date();

        if(orderIdElement){
            orderIdElement.textContent = orderId;
        }

        if(orderDateElement){
            orderDateElement.innerHTML = `
                <span>${formatDate(orderDate)}</span>
                <span>${formatTime(orderDate)}</span>
            `;
        }

        if(deliveryDateElement){

            const range = getDeliveryRange();

            deliveryDateElement.innerHTML = `
                <span class="delivery-line">${range.start}</span>
                <span class="delivery-line">- ${range.end}</span>
            `;
        }

        if(paymentMethodElement){
            paymentMethodElement.textContent =
                (lastOrder && lastOrder.paymentMethod) || "Cash on Delivery";
        }

        if(customerEmailElement){

            const fallbackEmail = getCustomerEmailFallback();

            if(window.firebase && firebase.auth){

                const currentUser = firebase.auth().currentUser;

                if(currentUser && currentUser.email){
                    customerEmailElement.textContent = currentUser.email;
                }
                else{
                    firebase.auth().onAuthStateChanged((authUser) => {
                        customerEmailElement.textContent =
                            authUser && authUser.email
                                ? authUser.email
                                : fallbackEmail;
                    });
                }
            }
            else{
                customerEmailElement.textContent = fallbackEmail;
            }
        }
    }





    /*=====================================================
        RENDER SUMMARY
    =====================================================*/

    function renderSummary(){

        if(!summaryProducts){
            return;
        }

        const products = getOrderProducts();

        summaryProducts.innerHTML = "";

        if(!products.length){

            summaryProducts.innerHTML = `
                <div class="summary-product empty-order">
                    <img
                        src="../../assets/placeholders/product.jpg"
                        alt="Product">

                    <div>
                        <h3>No product found</h3>
                        <p>Your order item was not saved correctly before redirecting to the success page.</p>
                        <strong>৳0</strong>
                    </div>
                </div>
            `;

            if(summaryItemCount) summaryItemCount.textContent = "0 Items";
            if(summarySubtotal) summarySubtotal.textContent = money(0);
            if(summaryDelivery) summaryDelivery.textContent = money(0);
            if(summaryDiscount) summaryDiscount.textContent = "-৳0";
            if(summaryTotal) summaryTotal.textContent = money(0);

            return;
        }

        let subtotal = 0;

        products.forEach((product) => {

            subtotal += product.price * product.quantity;

            const card = document.createElement("div");
            card.className = "summary-product";

            card.innerHTML = `
                <img
                    src="${getImagePath(product.image)}"
                    alt="${product.name}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                <div>
                    <h3>${product.name}</h3>

                    <p>
                        Size: ${product.size}
                        ${product.color ? ` | Color: ${product.color}` : ""}
                    </p>

                    <p>Qty: ${product.quantity}</p>

                    <strong>${money(product.price)}</strong>
                </div>
            `;

            summaryProducts.appendChild(card);
        });

        const lastOrder = getLastOrder();

        const delivery =
            Number(
                lastOrder && lastOrder.deliveryCharge !== undefined
                    ? lastOrder.deliveryCharge
                    : 80
            );

        const discount =
            Number(
                lastOrder && lastOrder.discount !== undefined
                    ? lastOrder.discount
                    : sessionStorage.getItem("taqdeerLastOrderDiscount") || 0
            );

        const total = Math.max(subtotal + delivery - discount, 0);

        if(summaryItemCount){
            summaryItemCount.textContent =
                products.length === 1 ? "1 Item" : `${products.length} Items`;
        }

        if(summarySubtotal){
            summarySubtotal.textContent = money(subtotal);
        }

        if(summaryDelivery){
            summaryDelivery.textContent = money(delivery);
        }

        if(summaryDiscount){
            summaryDiscount.textContent = "-৳" + discount.toLocaleString();
        }

        if(summaryTotal){
            summaryTotal.textContent = money(total);
        }
    }





    /*=====================================================
        RECOMMENDED PRODUCTS
    =====================================================*/

    function getRecommendedProducts(){

        const savedProducts = getStorageJson("taqdeerProducts", []);

        if(Array.isArray(savedProducts) && savedProducts.length){
            return savedProducts.slice(0, 6).map(normalizeProduct);
        }

        return [
            {
                name: "Premium T-Shirt",
                price: 550,
                image: "../../assets/placeholders/product.jpg"
            },
            {
                name: "Casual Shirt",
                price: 750,
                image: "../../assets/placeholders/product.jpg"
            },
            {
                name: "Classic Panjabi",
                price: 1150,
                image: "../../assets/placeholders/product.jpg"
            },
            {
                name: "Formal Trousers",
                price: 1090,
                image: "../../assets/placeholders/product.jpg"
            },
            {
                name: "Drop Shoulder Tee",
                price: 590,
                image: "../../assets/placeholders/product.jpg"
            },
            {
                name: "Striped Polo Shirt",
                price: 850,
                image: "../../assets/placeholders/product.jpg"
            }
        ].map(normalizeProduct);
    }

    function renderRecommended(){

        if(!recommendProducts){
            return;
        }

        const products = getRecommendedProducts();

        recommendProducts.innerHTML = "";

        products.forEach((product) => {

            const card = document.createElement("article");
            card.className = "recommend-card";

            card.innerHTML = `
                <button type="button" class="wishlist-btn" aria-label="Add to wishlist">
                    <i data-lucide="heart"></i>
                </button>

                <img
                    src="${getImagePath(product.image)}"
                    alt="${product.name}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                <h3>${product.name}</h3>
                <strong>${money(product.price)}</strong>
            `;

            recommendProducts.appendChild(card);
        });
    }





    /*=====================================================
        COPY ORDER ID
    =====================================================*/

    function setupCopy(){

        if(!copyBtn || !orderIdElement){
            return;
        }

        copyBtn.addEventListener("click", async () => {

            const orderId = orderIdElement.textContent.trim();

            try{
                await navigator.clipboard.writeText(orderId);
            }
            catch(error){
                const tempInput = document.createElement("input");
                tempInput.value = orderId;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                tempInput.remove();
            }

            copyBtn.classList.add("copied");
            copyBtn.innerHTML = `<i data-lucide="check"></i>`;

            if(copyToast){
                copyToast.textContent = "Order ID copied";
                copyToast.classList.add("show");
            }

            if(window.lucide){
                lucide.createIcons();
            }

            setTimeout(() => {

                copyBtn.classList.remove("copied");
                copyBtn.innerHTML = `<i data-lucide="copy"></i>`;

                if(copyToast){
                    copyToast.classList.remove("show");
                }

                if(window.lucide){
                    lucide.createIcons();
                }

            }, 1600);
        });
    }





    /*=====================================================
        ANIMATION
    =====================================================*/

    function setupAnimation(){

        if(!successCard){
            return;
        }

        successCard.classList.add("animate-ready");

        const confettiPieces = successCard.querySelectorAll(".confetti span");

        confettiPieces.forEach((piece, index) => {

            const total = confettiPieces.length || 1;

            const angle =
                ((360 / total) * index + (Math.random() * 26 - 13)) *
                (Math.PI / 180);

            const distance = 90 + Math.random() * 135;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            const rotation = `${Math.floor(Math.random() * 760 - 380)}deg`;

            piece.style.setProperty("--x", `${x}px`);
            piece.style.setProperty("--y", `${y}px`);
            piece.style.setProperty("--r", rotation);
            piece.style.animationDelay = `${index * 26}ms`;
        });

        setTimeout(() => {
            successCard.classList.add("loaded");
        }, 180);
    }





    /*=====================================================
        INIT
    =====================================================*/

    saveLastOrderIfMissing();

    renderOrderInfo();
    renderSummary();
    renderRecommended();

    updateCounts();
    setupCopy();
    setupAnimation();

    if(window.lucide){
        lucide.createIcons();
    }

});