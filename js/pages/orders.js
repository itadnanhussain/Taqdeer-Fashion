/*=========================================================
                TAQDEER FASHION
                USER ORDERS SYSTEM FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const ordersContainer =
    document.querySelector(".orders-container");


    /*=========================================
            MONEY
    =========================================*/

    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }


    /*=========================================
            STATUS CLASS
    =========================================*/

    function getStatusClass(status){

        return status
        ?
        status.toLowerCase()
        :
        "pending";

    }


    /*=========================================
            FORMAT DATE
    =========================================*/

    function formatDate(value){

        if(!value){
            return "No date";
        }

        let date;

        if(value.toDate){

            date = value.toDate();

        }

        else{

            date = new Date(value);

        }

        if(isNaN(date.getTime())){
            return "No date";
        }

        return date.toLocaleDateString(
            "en-US",
            {
                year:"numeric",
                month:"short",
                day:"numeric"
            }
        );

    }


    /*=========================================
            FORMAT SHORT ID
    =========================================*/

    function shortId(id){

        if(!id){
            return "";
        }

        return id.length > 12
        ?
        id.slice(0, 12) + "..."
        :
        id;

    }


    /*=========================================
            RENDER EMPTY
    =========================================*/

    function renderEmpty(){

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    <i data-lucide="package-open"></i>
                </div>

                <h3>No Orders Found</h3>

                <p>
                    You have not placed any orders yet.
                </p>

                <a href="../shop/index.html">
                    Start Shopping
                </a>

            </div>

        `;

        if(window.lucide){
            lucide.createIcons();
        }

    }


    /*=========================================
            RENDER LOGIN STATE
    =========================================*/

    function renderLoginRequired(){

        ordersContainer.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    <i data-lucide="lock"></i>
                </div>

                <h3>Please Login First</h3>

                <p>
                    Login to view your order history.
                </p>

                <a href="../auth/login.html">
                    Login Now
                </a>

            </div>

        `;

        if(window.lucide){
            lucide.createIcons();
        }

    }


    /*=========================================
            RENDER ORDERS
    =========================================*/

    function renderOrders(orders){

        if(!ordersContainer){
            return;
        }

        ordersContainer.innerHTML = "";

        if(!orders || orders.length === 0){

            renderEmpty();

            return;

        }


        orders.forEach(order => {

            const status =
            order.status || "pending";

            const card =
            document.createElement("div");

            card.className =
            "order-card";

            const itemCount =
            order.items
            ?
            order.items.reduce(
                (total,item)=>
                total + Number(item.quantity || 1),
                0
            )
            :
            0;


            card.innerHTML = `

                <div class="order-card-header">

                    <div>

                        <span class="order-label">
                            ORDER ID
                        </span>

                        <h3>
                            #${shortId(order.id)}
                        </h3>

                        <small>
                            ${formatDate(order.createdAt)}
                        </small>

                    </div>


                    <span class="order-status ${getStatusClass(status)}">
                        ${status}
                    </span>

                </div>


                <div class="order-card-body">

                    <div class="order-body-item">

                        <span>Items</span>

                        <strong>
                            ${itemCount}
                        </strong>

                    </div>


                    <div class="order-body-item">

                        <span>Payment</span>

                        <strong>
                            ${order.paymentMethod || "COD"}
                        </strong>

                    </div>


                    <div class="order-body-item">

                        <span>Total</span>

                        <strong>
                            ${money(order.total)}
                        </strong>

                    </div>

                </div>


                <div class="order-mini-timeline">

                    <span class="active">
                        Placed
                    </span>

                    <span class="${
                        ["processing","shipped","delivered"].includes(status)
                        ? "active"
                        : ""
                    }">
                        Processing
                    </span>

                    <span class="${
                        ["shipped","delivered"].includes(status)
                        ? "active"
                        : ""
                    }">
                        Shipped
                    </span>

                    <span class="${
                        status === "delivered"
                        ? "active"
                        : ""
                    }">
                        Delivered
                    </span>

                </div>


                <div class="order-card-footer">

                    <a href="details.html?id=${order.id}" class="order-details-btn">
                        View Details
                    </a>

                    <a href="../shop/index.html" class="order-shop-btn">
                        Continue Shopping
                    </a>

                </div>

            `;

            ordersContainer.appendChild(card);

        });

    }


    /*=========================================
            LOAD ORDERS
    =========================================*/

    async function loadOrders(){

        try{

            if(!window.auth || !window.db){

                console.error("Firebase not ready");

                return;

            }

            ordersContainer.innerHTML = `
                <div class="orders-loading">
                    Loading orders...
                </div>
            `;


            window.auth.onAuthStateChanged(
                async(user)=>{

                    if(!user){

                        renderLoginRequired();

                        return;

                    }


                    const snapshot =
                    await window.db
                    .collection("orders")
                    .where("userId", "==", user.uid)
                    .get();


                    const orders =
                    snapshot.docs.map(doc=>{

                        return {
                            id: doc.id,
                            ...doc.data()
                        };

                    });


                    orders.sort((a,b)=>{

                        const dateA =
                        a.createdAt?.toDate
                        ?
                        a.createdAt.toDate()
                        :
                        new Date(a.createdAt || 0);

                        const dateB =
                        b.createdAt?.toDate
                        ?
                        b.createdAt.toDate()
                        :
                        new Date(b.createdAt || 0);

                        return dateB - dateA;

                    });


                    renderOrders(orders);

                }
            );

        }

        catch(error){

            console.error("Orders loading error:", error);

            ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <h3>Something went wrong</h3>
                    <p>Could not load orders.</p>
                </div>
            `;

        }

    }


    loadOrders();


    if(window.CartService){
        window.CartService.updateCartCount();
    }

});