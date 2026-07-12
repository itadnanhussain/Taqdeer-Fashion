/*=========================================================
            TAQDEER FASHION
            HEADER COMPONENT FINAL v7
            SEARCH + CART DRAWER + AUTH PROFILE
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


/*=========================================================
        DOM
=========================================================*/

const header =
document.querySelector(".header");

const hamburger =
document.querySelector(".hamburger");

const mobileMenu =
document.querySelector(".mobile-menu");

const mobileLinks =
document.querySelectorAll(".mobile-menu a");

const searchBtn =
document.querySelector(".search-btn");

const searchModal =
document.querySelector(".search-modal");

const searchClose =
document.querySelector(".search-close");

const searchInput =
document.querySelector(".search-box input");

const cartBtn =
document.querySelector(".cart-btn");

const cartDrawer =
document.querySelector(".cart-drawer");

const cartOverlay =
document.querySelector(".cart-overlay");

const cartClose =
document.querySelector(".cart-close");

const cartDrawerItems =
document.querySelector("#cart-drawer-items");

const cartDrawerTotal =
document.querySelector("#cart-drawer-total");

const cartCount =
document.querySelector(".cart-count");

const wishlistCount =
document.querySelector(".wishlist-count");

const wishlistBtn =
document.querySelector(".wishlist-header-btn");





/*=========================================================
        PATH HELPERS
=========================================================*/

function isInsidePages(){

    return window.location.pathname.includes("/pages/");

}


function authPath(){

    return isInsidePages()
    ?
    "../auth/login.html"
    :
    "pages/auth/login.html";

}


function accountPath(){

    return isInsidePages()
    ?
    "../account/index.html"
    :
    "pages/account/index.html";

}


function cartPath(){

    return isInsidePages()
    ?
    "../cart/index.html"
    :
    "pages/cart/index.html";

}


function checkoutPath(){

    return isInsidePages()
    ?
    "../checkout/index.html"
    :
    "pages/checkout/index.html";

}


function shopPath(){

    return isInsidePages()
    ?
    "../shop/index.html"
    :
    "pages/shop/index.html";

}


function wishlistPath(){

    return isInsidePages()
    ?
    "../wishlist/index.html"
    :
    "pages/wishlist/index.html";

}


function productDetailsPath(id){

    return isInsidePages()
    ?
    `../product-details/index.html?id=${id}`
    :
    `pages/product-details/index.html?id=${id}`;

}


function defaultProductImage(){

    return isInsidePages()
    ?
    "../../assets/placeholders/product.jpg"
    :
    "assets/placeholders/product.jpg";

}


function defaultUserImage(){

    return isInsidePages()
    ?
    "../../assets/logos/logo-1.png"
    :
    "assets/logos/logo-1.png";

}


function getSafeImage(path){

    if(!path){
        return defaultProductImage();
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

        return isInsidePages()
        ?
        `../../${path}`
        :
        path;

    }

    return path;

}





/*=========================================================
        STICKY HEADER
=========================================================*/

if(header){

    window.addEventListener("scroll",()=>{

        header.classList.toggle(
            "scrolled",
            window.scrollY > 80
        );

    });

}





/*=========================================================
        BODY LOCK
=========================================================*/

function lockBody(){

    document.body.style.overflow =
    "hidden";

}


function unlockBody(){

    document.body.style.overflow =
    "";

}





/*=========================================================
        MOBILE MENU
=========================================================*/

function closeMobile(){

    if(!mobileMenu){
        return;
    }

    mobileMenu.classList.remove("active");

    unlockBody();

}


if(hamburger && mobileMenu){

    hamburger.addEventListener("click",()=>{

        const active =
        mobileMenu.classList.toggle("active");

        active
        ?
        lockBody()
        :
        unlockBody();

    });

}


mobileLinks.forEach(link=>{

    link.addEventListener("click",closeMobile);

});





/*=========================================================
        SEARCH MODAL
=========================================================*/

function openSearch(){

    if(!searchModal){
        return;
    }

    searchModal.classList.add("active");

    lockBody();

    setTimeout(()=>{

        if(searchInput){
            searchInput.focus();
        }

    },250);

}


function closeSearch(){

    if(!searchModal){
        return;
    }

    searchModal.classList.remove("active");

    unlockBody();

}


if(searchBtn){

    searchBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        openSearch();

    });

}


if(searchClose){

    searchClose.addEventListener("click",closeSearch);

}


if(searchModal){

    searchModal.addEventListener("click",(e)=>{

        if(e.target === searchModal){
            closeSearch();
        }

    });

}


if(searchInput){

    searchInput.addEventListener("keydown",(e)=>{

        if(e.key !== "Enter"){
            return;
        }

        const query =
        searchInput.value.trim();

        if(!query){
            return;
        }

        window.location.href =
        `${shopPath()}?search=${encodeURIComponent(query)}`;

    });

}





/*=========================================================
        CART STORAGE HELPERS
=========================================================*/

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


function getCartSubtotal(cart){

    return cart.reduce(
        (total,item)=>
        total +
        Number(item.price || 0) *
        Number(item.quantity || 1),
        0
    );

}





/*=========================================================
        CART DRAWER RENDER
=========================================================*/

function renderCartDrawer(){

    if(!cartDrawerItems || !cartDrawerTotal){
        return;
    }

    const cart =
    getCart();

    cartDrawerItems.innerHTML = "";

    if(!cart.length){

        cartDrawerItems.innerHTML = `
            <div class="drawer-empty">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some premium products first.
                </p>

                <a href="${shopPath()}">
                    Shop Now
                </a>

            </div>
        `;

        cartDrawerTotal.innerText =
        "৳0";

        return;

    }

    cart.forEach(item=>{

        const cartItem =
        document.createElement("div");

        cartItem.className =
        "drawer-cart-item";

        cartItem.innerHTML = `
            <a href="${productDetailsPath(item.id)}">

                <img
                    src="${getSafeImage(item.image)}"
                    alt="${item.name || "Product"}"
                    onerror="this.src='${defaultProductImage()}'"
                >

            </a>

            <div class="drawer-cart-info">

                <h4>
                    ${item.name || "Product Name"}
                </h4>

                <p>
                    ${item.category || "Fashion"}
                    ${item.size ? " • Size: " + item.size : ""}
                </p>

                <strong>
                    ৳${Number(item.price || 0).toLocaleString()}
                </strong>

                <div class="drawer-cart-actions">

                    <div class="drawer-qty">

                        <button
                            type="button"
                            class="drawer-qty-minus"
                            data-id="${item.id}"
                        >
                            -
                        </button>

                        <span>
                            ${item.quantity || 1}
                        </span>

                        <button
                            type="button"
                            class="drawer-qty-plus"
                            data-id="${item.id}"
                        >
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="drawer-remove"
                        data-id="${item.id}"
                    >
                        Remove
                    </button>

                </div>

            </div>
        `;

        cartDrawerItems.appendChild(cartItem);

    });

    cartDrawerTotal.innerText =
    `৳${getCartSubtotal(cart).toLocaleString()}`;

}





/*=========================================================
        CART DRAWER OPEN/CLOSE
=========================================================*/

function openCart(){

    if(cartDrawer){

        renderCartDrawer();

        cartDrawer.classList.add("active");

        if(cartOverlay){
            cartOverlay.classList.add("active");
        }

        lockBody();

        return;

    }

    window.location.href =
    cartPath();

}


function closeCart(){

    if(!cartDrawer){
        return;
    }

    cartDrawer.classList.remove("active");

    if(cartOverlay){
        cartOverlay.classList.remove("active");
    }

    unlockBody();

}


if(cartBtn){

    cartBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        openCart();

    });

}


if(cartClose){

    cartClose.addEventListener("click",closeCart);

}


if(cartOverlay){

    cartOverlay.addEventListener("click",closeCart);

}





/*=========================================================
        CART DRAWER ACTIONS
=========================================================*/

document.addEventListener("click",(e)=>{


/* PLUS */

    const plusBtn =
    e.target.closest(".drawer-qty-plus");

    if(plusBtn){

        const id =
        plusBtn.dataset.id;

        const cart =
        getCart();

        const item =
        cart.find(product=>product.id === id);

        if(item){

            item.quantity =
            Number(item.quantity || 1) + 1;

            saveCart(cart);

            renderCartDrawer();

            updateHeaderCounts();

        }

        return;

    }





/* MINUS */

    const minusBtn =
    e.target.closest(".drawer-qty-minus");

    if(minusBtn){

        const id =
        minusBtn.dataset.id;

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

            renderCartDrawer();

            updateHeaderCounts();

        }

        return;

    }





/* REMOVE */

    const removeBtn =
    e.target.closest(".drawer-remove");

    if(removeBtn){

        const id =
        removeBtn.dataset.id;

        const cart =
        getCart().filter(
            item=>item.id !== id
        );

        saveCart(cart);

        renderCartDrawer();

        updateHeaderCounts();

    }


});





/*=========================================================
        HEADER COUNTS
=========================================================*/

function updateCartCount(){

    if(!cartCount){
        return;
    }

    const cart =
    getCart();

    const count =
    cart.reduce(
        (total,item)=>
        total + Number(item.quantity || 1),
        0
    );

    cartCount.innerText =
    count;

    cartCount.style.display =
    count > 0
    ?
    "flex"
    :
    "none";

}


function updateWishlistCount(){

    if(!wishlistCount){
        return;
    }

    const wishlistService =
    window.WishlistService ||
    window.wishlistService;

    let count = 0;

    if(wishlistService && wishlistService.getWishlist){

        count =
        wishlistService.getWishlist().length;

    }

    else{

        count =
        JSON.parse(
            localStorage.getItem("taqdeerWishlist")
        )?.length || 0;

    }

    wishlistCount.innerText =
    count;

    wishlistCount.style.display =
    count > 0
    ?
    "flex"
    :
    "none";

}


function updateHeaderCounts(){

    updateCartCount();

    updateWishlistCount();

    renderCartDrawer();

}


window.addEventListener(
    "cartUpdated",
    updateHeaderCounts
);


window.addEventListener(
    "wishlistUpdated",
    updateHeaderCounts
);


window.addEventListener(
    "storage",
    updateHeaderCounts
);





/*=========================================================
        ACCOUNT BUTTON WITH PROFILE PHOTO
=========================================================*/

function setAccountButtonGuest(){

    const accountButtons =
    document.querySelectorAll(".account-btn");

    accountButtons.forEach(btn=>{

        btn.href =
        authPath();

        btn.classList.remove(
            "logged-in"
        );

        btn.innerHTML = `
            <span class="header-user-photo-wrap">
                <i data-lucide="user" class="header-user-icon"></i>
            </span>

            <span class="account-text">
                Sign In
            </span>
        `;

    });

    if(window.lucide){
        lucide.createIcons();
    }

}


function setAccountButtonUser(user){

    const accountButtons =
    document.querySelectorAll(".account-btn");

    const photo =
    user.photoURL ||
    defaultUserImage();

    accountButtons.forEach(btn=>{

        btn.href =
        accountPath();

        btn.classList.add(
            "logged-in"
        );

        btn.innerHTML = `
            <span class="header-user-photo-wrap">
                <img
                    src="${photo}"
                    alt="User"
                    class="header-user-photo"
                    onerror="this.src='${defaultUserImage()}'"
                >
            </span>
        `;

    });

}


function updateAuthHeader(){

    const waitForAuth =
    setInterval(()=>{

        if(window.auth && window.auth.onAuthStateChanged){

            clearInterval(waitForAuth);

            window.auth.onAuthStateChanged(user=>{

                if(user){

                    setAccountButtonUser(user);

                }

                else{

                    setAccountButtonGuest();

                }

                if(window.lucide){
                    lucide.createIcons();
                }

            });

        }

    },100);

}





/*=========================================================
        WISHLIST HEADER BUTTON
=========================================================*/

if(wishlistBtn){

    wishlistBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href =
        wishlistPath();

    });

}





/*=========================================================
        ESC CLOSE
=========================================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key === "Escape"){

        closeMobile();

        closeSearch();

        closeCart();

    }

});





/*=========================================================
        OUTSIDE CLICK
=========================================================*/

document.addEventListener("click",(e)=>{

    if(
        mobileMenu &&
        hamburger &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
    ){

        closeMobile();

    }

});





/*=========================================================
        INIT
=========================================================*/

updateHeaderCounts();

updateAuthHeader();

if(window.lucide){
    lucide.createIcons();
}


});