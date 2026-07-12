/*=========================================================
            TAQDEER FASHION
            HEADER COMPONENT FINAL v5
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

const cartClose =
document.querySelector(".cart-close");

const accountBtn =
document.querySelector(".account-btn");

const cartCount =
document.querySelector(".cart-count");

const wishlistCount =
document.querySelector(".wishlist-count");

const wishlistBtn =
document.querySelector(".wishlist-header-btn");





/*=========================================================
        PATH HELPER
=========================================================*/

function isInsidePages(){

    return window.location.pathname.includes("/pages/");

}


function pagePath(pathFromRoot){

    return isInsidePages()
    ?
    `../../${pathFromRoot}`
    :
    pathFromRoot;

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


function wishlistPath(){

    return isInsidePages()
    ?
    "../wishlist/index.html"
    :
    "pages/wishlist/index.html";

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

    document.body.style.overflow = "hidden";

}


function unlockBody(){

    document.body.style.overflow = "";

}





/*=========================================================
        MOBILE MENU
=========================================================*/

function closeMobile(){

    if(mobileMenu){

        mobileMenu.classList.remove("active");

        unlockBody();

    }

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
        SEARCH
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

    },300);

}


function closeSearch(){

    if(!searchModal){
        return;
    }

    searchModal.classList.remove("active");

    unlockBody();

}


if(searchBtn){

    searchBtn.addEventListener("click",openSearch);

}


if(searchClose){

    searchClose.addEventListener("click",closeSearch);

}





/*=========================================================
        CART DRAWER / CART PAGE FALLBACK
=========================================================*/

function openCart(){

    if(cartDrawer){

        cartDrawer.classList.add("active");

        lockBody();

        return;

    }

    window.location.href = cartPath();

}


function closeCart(){

    if(!cartDrawer){
        return;
    }

    cartDrawer.classList.remove("active");

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





/*=========================================================
        COUNT UPDATE
=========================================================*/

function updateCartCount(){

    if(!cartCount){
        return;
    }

    const cartService =
    window.CartService ||
    window.cartService;

    let count = 0;

    if(cartService && cartService.getCart){

        const cart =
        cartService.getCart();

        count =
        cart.reduce(
            (total,item)=>
            total + Number(item.quantity || 1),
            0
        );

    }

    cartCount.innerText = count;

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

    wishlistCount.innerText = count;

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
        ACCOUNT AUTH STATE
=========================================================*/

/*=========================================================
        ACCOUNT BUTTON TEXT FIX
=========================================================*/

function updateAccountButtons(text,path){

    const accountButtons =
    document.querySelectorAll(".account-btn");

    accountButtons.forEach(btn=>{

        btn.href = path;

        btn.innerHTML = `
            <i data-lucide="user"></i>
            <span>${text}</span>
        `;

    });

    if(window.lucide){
        lucide.createIcons();
    }

}


function setGuestHeader(){

    updateAccountButtons(
        "Sign In",
        authPath()
    );

}


function setUserHeader(){

    updateAccountButtons(
        "Account",
        accountPath()
    );

}


/*=========================================================
        AUTH STATE FIX
=========================================================*/

function updateAuthHeader(){

    const waitForAuth =
    setInterval(()=>{

        if(window.auth && window.auth.onAuthStateChanged){

            clearInterval(waitForAuth);

            window.auth.onAuthStateChanged(user=>{

                if(user){

                    setUserHeader();

                }

                else{

                    setGuestHeader();

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

        window.location.href = wishlistPath();

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