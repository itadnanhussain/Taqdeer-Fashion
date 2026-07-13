/*=========================================================
        TAQDEER FASHION
        ORDER SUCCESS PAGE - FINAL CLEAN JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /*=========================================
        DELIVERY DATE CLEAN FORMAT
=========================================*/

function polishDeliveryDate(){

    const deliveryDate =
    document.getElementById("delivery-date");

    if(!deliveryDate){
        return;
    }

    const rawText =
    deliveryDate.textContent.trim();

    if(!rawText || rawText === "—"){
        return;
    }

    if(rawText.includes(" - ")){

        const parts =
        rawText.split(" - ");

        if(parts.length >= 2){

            deliveryDate.innerHTML = `
                <span class="delivery-line">
                    ${parts[0]}
                    <span class="delivery-dash">-</span>
                </span>
                <span class="delivery-line">
                    ${parts.slice(1).join(" - ")}
                </span>
            `;

        }

    }

}

/*=========================================================
        HELPERS
=========================================================*/

const money = (value) => {
    return "৳" + Number(value || 0).toLocaleString();
};


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

    return fallback;

}


function generateOrderId(){

    const existing =
    sessionStorage.getItem("taqdeerLastOrderId") ||
    localStorage.getItem("taqdeerLastOrderId");

    if(existing){
        return existing;
    }

    const randomNumber =
    Math.floor(100000000 + Math.random() * 900000000);

    const orderId =
    "#TF" + randomNumber;

    sessionStorage.setItem("taqdeerLastOrderId", orderId);
    localStorage.setItem("taqdeerLastOrderId", orderId);

    return orderId;

}


function formatDate(date){

    return date.toLocaleDateString("en-US", {
        month:"short",
        day:"numeric",
        year:"numeric"
    });

}


function formatTime(date){

    return date.toLocaleTimeString("en-US", {
        hour:"numeric",
        minute:"2-digit",
        hour12:true
    });

}


function getDeliveryRange(){

    const start = new Date();
    const end = new Date();

    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 5);

    return `${formatDate(start)} - ${formatDate(end)}`;

}





/*=========================================================
        DOM
=========================================================*/

const successCard =
document.querySelector(".success-hero-card");

const orderIdElement =
document.getElementById("success-order-id");

const copyBtn =
document.getElementById("copy-order-id");

const copyToast =
document.getElementById("copy-toast");

const orderDateElement =
document.getElementById("order-date");

const deliveryDateElement =
document.getElementById("delivery-date");

const customerEmailElement =
document.getElementById("customer-email");

const paymentMethodElement =
document.getElementById("payment-method");

const summaryProducts =
document.getElementById("summary-products");

const summaryItemCount =
document.getElementById("summary-item-count");

const summarySubtotal =
document.getElementById("summary-subtotal");

const summaryDelivery =
document.getElementById("summary-delivery");

const summaryDiscount =
document.getElementById("summary-discount");

const summaryTotal =
document.getElementById("summary-total");

const recommendProducts =
document.getElementById("recommend-products");

const wishlistCount =
document.getElementById("wishlist-count");

const cartCount =
document.getElementById("cart-count");





/*=========================================================
        HEADER COUNTS
=========================================================*/

function updateCounts(){

    let wishlist = [];
    let cart = [];

    try{
        wishlist =
        JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];
    }
    catch(error){
        wishlist = [];
    }

    try{
        cart =
        JSON.parse(localStorage.getItem("taqdeerCart")) || [];
    }
    catch(error){
        cart = [];
    }

    const cartTotalItems =
    cart.reduce(
        (total,item) => total + Number(item.quantity || 1),
        0
    );

    if(wishlistCount){
        wishlistCount.textContent = wishlist.length;
    }

    if(cartCount){
        cartCount.textContent = cartTotalItems;
    }

}





/*=========================================================
        ORDER DATA
=========================================================*/

function getOrderProducts(){

    const keys = [
        "taqdeerLastOrderItems",
        "taqdeerCheckoutItems",
        "taqdeerOrderItems",
        "taqdeerLastCheckoutItems",
        "taqdeerCart"
    ];

    for(const key of keys){

        try{

            const data =
            JSON.parse(sessionStorage.getItem(key)) ||
            JSON.parse(localStorage.getItem(key)) ||
            [];

            if(Array.isArray(data) && data.length){
                return data;
            }

        }
        catch(error){
            // ignore invalid storage
        }

    }

    return [];

}





/*=========================================================
        RENDER ORDER INFO
=========================================================*/

function renderOrderInfo(){

    const orderId =
    generateOrderId();

    const now =
    new Date();

    if(orderIdElement){
        orderIdElement.textContent = orderId;
    }

    if(orderDateElement){
        orderDateElement.innerHTML =
        `${formatDate(now)}<br>${formatTime(now)}`;
    }

    if(deliveryDateElement){
        deliveryDateElement.textContent =
        getDeliveryRange();
    }

    if(paymentMethodElement){
        paymentMethodElement.textContent =
        "Cash on Delivery";
    }

   if(customerEmailElement){

    const setFallbackEmail = () => {

        let email = "customer@email.com";

        try{
            const savedUser =
            JSON.parse(localStorage.getItem("taqdeerUser")) || {};

            email =
            savedUser.email ||
            localStorage.getItem("taqdeerUserEmail") ||
            localStorage.getItem("userEmail") ||
            "customer@email.com";
        }
        catch(error){
            email =
            localStorage.getItem("taqdeerUserEmail") ||
            "customer@email.com";
        }

        customerEmailElement.textContent = email;

    };


    if(window.firebase && firebase.auth){

        const user =
        firebase.auth().currentUser;

        if(user && user.email){

            customerEmailElement.textContent =
            user.email;

        }
        else{

            firebase.auth().onAuthStateChanged(authUser => {

                customerEmailElement.textContent =
                authUser && authUser.email
                ?
                authUser.email
                :
                "customer@email.com";

            });

        }

    }
    else if(window.auth && window.auth.currentUser){

        customerEmailElement.textContent =
        window.auth.currentUser.email || "customer@email.com";

    }
    else{

        setFallbackEmail();

    }

}
}


setTimeout(()=>{

    polishDeliveryDate();

},100);


/*=========================================================
        RENDER SUMMARY
=========================================================*/

function renderSummary(){

    if(!summaryProducts){
        return;
    }

    const products =
    getOrderProducts();

    summaryProducts.innerHTML = "";

    if(!products.length){

        summaryProducts.innerHTML = `

    <div class="summary-product empty-order">

        <img
            src="../../assets/placeholders/product.jpg"
            alt="Product">

        <div>

            <h3>No product found</h3>

            <p>
                Order item was not saved before cart clear.
                Save cart items before redirecting to success page.
            </p>

            <strong>৳0</strong>

        </div>

    </div>

`;

        if(summaryItemCount){
            summaryItemCount.textContent = "0 Items";
        }

        if(summarySubtotal){
            summarySubtotal.textContent = money(0);
        }

        if(summaryDelivery){
            summaryDelivery.textContent = money(0);
        }

        if(summaryDiscount){
            summaryDiscount.textContent = "-৳0";
        }

        if(summaryTotal){
            summaryTotal.textContent = money(0);
        }

        return;

    }

    let subtotal = 0;

    products.forEach(product => {

        const quantity =
        Number(product.quantity || 1);

        const price =
        Number(product.price || 0);

        subtotal += price * quantity;

        const card =
        document.createElement("div");

        card.className =
        "summary-product";

        card.innerHTML = `

            <img
                src="${getImagePath(product.image)}"
                alt="${product.name || "Product"}"
                onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

            <div>

                <h3>${product.name || "Product"}</h3>

                <p>
                    Size: ${product.size || "M"}
                    ${product.color ? ` | Color: ${product.color}` : ""}
                </p>

                <p>Qty: ${quantity}</p>

                <strong>${money(price)}</strong>

            </div>

        `;

        summaryProducts.appendChild(card);

    });

    const delivery =
    subtotal > 0 ? 80 : 0;

    const discount =
    Number(sessionStorage.getItem("taqdeerLastOrderDiscount") || 0);

    const total =
    subtotal + delivery - discount;

    if(summaryItemCount){
        summaryItemCount.textContent =
        products.length === 1
        ?
        "1 Item"
        :
        `${products.length} Items`;
    }

    if(summarySubtotal){
        summarySubtotal.textContent =
        money(subtotal);
    }

    if(summaryDelivery){
        summaryDelivery.textContent =
        money(delivery);
    }

    if(summaryDiscount){
        summaryDiscount.textContent =
        "-৳" + discount.toLocaleString();
    }

    if(summaryTotal){
        summaryTotal.textContent =
        money(total);
    }

}





/*=========================================================
        RECOMMENDED PRODUCTS
=========================================================*/

function renderRecommended(){

    if(!recommendProducts){
        return;
    }

    const products = [
        {
            name:"Premium T-Shirt",
            price:550,
            image:"../../assets/placeholders/product.jpg"
        },
        {
            name:"Casual Shirt",
            price:750,
            image:"../../assets/placeholders/product.jpg"
        },
        {
            name:"Classic Panjabi",
            price:1150,
            image:"../../assets/placeholders/product.jpg"
        },
        {
            name:"Formal Trousers",
            price:1090,
            image:"../../assets/placeholders/product.jpg"
        },
        {
            name:"Drop Shoulder Tee",
            price:590,
            image:"../../assets/placeholders/product.jpg"
        },
        {
            name:"Striped Polo Shirt",
            price:850,
            image:"../../assets/placeholders/product.jpg"
        }
    ];

    recommendProducts.innerHTML = "";

    products.forEach(product => {

        const card =
        document.createElement("article");

        card.className =
        "recommend-card";

        card.innerHTML = `

            <button type="button" aria-label="Add to wishlist">
                <i data-lucide="heart"></i>
            </button>

            <img
                src="${product.image}"
                alt="${product.name}"
                onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

            <h3>${product.name}</h3>

            <strong>${money(product.price)}</strong>

        `;

        recommendProducts.appendChild(card);

    });

}





/*=========================================================
        COPY ORDER ID
=========================================================*/

function setupCopy(){

    if(!copyBtn || !orderIdElement){
        return;
    }

    copyBtn.addEventListener("click", async () => {

        const orderId =
        orderIdElement.textContent.trim();

        try{

            await navigator.clipboard.writeText(orderId);

           copyBtn.classList.add("copied");

if(window.lucide){
    copyBtn.innerHTML = `<i data-lucide="check"></i>`;
    lucide.createIcons();
}

if(copyToast){
    copyToast.textContent = "Order ID copied";
    copyToast.classList.add("show");
}

setTimeout(() => {

    copyBtn.classList.remove("copied");

    copyBtn.innerHTML = `<i data-lucide="copy"></i>`;

    if(window.lucide){
        lucide.createIcons();
    }

    if(copyToast){
        copyToast.classList.remove("show");
    }

}, 1700);

        }
        catch(error){

            const tempInput =
            document.createElement("input");

            tempInput.value =
            orderId;

            document.body.appendChild(tempInput);

            tempInput.select();

            document.execCommand("copy");

            tempInput.remove();

            if(copyToast){
                copyToast.textContent = "Order ID copied";
                copyToast.classList.add("show");
            }

            setTimeout(() => {

                if(copyToast){
                    copyToast.classList.remove("show");
                }

            }, 1700);

        }

    });

}





/*=========================================================
        ANIMATION
=========================================================*/

function setupAnimation(){

    if(!successCard){
        return;
    }

    successCard.classList.add("animate-ready");

    const confettiPieces =
    successCard.querySelectorAll(".confetti span");

    confettiPieces.forEach((piece,index) => {

        const total =
        confettiPieces.length || 1;

        const angle =
        ((360 / total) * index + (Math.random() * 22 - 11)) *
        (Math.PI / 180);

        const distance =
        80 + Math.random() * 110;

        const x =
        Math.cos(angle) * distance;

        const y =
        Math.sin(angle) * distance;

        const rotation =
        `${Math.floor(Math.random() * 720 - 360)}deg`;

        piece.style.setProperty("--x", `${x}px`);
        piece.style.setProperty("--y", `${y}px`);
        piece.style.setProperty("--r", rotation);
        piece.style.animationDelay = `${index * 28}ms`;

    });

    setTimeout(() => {
        successCard.classList.add("loaded");
    }, 140);

}





/*=========================================================
        INIT
=========================================================*/

renderOrderInfo();

renderSummary();



updateCounts();

setupCopy();

setupAnimation();

if(window.lucide){
    lucide.createIcons();
}


});
setTimeout(()=>{

    polishDeliveryDate();

},100);
/*=========================================
        FINAL LOAD ANIMATION
=========================================*/

window.addEventListener("load",()=>{

    const heroCard =
    document.querySelector(".success-hero-card");

    if(heroCard){

        setTimeout(()=>{

            heroCard.classList.add("loaded");

        },250);

    }

});