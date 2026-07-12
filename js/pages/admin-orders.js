/*=========================================================
        TAQDEER FASHION
        ADMIN ORDER MANAGEMENT FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const ordersContainer =
    document.querySelector("#admin-orders-list");

    const refreshBtn =
    document.querySelector("#refresh-orders");

    const totalOrdersEl =
    document.querySelector("#total-orders");

    const pendingOrdersEl =
    document.querySelector("#pending-orders");

    const deliveredOrdersEl =
    document.querySelector("#delivered-orders");

    const totalRevenueEl =
    document.querySelector("#total-revenue");


    let allOrders = [];


    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }


    function statusClass(status){

        return status
        ?
        status.toLowerCase()
        :
        "pending";

    }


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


    function shortId(id){

        if(!id){
            return "";
        }

        return id.length > 14
        ?
        id.slice(0,14) + "..."
        :
        id;

    }


    function updateStats(orders){

        const totalOrders =
        orders.length;

        const pendingOrders =
        orders.filter(
            order =>
            (order.status || "pending").toLowerCase() === "pending"
        ).length;

        const deliveredOrders =
        orders.filter(
            order =>
            (order.status || "").toLowerCase() === "delivered"
        ).length;

        const totalRevenue =
        orders.reduce(
            (sum,order)=>
            sum + Number(order.total || 0),
            0
        );


        if(totalOrdersEl){
            totalOrdersEl.innerText = totalOrders;
        }

        if(pendingOrdersEl){
            pendingOrdersEl.innerText = pendingOrders;
        }

        if(deliveredOrdersEl){
            deliveredOrdersEl.innerText = deliveredOrders;
        }

        if(totalRevenueEl){
            totalRevenueEl.innerText = money(totalRevenue);
        }

    }


    async function loadOrders(){

        try{

            if(!window.db){

                console.error("Firebase DB not ready");

                return;

            }

            if(ordersContainer){

                ordersContainer.innerHTML = `
                    <div class="admin-loading">
                        Loading orders...
                    </div>
                `;

            }


            const snapshot =
            await window.db
            .collection("orders")
            .get();


            allOrders =
            snapshot.docs.map(doc=>{

                return {
                    id: doc.id,
                    ...doc.data()
                };

            });


            allOrders.sort((a,b)=>{

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


            updateStats(allOrders);

            renderOrders(allOrders);

        }

        catch(error){

            console.error("Admin Orders Error:", error);

            if(ordersContainer){

                ordersContainer.innerHTML = `
                    <div class="admin-empty">
                        <h3>Could not load orders</h3>
                        <p>Please check Firebase connection.</p>
                    </div>
                `;

            }

        }

    }


    function renderOrders(orders){

        if(!ordersContainer){
            return;
        }

        ordersContainer.innerHTML = "";


        if(!orders.length){

            ordersContainer.innerHTML = `
                <div class="admin-empty">
                    <h3>No Orders Found</h3>
                    <p>New customer orders will appear here.</p>
                </div>
            `;

            return;

        }


        orders.forEach(order=>{

            const status =
            order.status || "pending";

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


            const card =
            document.createElement("div");

            card.className =
            "admin-order-card";


            card.innerHTML = `

                <div class="admin-order-top">

                    <div>

                        <span class="admin-order-label">
                            ORDER ID
                        </span>

                        <h3>
                            #${shortId(order.id)}
                        </h3>

                        <p>
                            ${formatDate(order.createdAt)}
                        </p>

                    </div>


                    <span class="status ${statusClass(status)}">
                        ${status}
                    </span>

                </div>


                <div class="admin-order-customer">

                    <div>

                        <span>Customer</span>

                        <strong>
                            ${order.customer?.name || "Guest"}
                        </strong>

                    </div>


                    <div>

                        <span>Phone</span>

                        <strong>
                            ${order.customer?.phone || "N/A"}
                        </strong>

                    </div>


                    <div>

                        <span>Payment</span>

                        <strong>
                            ${order.paymentMethod || "COD"}
                        </strong>

                    </div>


                    <div>

                        <span>Total</span>

                        <strong>
                            ${money(order.total)}
                        </strong>

                    </div>

                </div>


                <div class="admin-order-info">

                    <p>
                        📦 Items: ${itemCount}
                    </p>

                    <p>
                        📍 ${order.customer?.address || "No address"}
                    </p>

                </div>


                <div class="admin-order-actions">

                    <select class="order-status-select" data-id="${order.id}">

                        <option value="pending" ${status === "pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="processing" ${status === "processing" ? "selected" : ""}>
                            Processing
                        </option>

                        <option value="shipped" ${status === "shipped" ? "selected" : ""}>
                            Shipped
                        </option>

                        <option value="delivered" ${status === "delivered" ? "selected" : ""}>
                            Delivered
                        </option>

                        <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>
                            Cancelled
                        </option>

                    </select>


                    <a
                    href="../orders/details.html?id=${order.id}"
                    class="admin-view-order">

                        View Details

                    </a>

                </div>

            `;


            ordersContainer.appendChild(card);

        });

    }


    document.addEventListener("change", async(e)=>{

        if(!e.target.classList.contains("order-status-select")){
            return;
        }

        const id =
        e.target.dataset.id;

        const status =
        e.target.value;

        try{

            await window.db
            .collection("orders")
            .doc(id)
            .update({
                status,
                updatedAt: new Date().toISOString()
            });


            allOrders =
            allOrders.map(order=>{

                if(order.id === id){

                    return {
                        ...order,
                        status
                    };

                }

                return order;

            });


            updateStats(allOrders);

            renderOrders(allOrders);

        }

        catch(error){

            console.error("Status update error:", error);

            alert("Status update failed");

        }

    });


    if(refreshBtn){

        refreshBtn.addEventListener("click", ()=>{

            loadOrders();

        });

    }


    loadOrders();

});