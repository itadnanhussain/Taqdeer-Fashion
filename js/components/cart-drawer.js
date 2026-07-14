/*=========================================================
    TAQDEER FASHION - GLOBAL CART DRAWER
=========================================================*/

"use strict";

(function(){

    const CART_KEY = "taqdeerCart";

    function money(value){
        return "৳" + Number(value || 0).toLocaleString();
    }

    function isInsidePagesFolder(){
        return window.location.pathname.includes("/pages/");
    }

    function pagePath(pathFromPages){
        return isInsidePagesFolder()
            ? pathFromPages
            : "pages/" + pathFromPages.replace("../", "");
    }

    function getCart(){
        const cartService = window.CartService || window.cartService;

        if(cartService && typeof cartService.getCart === "function"){
            return cartService.getCart() || [];
        }

        try{
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        }
        catch(error){
            return [];
        }
    }

    function getImage(path){
        const fallback = isInsidePagesFolder()
            ? "../../assets/placeholders/product.jpg"
            : "assets/placeholders/product.jpg";

        if(!path){
            return fallback;
        }

        if(path.startsWith("http") || path.startsWith("data:")){
            return path;
        }

        if(path.startsWith("../../") || path.startsWith("../")){
            return path;
        }

        if(path.startsWith("assets/")){
            return isInsidePagesFolder() ? "../../" + path : path;
        }

        return fallback;
    }

    function renderDrawer(){
        const body = document.getElementById("tf-cart-drawer-items");
        const totalEl = document.getElementById("tf-cart-drawer-total");
        const checkoutLink = document.getElementById("tf-drawer-checkout");
        const viewCartLink = document.getElementById("tf-drawer-view-cart");

        if(!body){
            return;
        }

        if(checkoutLink){
            checkoutLink.href = pagePath("../checkout/index.html");
        }

        if(viewCartLink){
            viewCartLink.href = pagePath("../cart/index.html");
        }

        const cart = getCart();

        body.innerHTML = "";

        if(!cart.length){
            body.innerHTML = `
                <div class="tf-drawer-empty">
                    <h4>Your cart is empty</h4>
                    <p>Add some products first.</p>
                </div>
            `;

            if(totalEl){
                totalEl.textContent = money(0);
            }

            return;
        }

        let subtotal = 0;

        cart.forEach(item=>{
            const qty = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const lineTotal = price * qty;

            subtotal += lineTotal;

            const card = document.createElement("div");
            card.className = "tf-drawer-item";

            card.innerHTML = `
                <div class="tf-drawer-item-img">
                    <img
                        src="${getImage(item.image)}"
                        alt="${item.name || "Product"}"
                        onerror="this.onerror=null;this.src='${getImage("")}';"
                    >
                </div>

                <div class="tf-drawer-item-info">
                    <h4>${item.name || "Product"}</h4>
                    <p>
                        Qty: ${qty}
                        ${item.size ? " • Size: " + item.size : ""}
                        ${item.color ? " • Color: " + item.color : ""}
                    </p>
                    <strong>${money(lineTotal)}</strong>
                </div>
            `;

            body.appendChild(card);
        });

        if(totalEl){
            totalEl.textContent = money(subtotal);
        }
    }

    function openDrawer(){
        renderDrawer();

        const drawer = document.getElementById("tf-cart-drawer");
        const overlay = document.getElementById("tf-cart-overlay");

        if(drawer){
            drawer.classList.add("active");
        }

        if(overlay){
            overlay.classList.add("active");
        }

        document.body.style.overflow = "hidden";
    }

    function closeDrawer(){
        const drawer = document.getElementById("tf-cart-drawer");
        const overlay = document.getElementById("tf-cart-overlay");

        if(drawer){
            drawer.classList.remove("active");
        }

        if(overlay){
            overlay.classList.remove("active");
        }

        document.body.style.overflow = "";
    }

    document.addEventListener("DOMContentLoaded",()=>{
        const closeBtn = document.getElementById("tf-cart-close");
        const overlay = document.getElementById("tf-cart-overlay");

        if(closeBtn){
            closeBtn.addEventListener("click", closeDrawer);
        }

        if(overlay){
            overlay.addEventListener("click", closeDrawer);
        }

        renderDrawer();
    });

    window.addEventListener("cartUpdated", renderDrawer);

    window.TaqdeerCartDrawer = {
        open: openDrawer,
        close: closeDrawer,
        render: renderDrawer
    };

})();