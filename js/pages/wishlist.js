/*=========================================================
        TAQDEER FASHION
        WISHLIST PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{

const wishlistGrid = document.getElementById("wishlist-grid");
const wishlistEmpty = document.getElementById("wishlist-empty");
const wishlistTotalText = document.getElementById("wishlist-total-text");

const wishlistHeaderCount = document.getElementById("wishlist-header-count");
const cartHeaderCount = document.getElementById("cart-header-count");

const moveAllBtn = document.getElementById("move-all-cart-btn");
const bottomMoveAllBtn = document.getElementById("bottom-move-all-btn");
const shareBtn = document.getElementById("share-wishlist-btn");
const searchInput = document.getElementById("wishlist-search-input");
const toast = document.getElementById("wishlist-toast");

const menuBtn = document.getElementById("wishlist-menu-btn");
const mobileMenu = document.getElementById("wishlist-mobile-menu");

let wishlistProducts = [];
let searchText = "";





/*=========================================================
        HELPERS
=========================================================*/

function money(value){
    return "৳" + Number(value || 0).toLocaleString();
}

function showToast(message){
    if(!toast) return;

    toast.textContent = message;
    toast.classList.add("active");

    setTimeout(()=>{
        toast.classList.remove("active");
    },1800);
}

function getImagePath(path){

    const fallback = "../../assets/placeholders/product.jpg";

    if(!path) return fallback;

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

function getWishlist(){

    const service = window.WishlistService || window.wishlistService;

    if(service && service.getWishlist){
        return service.getWishlist() || [];
    }

    return JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];
}

function saveWishlist(items){

    const service = window.WishlistService || window.wishlistService;

    if(service && service.saveWishlist){
        service.saveWishlist(items);
    }
    else{
        localStorage.setItem("taqdeerWishlist",JSON.stringify(items));
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
}

function getCart(){

    const service = window.CartService || window.cartService;

    if(service && service.getCart){
        return service.getCart() || [];
    }

    return JSON.parse(localStorage.getItem("taqdeerCart")) || [];
}

function saveCart(cart){

    const service = window.CartService || window.cartService;

    if(service && service.saveCart){
        service.saveCart(cart);
    }
    else{
        localStorage.setItem("taqdeerCart",JSON.stringify(cart));
    }

    window.dispatchEvent(new Event("cartUpdated"));
}

function addToCart(product){

    const cart = getCart();

    const id = String(product.id || product.productId || product.name);

    const existing = cart.find(item=>String(item.id) === id);

    if(existing){
        existing.quantity = Number(existing.quantity || 1) + 1;
    }
    else{
        cart.push({
            id,
            name: product.name || "Product",
            price: Number(product.price || 0),
            oldPrice: Number(product.oldPrice || product.comparePrice || 0),
            image: product.image || product.mainImage || "",
            category: product.category || "Fashion",
            size: product.size || "M",
            color: product.color || "",
            quantity:1
        });
    }

    saveCart(cart);
    updateCounts();
}

function getSizes(product){

    if(Array.isArray(product.sizes) && product.sizes.length){
        return product.sizes.slice(0,4);
    }

    const category = String(product.category || "").toLowerCase();

    if(category.includes("trouser") || category.includes("pant")){
        return ["30","32","34","36"];
    }

    return ["S","M","L","XL"];
}

function getDiscount(product){

    const price = Number(product.price || 0);
    const oldPrice = Number(product.oldPrice || product.comparePrice || 0);

    if(!price || !oldPrice || oldPrice <= price){
        return "";
    }

    const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

    return `-${discount}%`;
}

function filterProducts(){

    let products = [...wishlistProducts];

    if(searchText){
        products = products.filter(product=>{
            const name = String(product.name || "").toLowerCase();
            const category = String(product.category || "").toLowerCase();

            return (
                name.includes(searchText) ||
                category.includes(searchText)
            );
        });
    }

    return products;
}





/*=========================================================
        COUNTS
=========================================================*/

function updateCounts(){

    const wishlist = getWishlist();
    const cart = getCart();

    const wishlistCount = wishlist.length;

    const cartCount = cart.reduce((total,item)=>{
        return total + Number(item.quantity || 1);
    },0);

    if(wishlistHeaderCount){
        wishlistHeaderCount.textContent = wishlistCount;
    }

    if(cartHeaderCount){
        cartHeaderCount.textContent = cartCount;
    }

    if(wishlistTotalText){
        wishlistTotalText.textContent =
        `${wishlistCount} item${wishlistCount !== 1 ? "s" : ""}`;
    }
}





/*=========================================================
        RENDER
=========================================================*/

function renderWishlist(){

    if(!wishlistGrid) return;

    const products = filterProducts();

    wishlistGrid.innerHTML = "";

    updateCounts();

    if(!products.length){

        wishlistGrid.style.display = "none";

        if(wishlistEmpty){
            wishlistEmpty.classList.add("active");
        }

        return;
    }

    wishlistGrid.style.display = "grid";

    if(wishlistEmpty){
        wishlistEmpty.classList.remove("active");
    }

    products.forEach(product=>{

        const id = String(product.id || product.productId || product.name);
        const image = getImagePath(product.image || product.mainImage);
        const sizes = getSizes(product);
        const discount = getDiscount(product);

        const card = document.createElement("article");
        card.className = "wishlist-card";

        card.innerHTML = `
            ${discount ? `<span class="wishlist-discount">${discount}</span>` : ""}

            <button type="button" class="wishlist-heart active" data-id="${id}" aria-label="Remove wishlist">
                <i data-lucide="heart"></i>
            </button>

            <a href="../product-details/index.html?id=${id}" class="wishlist-img">
                <img
                    src="${image}"
                    alt="${product.name || "Product"}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">
            </a>

            <div class="wishlist-info">

                <h3>${product.name || "Product"}</h3>

                <div class="wishlist-rating">
                    <strong>★</strong>
                    <span>${Number(product.rating || 4.8).toFixed(1)} (${product.reviews || product.reviewCount || 0})</span>
                </div>

                <div class="wishlist-price">
                    <strong>${money(product.price)}</strong>
                    ${
                        Number(product.oldPrice || product.comparePrice || 0) > Number(product.price || 0)
                        ? `<del>${money(product.oldPrice || product.comparePrice)}</del>`
                        : ""
                    }
                </div>

                <div class="wishlist-size-row">
                    ${sizes.map((size,index)=>`
                        <span class="${index === 1 ? "active" : ""}">${size}</span>
                    `).join("")}
                </div>

                <div class="wishlist-card-actions">
                    <button type="button" class="wishlist-add-cart" data-id="${id}">
                        <i data-lucide="shopping-cart"></i>
                        Add to Cart
                    </button>

                    <button type="button" class="wishlist-remove" data-id="${id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>

            </div>
        `;

        wishlistGrid.appendChild(card);

    });

    if(window.lucide){
        lucide.createIcons();
    }
}





/*=========================================================
        REMOVE
=========================================================*/

function removeFromWishlist(id){

    const updated = getWishlist().filter(item=>{
        const itemId = String(item.id || item.productId || item.name);
        return itemId !== String(id);
    });

    wishlistProducts = updated;
    saveWishlist(updated);
    renderWishlist();

    showToast("Removed from wishlist");
}





/*=========================================================
        MOVE ALL
=========================================================*/

function moveAllToCart(){

    const wishlist = getWishlist();

    if(!wishlist.length){
        showToast("Wishlist is empty");
        return;
    }

    wishlist.forEach(product=>{
        addToCart(product);
    });

    wishlistProducts = [];
    saveWishlist([]);

    renderWishlist();
    showToast("All products moved to cart");
}





/*=========================================================
        SHARE
=========================================================*/

async function shareWishlist(){

    const text = "Check my Taqdeer Fashion wishlist";
    const url = window.location.href;

    try{
        if(navigator.share){
            await navigator.share({
                title:"My Wishlist",
                text,
                url
            });
        }
        else{
            await navigator.clipboard.writeText(url);
            showToast("Wishlist link copied");
        }
    }
    catch(error){
        console.warn(error);
    }
}





/*=========================================================
        EVENTS
=========================================================*/

document.addEventListener("click",(e)=>{

    const removeBtn = e.target.closest(".wishlist-remove");
    const heartBtn = e.target.closest(".wishlist-heart");
    const addBtn = e.target.closest(".wishlist-add-cart");

    if(removeBtn){
        removeFromWishlist(removeBtn.dataset.id);
        return;
    }

    if(heartBtn){
        removeFromWishlist(heartBtn.dataset.id);
        return;
    }

    if(addBtn){

        const product = wishlistProducts.find(item=>{
            const id = String(item.id || item.productId || item.name);
            return id === String(addBtn.dataset.id);
        });

        if(product){
            addToCart(product);
            showToast("Added to cart");
        }

        return;
    }

});

if(moveAllBtn){
    moveAllBtn.addEventListener("click",moveAllToCart);
}

if(bottomMoveAllBtn){
    bottomMoveAllBtn.addEventListener("click",moveAllToCart);
}

if(shareBtn){
    shareBtn.addEventListener("click",shareWishlist);
}

if(searchInput){
    searchInput.addEventListener("input",()=>{
        searchText = searchInput.value.toLowerCase().trim();
        renderWishlist();
    });
}

if(menuBtn && mobileMenu){
    menuBtn.addEventListener("click",()=>{
        mobileMenu.classList.toggle("active");
    });
}





/*=========================================================
        INIT
=========================================================*/

wishlistProducts = getWishlist();

renderWishlist();
updateCounts();

if(window.lucide){
    lucide.createIcons();
}

});