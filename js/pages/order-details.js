/*=========================================================
                TAQDEER FASHION
                ORDER DETAILS SYSTEM FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const timelineSteps =
    document.querySelectorAll(".timeline-step");

    const orderIdElement =
    document.querySelector("#order-id");

    const statusElement =
    document.querySelector("#order-status");

    const productsContainer =
    document.querySelector("#order-products-list");

    const customerName =
    document.querySelector("#customer-name");

    const customerPhone =
    document.querySelector("#customer-phone");

    const customerAddress =
    document.querySelector("#customer-address");

    const paymentMethod =
    document.querySelector("#payment-method");

    const orderSubtotal =
    document.querySelector("#order-subtotal");

    const orderDelivery =
    document.querySelector("#order-delivery");

    const orderTotal =
    document.querySelector("#order-total");



    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }



    function getImagePath(path){

        const fallback =
        "../../assets/placeholders/product.jpg";

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

        return fallback;

    }



    function updateTimeline(status){

        const steps = [
            "pending",
            "processing",
            "shipped",
            "delivered"
        ];

        timelineSteps.forEach(step=>{
            step.classList.remove("active");
        });

        const currentStatus =
        status
        ?
        status.toLowerCase()
        :
        "pending";

        const currentIndex =
        steps.indexOf(currentStatus);

        if(currentIndex !== -1){

            for(let i = 0; i <= currentIndex; i++){

                timelineSteps[i].classList.add("active");

            }

        }

    }



    const params =
    new URLSearchParams(window.location.search);

    const orderId =
    params.get("id");



    if(!orderId){

        if(orderIdElement){
            orderIdElement.innerText = "Not Found";
        }

        return;

    }



    async function loadOrder(){

        try{

            if(!window.OrderService){

                console.error("Order service missing");

                return;

            }

            const order =
            await window.OrderService.getOrderById(orderId);

            if(!order){

                if(orderIdElement){
                    orderIdElement.innerText = "Order not found";
                }

                return;

            }

            renderOrder(order);

        }

        catch(error){

            console.error("Order Details Error:", error);

        }

    }



    function renderOrder(order){

        if(orderIdElement){
            orderIdElement.innerText = order.id || orderId;
        }

        const status =
        order.status || "pending";

        if(statusElement){

            statusElement.innerText = status;
            statusElement.className = `order-status ${status.toLowerCase()}`;

        }

        updateTimeline(status);


        if(customerName){
            customerName.innerText = order.customer?.name || "—";
        }

        if(customerPhone){
            customerPhone.innerText = order.customer?.phone || "—";
        }

        if(customerAddress){
            customerAddress.innerText = order.customer?.address || "—";
        }

        if(paymentMethod){
            paymentMethod.innerText = order.paymentMethod || "COD";
        }

        if(orderSubtotal){
            orderSubtotal.innerText = money(order.subtotal);
        }

        if(orderDelivery){
            orderDelivery.innerText = money(order.delivery);
        }

        if(orderTotal){
            orderTotal.innerText = money(order.total);
        }

        renderProducts(order.items || []);

    }



    function renderProducts(items){

        if(!productsContainer){
            return;
        }

        productsContainer.innerHTML = "";

        if(!items.length){

            productsContainer.innerHTML = `
                <div class="empty-products">
                    No products found in this order.
                </div>
            `;

            return;

        }


        items.forEach(item=>{

            const product =
            document.createElement("div");

            product.className =
            "order-product-item";

            const imagePath =
            getImagePath(item.image);

            const quantity =
            Number(item.quantity || 1);

            const price =
            Number(item.price || 0);

            product.innerHTML = `

                <img
                src="${imagePath}"
                alt="${item.name || "Product"}"
                onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                <div>

                    <h4>
                        ${item.name || "Product"}
                    </h4>

                    <p>
                        ${item.category || "Fashion"}
                        ${item.size ? `• Size: ${item.size}` : ""}
                    </p>

                    <span>
                        Qty: ${quantity}
                    </span>

                </div>

                <strong>
                    ${money(price * quantity)}
                </strong>

            `;

            productsContainer.appendChild(product);

        });

    }



    loadOrder();


    if(window.CartService){
        window.CartService.updateCartCount();
    }

});