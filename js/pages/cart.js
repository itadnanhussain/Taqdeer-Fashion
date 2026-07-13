/*=========================================================
        TAQDEER FASHION
        CART PAGE FINAL CLEAN JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


/*=========================================================
        DOM
=========================================================*/

const cartItems =
document.getElementById("cart-items");

const emptyCart =
document.getElementById("empty-cart");

const headerCartCount =
document.getElementById("header-cart-count");

const cartCountLabel =
document.getElementById("cart-count");

const subtotalElement =
document.getElementById("subtotal");

const subtotalLabel =
document.getElementById("subtotal-label");

const deliveryElement =
document.getElementById("delivery");

const discountElement =
document.getElementById("discount");

const totalElement =
document.getElementById("total");

const checkoutBtn =
document.getElementById("checkout-btn");

const clearCartBtn =
document.getElementById("clear-cart-btn");

const recommendProducts =
document.getElementById("recommend-products");





/*=========================================================
        SETTINGS
=========================================================*/

const CART_KEY =
"taqdeerCart";

const CHECKOUT_KEY =
"taqdeerCheckoutCart";

const DELIVERY_CHARGE =
80;

const DISCOUNT =
0;





/*=========================================================
        HELPERS
=========================================================*/

function money(value){

    return "৳" +
    Number(value || 0).toLocaleString();

}



function getCart(){

    try{

        if(window.CartService && typeof window.CartService.getCart === "function"){

            return window.CartService.getCart() || [];

        }

        return JSON.parse(localStorage.getItem(CART_KEY)) || [];

    }

    catch(error){

        console.warn("Cart read failed:",error);

        return [];

    }

}



function saveCart(cart){

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    if(window.CartService && typeof window.CartService.saveCart === "function"){

        try{
            window.CartService.saveCart(cart);
        }
        catch(error){
            console.warn("CartService save failed:",error);
        }

    }

    window.dispatchEvent(
        new Event("cartUpdated")
    );

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
        path.startsWith("../") ||
        path.startsWith("../../")
    ){
        return path;
    }

    if(path.startsWith("assets/")){
        return "../../" + path;
    }

    return fallback;

}



function getQuantityCount(cart){

    return cart.reduce(
        (total,item)=>
        total + Number(item.quantity || 1),
        0
    );

}



function getSubtotal(cart){

    return cart.reduce(
        (total,item)=>
        total +
        Number(item.price || 0) *
        Number(item.quantity || 1),
        0
    );

}



function updateHeaderCounts(cart){

    const quantity =
    getQuantityCount(cart);

    if(headerCartCount){
        headerCartCount.textContent = quantity;
    }

    const cartBadges =
    document.querySelectorAll(".cart-count,.badge.cart-count");

    cartBadges.forEach(badge=>{
        badge.textContent = quantity;
    });

    if(window.CartService && typeof window.CartService.updateCartCount === "function"){
        window.CartService.updateCartCount();
    }

}





/*=========================================================
        RENDER CART
=========================================================*/

function renderCart(){

    if(!cartItems){
        return;
    }

    const cart =
    getCart();

    cartItems.innerHTML = "";

    updateHeaderCounts(cart);

    const quantity =
    getQuantityCount(cart);

    const subtotal =
    getSubtotal(cart);

    const delivery =
    cart.length > 0 ? DELIVERY_CHARGE : 0;

    const discount =
    cart.length > 0 ? DISCOUNT : 0;

    const total =
    Math.max(
        subtotal + delivery - discount,
        0
    );


    if(cartCountLabel){
        cartCountLabel.textContent =
        `${quantity} Item${quantity !== 1 ? "s" : ""}`;
    }

    if(subtotalLabel){
        subtotalLabel.textContent =
        `Subtotal${quantity ? ` (${quantity} Item${quantity !== 1 ? "s" : ""})` : ""}`;
    }

    if(subtotalElement){
        subtotalElement.textContent = money(subtotal);
    }

    if(deliveryElement){
        deliveryElement.textContent = money(delivery);
    }

    if(discountElement){
        discountElement.textContent = "-" + money(discount);
    }

    if(totalElement){
        totalElement.textContent = money(total);
    }


    if(cart.length === 0){

        if(emptyCart){
            emptyCart.classList.add("active");
        }

        return;

    }


    if(emptyCart){
        emptyCart.classList.remove("active");
    }


    cart.forEach(item=>{

        const quantity =
        Number(item.quantity || 1);

        const price =
        Number(item.price || 0);

        const lineTotal =
        price * quantity;

        const row =
        document.createElement("article");

        row.className =
        "cart-item";

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
                        ${item.color ? ` &nbsp; | &nbsp; Color: ${item.color}` : ""}
                    </p>

                    <span class="stock-badge">In Stock</span>

                </div>

            </div>


            <div class="cart-price">
                ${money(price)}
            </div>


            <div class="quantity-control">

                <button
                type="button"
                class="qty-minus"
                data-id="${item.id}">
                    −
                </button>

                <span>${quantity}</span>

                <button
                type="button"
                class="qty-plus"
                data-id="${item.id}">
                    +
                </button>

            </div>


            <div class="cart-line-total">
                ${money(lineTotal)}
            </div>


            <div class="cart-actions">

                <button
                type="button"
                class="cart-action-btn move-wishlist-btn"
                data-id="${item.id}"
                aria-label="Move to wishlist">
                    <i data-lucide="heart"></i>
                </button>

                <button
                type="button"
                class="cart-action-btn remove-btn"
                data-id="${item.id}"
                aria-label="Remove product">
                    <i data-lucide="trash-2"></i>
                </button>

            </div>
        `;

        cartItems.appendChild(row);

    });


    if(window.lucide){
        lucide.createIcons();
    }

}





/*=========================================================
        RECOMMENDED PRODUCTS
=========================================================*/

/*=========================================================
        RECOMMENDED PRODUCTS
=========================================================*/

function getInlinePlaceholder(name){

    const label =
    encodeURIComponent(name || "Product");

    return `
        data:image/svg+xml;charset=UTF-8,
        <svg xmlns='http://www.w3.org/2000/svg' width='260' height='220' viewBox='0 0 260 220'>
            <rect width='260' height='220' fill='%23f7f7f7'/>
            <rect x='70' y='38' width='120' height='120' rx='16' fill='%23ffffff' stroke='%23e5e5e5'/>
            <text x='130' y='178' text-anchor='middle' font-family='Arial' font-size='15' font-weight='700' fill='%23111111'>${label}</text>
        </svg>
    `.replace(/\s+/g," ");
}



function renderRecommended(){

    if(!recommendProducts){
        return;
    }

    const products = [
        {
            id:"rec-tshirt",
            name:"Premium T-Shirt",
            price:550,
            image:"../../assets/placeholders/product.jpg",
            link:"../shop/index.html?category=t-shirt"
        },
        {
            id:"rec-shirt",
            name:"Casual Shirt",
            price:750,
            image:"../../assets/placeholders/product.jpg",
            link:"../shop/index.html?category=shirt"
        },
        {
            id:"rec-panjabi",
            name:"Classic Panjabi",
            price:1150,
            image:"../../assets/placeholders/product.jpg",
            link:"../shop/index.html?category=panjabi"
        }
    ];

    recommendProducts.innerHTML =
    products.map(product=>{

        const fallback =
        getInlinePlaceholder(product.name);

        return `
            <article class="recommend-card">

                <a href="${product.link}" class="recommend-img">
                    <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.onerror=null;this.src='${fallback}';">
                </a>

                <div class="recommend-info">

                    <h4>${product.name}</h4>

                    <strong>${money(product.price)}</strong>

                    <button
                    type="button"
                    class="recommend-add-cart"
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

    if(window.lucide){
        lucide.createIcons();
    }

}




/*=========================================================
        EVENTS
=========================================================*/

document.addEventListener("click",(e)=>{


/* PLUS */

    const plus =
    e.target.closest(".qty-plus");

    if(plus){

        const id =
        plus.dataset.id;

        const cart =
        getCart();

        const item =
        cart.find(product=>String(product.id) === String(id));

        if(item){

            item.quantity =
            Number(item.quantity || 1) + 1;

            saveCart(cart);

            renderCart();

        }

        return;

    }





/* MINUS */

    const minus =
    e.target.closest(".qty-minus");

    if(minus){

        const id =
        minus.dataset.id;

        let cart =
        getCart();

        const item =
        cart.find(product=>String(product.id) === String(id));

        if(item){

            item.quantity =
            Number(item.quantity || 1) - 1;

            if(item.quantity <= 0){

                cart =
                cart.filter(product=>String(product.id) !== String(id));

            }

            saveCart(cart);

            renderCart();

        }

        return;

    }





/* REMOVE */

    const remove =
    e.target.closest(".remove-btn");

    if(remove){

        const id =
        remove.dataset.id;

        const cart =
        getCart().filter(
            item=>String(item.id) !== String(id)
        );

        saveCart(cart);

        renderCart();

        return;

    }





/* CLEAR CART */

    if(e.target.closest("#clear-cart-btn")){

        const confirmClear =
        confirm("Clear all items from cart?");

        if(!confirmClear){
            return;
        }

        saveCart([]);

        renderCart();

        return;

    }

});





/*=========================================================
        CHECKOUT
=========================================================*/

if(checkoutBtn){

    checkoutBtn.addEventListener("click",()=>{

        const cart =
        getCart();

        if(cart.length === 0){

            alert("Your cart is empty");

            return;

        }

        localStorage.setItem(
            CHECKOUT_KEY,
            JSON.stringify(cart)
        );

        window.location.href =
        "../checkout/index.html";

    });

}





/*=========================================================
        SEARCH MODAL BASIC
=========================================================*/

const searchModal =
document.querySelector(".search-modal");

const searchButtons =
document.querySelectorAll(".search-btn,.cart-search button");

const searchClose =
document.querySelector(".search-close");

searchButtons.forEach(button=>{
    button.addEventListener("click",()=>{
        if(searchModal){
            searchModal.classList.add("active");
        }
    });
});

if(searchClose){
    searchClose.addEventListener("click",()=>{
        searchModal.classList.remove("active");
    });
}





/*=========================================================
        INIT
=========================================================*/

renderCart();
renderRecommended();

window.CartUI = {
    renderCart
};

});