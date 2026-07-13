/*=========================================================
        TAQDEER FASHION
        ORDER HISTORY PAGE JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const ordersList = document.getElementById("orders-list");
    const ordersEmpty = document.getElementById("orders-empty");
    const orderFilter = document.getElementById("order-filter");
    const orderSearchInput = document.getElementById("order-search-input");

    const statTotalOrders = document.getElementById("stat-total-orders");
    const statDelivered = document.getElementById("stat-delivered");
    const statProcessing = document.getElementById("stat-processing");
    const statCancelled = document.getElementById("stat-cancelled");
    const statTotalSpent = document.getElementById("stat-total-spent");

    const modalOverlay = document.getElementById("order-modal-overlay");
    const modal = document.getElementById("order-details-modal");
    const modalBody = document.getElementById("order-modal-body");
    const modalClose = document.getElementById("order-modal-close");

    const menuBtn = document.getElementById("order-menu-btn");
    const mobileNav = document.getElementById("order-mobile-nav");
    const logoutBtn = document.getElementById("logout-btn");

    let allOrders = [];
    let activeFilter = "all";
    let searchText = "";

    function money(value) {
        return "৳" + Number(value || 0).toLocaleString();
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

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        let date;

        if (value.toDate) {
            date = value.toDate();
        } else {
            date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        });
    }

    function formatTime(value) {
        if (!value) {
            return "";
        }

        let date;

        if (value.toDate) {
            date = value.toDate();
        } else {
            date = new Date(value);
        }

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function normalizeStatus(status) {
        return String(status || "pending").toLowerCase().trim();
    }

    function getOrderId(order) {

    if (order.orderId) {
        return String(order.orderId).replace("#", "");
    }

    if (order.invoiceId) {
        return String(order.invoiceId).replace("#", "");
    }

    const base =
    String(order.id || order.docId || Date.now())
    .replace(/[^0-9a-zA-Z]/g, "")
    .slice(-8)
    .toUpperCase();

    return "TF" + base;
}

    function getOrderItems(order) {
        return Array.isArray(order.items) ? order.items : [];
    }

    function getOrderTotal(order) {
        return Number(order.total || order.grandTotal || order.amount || 0);
    }

    function getPaymentMethod(order) {
        const method = order.paymentMethod || order.payment || "Cash on Delivery";

        if (method === "COD") {
            return "Cash on Delivery";
        }

        return method;
    }

    function getStatusLabel(status) {
        const value = normalizeStatus(status);

        if (value === "delivered") return "Delivered";
        if (value === "processing") return "Processing";
        if (value === "cancelled") return "Cancelled";
        if (value === "pending") return "Pending";

        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    async function loadOrders() {
        try {
            renderLoading();

            const user = await waitForAuthUser();

            if (!window.firebase || !window.db) {
                throw new Error("Firebase or db missing");
            }

            let querySnapshot;

            if (user) {
                querySnapshot = await window.db
                    .collection("orders")
                    .where("userId", "==", user.uid)
                    .get();
            } else {
                querySnapshot = await window.db
                    .collection("orders")
                    .limit(20)
                    .get();
            }

            allOrders = [];

            querySnapshot.forEach(doc => {
                allOrders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            allOrders.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            updateStats();
            renderOrders();

        } catch (error) {
            console.error("Orders Load Error:", error);
            allOrders = getLocalOrdersFallback();
            updateStats();
            renderOrders();
        }
    }

    function waitForAuthUser() {
        return new Promise(resolve => {
            if (!window.firebase || !window.auth) {
                resolve(null);
                return;
            }

            const timeout = setTimeout(() => {
                resolve(window.auth.currentUser || null);
            }, 1200);

            window.auth.onAuthStateChanged(user => {
                clearTimeout(timeout);
                resolve(user || null);
            });
        });
    }

    function getLocalOrdersFallback() {
        const savedOrder = JSON.parse(localStorage.getItem("taqdeerLastOrder")) || null;
        const orders = JSON.parse(localStorage.getItem("taqdeerOrders")) || [];

        if (savedOrder && !orders.some(order => order.id === savedOrder.id)) {
            orders.unshift(savedOrder);
        }

        return orders;
    }

    function renderLoading() {
        if (!ordersList) return;

        ordersList.innerHTML = `
            <div class="order-row">
                <div>
                    <strong>Loading orders...</strong>
                    <p class="order-meta">Please wait a moment.</p>
                </div>
            </div>
        `;
    }

    function getFilteredOrders() {
        let orders = [...allOrders];

        if (activeFilter !== "all") {
            orders = orders.filter(order => normalizeStatus(order.status) === activeFilter);
        }

        if (searchText) {
            const search = searchText.toLowerCase();

            orders = orders.filter(order => {
                const id = getOrderId(order).toLowerCase();
                const customerName = String(order.customer?.name || "").toLowerCase();
                const customerEmail = String(order.customer?.email || "").toLowerCase();

                return (
                    id.includes(search) ||
                    customerName.includes(search) ||
                    customerEmail.includes(search)
                );
            });
        }

        return orders;
    }

    function updateStats() {
        const totalOrders = allOrders.length;
        const delivered = allOrders.filter(order => normalizeStatus(order.status) === "delivered").length;
        const processing = allOrders.filter(order => {
            const status = normalizeStatus(order.status);
            return status === "processing" || status === "pending";
        }).length;
        const cancelled = allOrders.filter(order => normalizeStatus(order.status) === "cancelled").length;

        const totalSpent = allOrders
            .filter(order => normalizeStatus(order.status) !== "cancelled")
            .reduce((sum, order) => sum + getOrderTotal(order), 0);

        if (statTotalOrders) statTotalOrders.textContent = totalOrders;
        if (statDelivered) statDelivered.textContent = delivered;
        if (statProcessing) statProcessing.textContent = processing;
        if (statCancelled) statCancelled.textContent = cancelled;
        if (statTotalSpent) statTotalSpent.textContent = money(totalSpent);
    }

    function renderOrders() {
        if (!ordersList) return;

        const orders = getFilteredOrders();

        ordersList.innerHTML = "";

        if (!orders.length) {
            if (ordersEmpty) ordersEmpty.classList.remove("hidden");
            return;
        }

        if (ordersEmpty) ordersEmpty.classList.add("hidden");

        orders.forEach(order => {
            ordersList.appendChild(createOrderRow(order));
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function createOrderRow(order) {
        const row = document.createElement("div");
        row.className = "order-row";

        const items = getOrderItems(order);
        const orderId = getOrderId(order);
        const status = normalizeStatus(order.status);
        const createdAt = order.createdAt || order.date;
        const deliveredAt = order.deliveredAt || order.updatedAt || order.createdAt;

        row.innerHTML = `
            <div class="order-info">
                <div class="order-id">
    <span>Order</span>
    <strong>#${getOrderId(order)}</strong>
</div>
                <div class="order-meta">
                    ${items.length} Item${items.length > 1 ? "s" : ""}<br>
                    ${getPaymentMethod(order)}
                </div>
            </div>

            <div class="order-items-preview">
                ${renderItemThumbs(items)}
            </div>

            <div class="order-date">
                <strong>${formatDate(createdAt)}</strong>
                <span>${formatTime(createdAt)}</span>
            </div>

            <div class="order-amount">
                <strong>${money(getOrderTotal(order))}</strong>
                <a href="#" class="view-details-link" data-id="${order.id}">View Details</a>
            </div>

            <div class="order-status">
                <span class="status-badge status-${status}">
                    ${getStatusLabel(status)}
                </span>
                <span class="order-status-date">
                    ${status === "delivered" ? formatDate(deliveredAt) : getStatusSubText(status)}
                </span>
            </div>

            <div class="order-actions">
                <button type="button" class="view-order-btn" data-id="${order.id}">
                    View Order
                </button>

                <button type="button" class="track-order-btn" data-id="${order.id}" aria-label="Track order">
                    <i data-lucide="truck"></i>
                </button>
            </div>
        `;

        return row;
    }

    function renderItemThumbs(items) {
        const visible = items.slice(0, 3);
        const more = items.length - visible.length;

        let html = visible.map(item => {
            return `
                <div class="order-item-thumb">
                    <img
                        src="${getImagePath(item.image || item.imageUrl || item.thumbnail)}"
                        alt="${item.name || "Product"}"
                        onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';"
                    >
                </div>
            `;
        }).join("");

        if (more > 0) {
            html += `<div class="more-items">+${more}</div>`;
        }

        return html || `<span class="order-meta">No items</span>`;
    }

    function getStatusSubText(status) {
        if (status === "processing") return "Preparing to ship";
        if (status === "pending") return "Order received";
        if (status === "cancelled") return "Order cancelled";
        return "Status updated";
    }

    function openOrderModal(orderId) {
        const order = allOrders.find(item => String(item.id) === String(orderId));

        if (!order || !modal || !modalOverlay || !modalBody) {
            return;
        }

        const items = getOrderItems(order);

        modalBody.innerHTML = `
            <div class="modal-order-summary">
                <div class="modal-info-box">
                    <span>Order ID</span>
                    <strong>#${getOrderId(order).replace("#", "")}</strong>
                </div>

                <div class="modal-info-box">
                    <span>Status</span>
                    <strong>${getStatusLabel(order.status)}</strong>
                </div>

                <div class="modal-info-box">
                    <span>Date</span>
                    <strong>${formatDate(order.createdAt || order.date)}</strong>
                </div>

                <div class="modal-info-box">
                    <span>Total</span>
                    <strong>${money(getOrderTotal(order))}</strong>
                </div>

                <div class="modal-info-box">
                    <span>Payment</span>
                    <strong>${getPaymentMethod(order)}</strong>
                </div>

                <div class="modal-info-box">
                    <span>Customer</span>
                    <strong>${order.customer?.name || "Customer"}</strong>
                </div>
            </div>

            <h3 style="margin:0 0 10px;font-size:17px;">Products</h3>

            <div>
                ${items.map(item => `
                    <div class="modal-product">
                        <img
                            src="${getImagePath(item.image || item.imageUrl || item.thumbnail)}"
                            alt="${item.name || "Product"}"
                            onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';"
                        >

                        <div>
                            <h4>${item.name || "Product"}</h4>
                            <p>
                                Qty: ${item.quantity || 1}
                                ${item.size ? ` • Size: ${item.size}` : ""}
                                ${item.color ? ` • Color: ${item.color}` : ""}
                            </p>
                        </div>

                        <strong>${money(Number(item.price || 0) * Number(item.quantity || 1))}</strong>
                    </div>
                `).join("") || "<p>No product item found.</p>"}
            </div>
        `;

        modalOverlay.classList.add("active");
        modal.classList.add("active");

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function closeOrderModal() {
        if (modalOverlay) modalOverlay.classList.remove("active");
        if (modal) modal.classList.remove("active");
    }

    function updateHeaderCounts() {
        const cart = JSON.parse(localStorage.getItem("taqdeerCart")) || [];
        const wishlist = JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];

        const cartQty = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

        document.querySelectorAll(".cart-count").forEach(element => {
            element.textContent = cartQty;
        });

        document.querySelectorAll(".wishlist-count").forEach(element => {
            element.textContent = wishlist.length;
        });
    }

    if (orderFilter) {
        orderFilter.addEventListener("change", () => {
            activeFilter = orderFilter.value;
            renderOrders();
        });
    }

    if (orderSearchInput) {
        orderSearchInput.addEventListener("input", () => {
            searchText = orderSearchInput.value.trim();
            renderOrders();
        });
    }

    document.addEventListener("click", event => {
        const statBtn = event.target.closest(".order-stat-card button");
        const viewBtn = event.target.closest(".view-order-btn");
        const viewLink = event.target.closest(".view-details-link");
        const trackBtn = event.target.closest(".track-order-btn");

        if (statBtn) {
            activeFilter = statBtn.dataset.filter || "all";

            if (orderFilter) {
                orderFilter.value = activeFilter;
            }

            renderOrders();
            return;
        }

        if (viewBtn) {
            openOrderModal(viewBtn.dataset.id);
            return;
        }

        if (viewLink) {
            event.preventDefault();
            openOrderModal(viewLink.dataset.id);
            return;
        }

        if (trackBtn) {
            const order = allOrders.find(item => String(item.id) === String(trackBtn.dataset.id));

            if (order) {
                localStorage.setItem("taqdeerTrackOrderId", getOrderId(order));
            }

            window.location.href = "track.html";
        }
    });

    if (modalClose) {
        modalClose.addEventListener("click", closeOrderModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", closeOrderModal);
    }

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener("click", () => {
            mobileNav.classList.toggle("active");
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (window.auth) {
                await window.auth.signOut();
            }

            window.location.href = "../auth/login.html";
        });
    }

    updateHeaderCounts();
    loadOrders();

});