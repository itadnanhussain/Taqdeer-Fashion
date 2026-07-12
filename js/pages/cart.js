/*=========================================================
                TAQDEER FASHION
                CART PAGE FINAL JS
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

const cartCount =
document.getElementById("cart-count");

const subtotalElement =
document.getElementById("subtotal");

const deliveryElement =
document.getElementById("delivery");

const totalElement =
document.getElementById("total");

const checkoutBtn =
document.getElementById("checkout-btn");





/*=========================================================
        HELPERS
=========================================================*/

function money(value){

    return "৳" +
    Number(value || 0).toLocaleString();

}



function getCart(){

    const cartService =
    window.CartService ||
    window.cartService;

    if(cartService && cartService.getCart){

        return cartService.getCart() || [];

    }

    return JSON.parse(
        localStorage.getItem("taqdeerCart")
    ) || [];

}



function saveCart(cart){

    const cartService =
    window.CartService ||
    window.cartService;

    if(cartService && cartService.saveCart){

        cartService.saveCart(cart);

    }

    else{

        localStorage.setItem(
            "taqdeerCart",
            JSON.stringify(cart)
        );

    }

    window.dispatchEvent(
        new Event("cartUpdated")
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



function getDelivery(cart){

    return cart.length > 0 ? 80 : 0;

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

    if(cart.length === 0){

        if(emptyCart){
            emptyCart.classList.add("active");
        }

        if(cartCount){
            cartCount.innerText = "0 Items";
        }

        if(subtotalElement){
            subtotalElement.innerText = money(0);
        }

        if(deliveryElement){
            deliveryElement.innerText = money(0);
        }

        if(totalElement){
            totalElement.innerText = money(0);
        }

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        return;

    }

    if(emptyCart){
        emptyCart.classList.remove("active");
    }

    cart.forEach(item=>{

        const card =
        document.createElement("div");

        card.className =
        "cart-item";

        card.innerHTML = `
            <div class="cart-item-image">

                <img
                src="${getImagePath(item.image)}"
                alt="${item.name || "Product"}"
                onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';"
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${item.name || "Product"}
                </h3>

                <p>
                    ${item.category || "Fashion"}
                    ${item.size ? " • Size: " + item.size : ""}
                </p>

                <strong class="cart-item-price">
                    ${money(item.price)}
                </strong>

                <div class="quantity-control">

                    <button
                    type="button"
                    class="qty-minus"
                    data-id="${item.id}"
                    >
                        -
                    </button>

                    <span>
                        ${item.quantity || 1}
                    </span>

                    <button
                    type="button"
                    class="qty-plus"
                    data-id="${item.id}"
                    >
                        +
                    </button>

                </div>

                <button
                type="button"
                class="remove-btn"
                data-id="${item.id}"
                >
                    Remove
                </button>

            </div>
        `;

        cartItems.appendChild(card);

    });


    const subtotal =
    getSubtotal(cart);

    const delivery =
    getDelivery(cart);

    const total =
    subtotal + delivery;


    if(cartCount){

        const quantityCount =
        cart.reduce(
            (total,item)=>
            total + Number(item.quantity || 1),
            0
        );

        cartCount.innerText =
        `${quantityCount} Item${quantityCount > 1 ? "s" : ""}`;

    }

    if(subtotalElement){
        subtotalElement.innerText = money(subtotal);
    }

    if(deliveryElement){
        deliveryElement.innerText = money(delivery);
    }

    if(totalElement){
        totalElement.innerText = money(total);
    }

    window.dispatchEvent(
        new Event("cartUpdated")
    );

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
        cart.find(product=>product.id === id);

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
        cart.find(product=>product.id === id);

        if(item){

            item.quantity =
            Number(item.quantity || 1) - 1;

            if(item.quantity <= 0){

                cart =
                cart.filter(product=>product.id !== id);

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
            item=>item.id !== id
        );

        saveCart(cart);

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

        window.location.href =
        "../checkout/index.html";

    });

}





/*=========================================================
        INIT
=========================================================*/

renderCart();

window.CartUI = {
    renderCart
};


});