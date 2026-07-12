/*=========================================================
                TAQDEER FASHION
                CART SERVICE FINAL
=========================================================*/

"use strict";

const CART_KEY = "taqdeerCart";
const DELIVERY_FEE = 80;



/*=========================================
            GET CART
=========================================*/

function getCart(){

    try{

        const cart =
        localStorage.getItem(CART_KEY);

        return cart
        ?
        JSON.parse(cart)
        :
        [];

    }

    catch(error){

        console.error("Cart Parse Error:", error);

        return [];

    }

}



/*=========================================
            SAVE CART
=========================================*/

function saveCart(cart){

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    window.dispatchEvent(
        new CustomEvent("cartUpdated")
    );

}



/*=========================================
            ADD TO CART
=========================================*/

function addToCart(product){

    if(!product || !product.id){

        console.error("Invalid product:", product);

        return getCart();

    }

    const cart =
    getCart();

    const quantityToAdd =
    Number(product.quantity) > 0
    ?
    Number(product.quantity)
    :
    1;

    const existing =
    cart.find(
        item =>
        item.id === product.id &&
        (item.size || "M") === (product.size || "M")
    );

    if(existing){

        existing.quantity += quantityToAdd;

    }

    else{

        cart.push({

            id: product.id,

            name: product.name || "Product",

            category: product.category || "Fashion",

            image: product.image || "assets/placeholders/product.jpg",

            price: Number(product.price) || 0,

            quantity: quantityToAdd,

            size: product.size || "M"

        });

    }

    saveCart(cart);

    updateCartCount();

    return cart;

}



/*=========================================
            REMOVE ITEM
=========================================*/

function removeFromCart(id){

    let cart =
    getCart();

    cart =
    cart.filter(
        item =>
        item.id !== id
    );

    saveCart(cart);

    updateCartCount();

    return cart;

}



/*=========================================
            UPDATE QUANTITY
=========================================*/

function updateQuantity(id, quantity){

    const cart =
    getCart();

    const item =
    cart.find(
        item =>
        item.id === id
    );

    if(item){

        item.quantity =
        Math.max(
            1,
            Number(quantity) || 1
        );

    }

    saveCart(cart);

    updateCartCount();

    return cart;

}



/*=========================================
            INCREASE
=========================================*/

function increaseQuantity(id){

    const cart =
    getCart();

    const item =
    cart.find(
        item =>
        item.id === id
    );

    if(item){

        item.quantity =
        Number(item.quantity || 1) + 1;

    }

    saveCart(cart);

    updateCartCount();

    return cart;

}



/*=========================================
            DECREASE
=========================================*/

function decreaseQuantity(id){

    const cart =
    getCart();

    const item =
    cart.find(
        item =>
        item.id === id
    );

    if(item && Number(item.quantity) > 1){

        item.quantity =
        Number(item.quantity) - 1;

    }

    saveCart(cart);

    updateCartCount();

    return cart;

}



/*=========================================
            CLEAR CART
=========================================*/

function clearCart(){

    localStorage.removeItem(
        CART_KEY
    );

    window.dispatchEvent(
        new CustomEvent("cartUpdated")
    );

}


/*=========================================
            TOTALS
=========================================*/

function getCartTotal(){

    const cart =
    getCart();

    return cart.reduce(
        (total,item)=>
        total +
        (
            Number(item.price || 0) *
            Number(item.quantity || 1)
        ),
        0
    );

}



function getDeliveryCharge(){

    return getCart().length
    ?
    DELIVERY_FEE
    :
    0;

}



function getGrandTotal(){

    return getCartTotal() + getDeliveryCharge();

}



function getCartCount(){

    return getCart().reduce(
        (total,item)=>
        total + Number(item.quantity || 1),
        0
    );

}



/*=========================================
            CART BADGE UPDATE
=========================================*/

function updateCartCount(){

    const count =
    getCartCount();

    document
    .querySelectorAll(".badge")
    .forEach(
        badge=>{

            badge.innerText =
            count;

        }
    );

}



/*=========================================
            EXPORT
=========================================*/

window.CartService = {

    getCart,

    saveCart,

    addToCart,

    removeFromCart,

    updateQuantity,

    increaseQuantity,

    decreaseQuantity,

    clearCart,

    getCartTotal,

    getDeliveryCharge,

    getGrandTotal,

    getCartCount,

    updateCartCount

};


/* lowercase compatibility */
window.cartService =
window.CartService;