/*=========================================================
                TAQDEER FASHION
                CART PAGE FINAL
=========================================================*/

"use strict";

document.addEventListener(
"DOMContentLoaded",
()=>{



/*=========================================
            DOM
=========================================*/

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



/*=========================================
            MONEY FORMAT
=========================================*/

function money(value){

    return "৳" +
    Number(value || 0)
    .toLocaleString();

}



/*=========================================
            IMAGE PATH FIX
=========================================*/

function getCartImagePath(path){

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



/*=========================================
            RENDER CART
=========================================*/

function renderCart(){

    if(!window.CartService || !cartItems){

        return;

    }

    const cart =
    window.CartService.getCart();

    cartItems.innerHTML = "";

    if(cart.length === 0){

        if(emptyCart){

            emptyCart.classList.add("active");

        }

        cartCount.innerText =
        "0 Items";

        subtotalElement.innerText =
        money(0);

        deliveryElement.innerText =
        money(0);

        totalElement.innerText =
        money(0);

        return;

    }

    if(emptyCart){

        emptyCart.classList.remove("active");

    }

    cart.forEach(
        item=>{

            const card =
            document.createElement("div");

            card.className =
            "cart-item";

            const imagePath =
            getCartImagePath(item.image);

            card.innerHTML = `

                <div class="cart-item-image">

                    <img
                    src="${imagePath}"
                    alt="${item.name || "Product"}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                </div>


                <div class="cart-item-info">

                    <h3>
                        ${item.name || "Product"}
                    </h3>

                    <p>
                        ${item.category || "Fashion"} 
                        ${item.size ? `• Size: ${item.size}` : ""}
                    </p>

                    <strong class="cart-item-price">
                        ${money(item.price)}
                    </strong>


                    <div class="quantity-control">

                        <button
                        type="button"
                        class="qty-minus"
                        data-id="${item.id}">
                            -
                        </button>

                        <span>
                            ${item.quantity || 1}
                        </span>

                        <button
                        type="button"
                        class="qty-plus"
                        data-id="${item.id}">
                            +
                        </button>

                    </div>


                    <button
                    type="button"
                    class="remove-btn"
                    data-id="${item.id}">
                        Remove
                    </button>

                </div>

            `;

            cartItems.appendChild(card);

        }
    );

    const subtotal =
    window.CartService.getCartTotal();

    const delivery =
    window.CartService.getDeliveryCharge();

    const total =
    window.CartService.getGrandTotal();

    cartCount.innerText =
    `${cart.length} Items`;

    subtotalElement.innerText =
    money(subtotal);

    deliveryElement.innerText =
    money(delivery);

    totalElement.innerText =
    money(total);

    window.CartService.updateCartCount();

}



/*=========================================
            CART EVENTS
=========================================*/

document.addEventListener(
"click",
(e)=>{

    const plus =
    e.target.closest(".qty-plus");

    if(plus){

        window.CartService
        .increaseQuantity(
            plus.dataset.id
        );

        renderCart();

        return;

    }


    const minus =
    e.target.closest(".qty-minus");

    if(minus){

        window.CartService
        .decreaseQuantity(
            minus.dataset.id
        );

        renderCart();

        return;

    }


    const remove =
    e.target.closest(".remove-btn");

    if(remove){

        window.CartService
        .removeFromCart(
            remove.dataset.id
        );

        renderCart();

        return;

    }

});



/*=========================================
            CHECKOUT
=========================================*/

if(checkoutBtn){

    checkoutBtn.addEventListener(
        "click",
        ()=>{

            const cart =
            window.CartService.getCart();

            if(cart.length === 0){

                alert("Your cart is empty");

                return;

            }

            window.location.href =
            "../checkout/index.html";

        }
    );

}



/*=========================================
            INIT
=========================================*/

renderCart();

window.CartUI = {
    renderCart
};



});