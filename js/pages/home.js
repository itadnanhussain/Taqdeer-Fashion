/*=========================================================
    TAQDEER FASHION
    HOME PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{

/*=========================================================
    HELPERS
=========================================================*/

const CART_KEY = "taqdeerCart";
const WISHLIST_KEY = "taqdeerWishlist";
const FALLBACK_IMAGE = "assets/placeholders/product.jpg";

function money(value){
    return "৳" + Number(value || 0).toLocaleString();
}

function safeText(value, fallback = ""){
    return value ? String(value) : fallback;
}

function getAssetPath(path){
    if(!path){
        return FALLBACK_IMAGE;
    }

    if(
        path.startsWith("http") ||
        path.startsWith("data:") ||
        path.startsWith("assets/")
    ){
        return path;
    }

    return FALLBACK_IMAGE;
}

function productDetailsPath(id){
    return `pages/product-details/index.html?id=${encodeURIComponent(id)}`;
}

function shopSearchPath(query){
    return `pages/shop/index.html?search=${encodeURIComponent(query)}`;
}

function getCart(){
    const service = window.CartService || window.cartService;

    if(service && typeof service.getCart === "function"){
        return service.getCart() || [];
    }

    try{
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }
    catch(error){
        return [];
    }
}

function getWishlist(){
    const service = window.WishlistService || window.wishlistService;

    if(service && typeof service.getWishlist === "function"){
        return service.getWishlist() || [];
    }

    try{
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    }
    catch(error){
        return [];
    }
}

function isWishlisted(productId){
    return getWishlist().some(item=>String(item.id) === String(productId));
}

function updateHeaderCounts(){
    const cartCount = getCart().reduce(
        (total,item)=> total + Number(item.quantity || 1),
        0
    );

    document.querySelectorAll(".cart-count").forEach(badge=>{
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? "flex" : "none";
    });

    const wishlistCount = getWishlist().length;

    document.querySelectorAll(".wishlist-count").forEach(badge=>{
        badge.textContent = wishlistCount;
        badge.style.display = wishlistCount > 0 ? "flex" : "none";
    });
}

function refreshLucide(){
    if(window.lucide){
        window.lucide.createIcons();
    }
}


/*=========================================================
    HERO SLIDER
=========================================================*/

const heroSlides = Array.from(
    document.querySelectorAll(".hero-slide")
);

const heroDots = Array.from(
    document.querySelectorAll(".hero-dots button")
);

const prevBtn = document.querySelector(".hero-arrow-left");
const nextBtn = document.querySelector(".hero-arrow-right");

let currentSlide = 0;
let heroTimer = null;

function showHeroSlide(index){
    if(!heroSlides.length){
        return;
    }

    if(index < 0){
        index = heroSlides.length - 1;
    }

    if(index >= heroSlides.length){
        index = 0;
    }

    currentSlide = index;

    heroSlides.forEach((slide,i)=>{
        slide.classList.toggle("active", i === currentSlide);
    });

    heroDots.forEach((dot,i)=>{
        dot.classList.toggle("active", i === currentSlide);
    });

    refreshLucide();
}

function nextHeroSlide(){
    showHeroSlide(currentSlide + 1);
}

function prevHeroSlide(){
    showHeroSlide(currentSlide - 1);
}

function startHeroSlider(){
    if(heroSlides.length <= 1){
        return;
    }

    clearInterval(heroTimer);

    heroTimer = setInterval(()=>{
        nextHeroSlide();
    },5000);
}

if(nextBtn){
    nextBtn.addEventListener("click",()=>{
        nextHeroSlide();
        startHeroSlider();
    });
}

if(prevBtn){
    prevBtn.addEventListener("click",()=>{
        prevHeroSlide();
        startHeroSlider();
    });
}

heroDots.forEach(dot=>{
    dot.addEventListener("click",()=>{
        showHeroSlide(Number(dot.dataset.index || 0));
        startHeroSlider();
    });
});

showHeroSlide(0);
startHeroSlider();


/*=========================================================
    SEARCH
=========================================================*/

const headerSearchForm = document.querySelector(".home-header-search");
const headerSearchInput = document.querySelector("#home-header-search-input");

if(headerSearchForm && headerSearchInput){
    headerSearchForm.addEventListener("submit",(event)=>{
        event.preventDefault();

        const query = headerSearchInput.value.trim();

        if(!query){
            return;
        }

        window.location.href = shopSearchPath(query);
    });
}

const searchModalInput = document.querySelector(".search-box input");

if(searchModalInput){
    searchModalInput.addEventListener("keydown",(event)=>{
        if(event.key !== "Enter"){
            return;
        }

        const query = searchModalInput.value.trim();

        if(!query){
            return;
        }

        window.location.href = shopSearchPath(query);
    });
}


/*=========================================================
    BACK TO TOP
=========================================================*/

const backTop = document.querySelector("#back-to-top");

if(backTop){
    window.addEventListener("scroll",()=>{
        backTop.classList.toggle(
            "active",
            window.scrollY > 500
        );
    });

    backTop.addEventListener("click",()=>{
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    });
}


/*=========================================================
    COUNTDOWN
=========================================================*/

const offerDays = document.querySelector("#offer-days");
const offerHours = document.querySelector("#offer-hours");
const offerMins = document.querySelector("#offer-mins");
const offerSecs = document.querySelector("#offer-secs");

const offerEndTime =
Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000);

function twoDigit(value){
    return String(value).padStart(2,"0");
}

function updateCountdown(){
    if(!offerDays || !offerHours || !offerMins || !offerSecs){
        return;
    }

    const distance = Math.max(0, offerEndTime - Date.now());

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
    );
    const mins = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
    );
    const secs = Math.floor(
        (distance % (1000 * 60)) /
        1000
    );

    offerDays.textContent = twoDigit(days);
    offerHours.textContent = twoDigit(hours);
    offerMins.textContent = twoDigit(mins);
    offerSecs.textContent = twoDigit(secs);
}

updateCountdown();
setInterval(updateCountdown,1000);


/*=========================================================
    PRODUCT DATA
=========================================================*/

async function getProducts(){
    try{
        if(
            window.productService &&
            typeof window.productService.getProducts === "function"
        ){
            const products = await window.productService.getProducts();
            return Array.isArray(products) ? products : [];
        }

        if(
            window.ProductService &&
            typeof window.ProductService.getProducts === "function"
        ){
            const products = await window.ProductService.getProducts();
            return Array.isArray(products) ? products : [];
        }

        console.error("Product service missing");
        return [];
    }
    catch(error){
        console.error("Home products load error:", error);
        return [];
    }
}

function normalizeCategory(category){
    return String(category || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g,"-");
}

function getStockInfo(product){
    const stock = Number(product.stock || product.quantity || 0);

    if(stock <= 0){
        return {
            text:"Out Of Stock",
            className:"out",
            disabled:true
        };
    }

    if(stock <= 5){
        return {
            text:"Low Stock",
            className:"low",
            disabled:false
        };
    }

    return {
        text:"In Stock",
        className:"in",
        disabled:false
    };
}

function getFeaturedProducts(products){
    const activeProducts = products.filter(product=>{
        return Number(product.stock || product.quantity || 0) > 0;
    });

    const featured = activeProducts.filter(product=>{
        const badge = String(product.badge || "").toLowerCase();
        const type = String(product.type || "").toLowerCase();

        return (
            product.featured === true ||
            product.isFeatured === true ||
            type === "featured" ||
            badge === "best seller" ||
            badge === "premium" ||
            badge === "new"
        );
    });

    if(featured.length){
        return featured.slice(0,8);
    }

    return [...activeProducts]
        .sort((a,b)=>{
            const ratingA = Number(a.rating || 0);
            const ratingB = Number(b.rating || 0);

            if(ratingB !== ratingA){
                return ratingB - ratingA;
            }

            const dateA = a.createdAt?.toDate
                ? a.createdAt.toDate()
                : new Date(a.createdAt || 0);

            const dateB = b.createdAt?.toDate
                ? b.createdAt.toDate()
                : new Date(b.createdAt || 0);

            return dateB - dateA;
        })
        .slice(0,8);
}


/*=========================================================
    CATEGORY COUNTS
=========================================================*/

function updateCategoryCounts(products){
    const counts = {};

    products.forEach(product=>{
        const category = normalizeCategory(product.category);

        if(!category){
            return;
        }

        counts[category] = (counts[category] || 0) + 1;
    });

    document.querySelectorAll("[data-category-count]").forEach(item=>{
        const category = normalizeCategory(item.dataset.categoryCount);
        const count = counts[category] || 0;

        item.textContent = `${count} ${count === 1 ? "Item" : "Items"}`;
    });
}


/*=========================================================
    CART DRAWER OPEN FALLBACK
=========================================================*/

function openCartDrawer(){
    const cartBtn = document.querySelector(".cart-btn");

    if(cartBtn){
        cartBtn.click();
        return;
    }

    const drawer = document.querySelector(".cart-drawer");
    const overlay = document.querySelector(".cart-overlay");

    if(drawer){
        drawer.classList.add("active");
    }

    if(overlay){
        overlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";
}


/*=========================================================
    PRODUCT CARD
=========================================================*/

function createProductCard(product){
    const stockInfo = getStockInfo(product);
    const image = getAssetPath(product.image || product.thumbnail);
    const productId = product.id || product.productId;
    const link = productDetailsPath(productId);
    const badge = safeText(product.badge,"");
    const category = safeText(product.category,"Fashion");
    const name = safeText(product.name,"Product Name");
    const rating = safeText(product.rating,"4.8");
    const activeWishlist = isWishlisted(productId);

    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = productId;

    card.innerHTML = `
        <div class="product-image">
            <a href="${link}" aria-label="${name}">
                <img
                    src="${image}"
                    alt="${name}"
                    class="home-product-img"
                    loading="lazy"
                >
            </a>

            <button
                type="button"
                class="wishlist-btn ${activeWishlist ? "active" : ""}"
                data-id="${productId}"
                aria-label="Add to wishlist"
            >
                <i data-lucide="heart"></i>
            </button>

            ${
                badge
                ?
                `<span class="product-badge">${badge}</span>`
                :
                `<span class="product-badge">New</span>`
            }

            <span class="product-stock ${stockInfo.className}">
                ${stockInfo.text}
            </span>
        </div>

        <div class="product-info">
            <p class="product-category">${category}</p>

            <h3 class="product-name">
                <a href="${link}">${name}</a>
            </h3>

            <div class="product-rating">
                <span class="rating-stars">★★★★★</span>
                <span>${rating}</span>
            </div>

            <div class="product-bottom">
                <h4>${money(product.price)}</h4>

                <button
                    type="button"
                    class="add-cart-btn"
                    data-id="${productId}"
                    ${stockInfo.disabled ? "disabled" : ""}
                >
                    ${
                        stockInfo.disabled
                        ?
                        "Out Of Stock"
                        :
                        "Add To Cart"
                    }
                </button>
            </div>
        </div>
    `;

    const img = card.querySelector(".home-product-img");

    if(img){
        img.onerror = function(){
            this.onerror = null;
            this.src = FALLBACK_IMAGE;
        };
    }

    const addCartBtn = card.querySelector(".add-cart-btn");

    if(addCartBtn){
        addCartBtn.addEventListener("click",(event)=>{
            event.preventDefault();
            event.stopPropagation();

            if(stockInfo.disabled){
                return;
            }

            const cartService = window.CartService || window.cartService;

            if(!cartService || typeof cartService.addToCart !== "function"){
                console.error("Cart service missing");
                return;
            }

            cartService.addToCart({
                id:productId,
                name:name,
                category:category,
                image:image,
                price:Number(product.price || 0),
                quantity:1,
                size:product.size || "M",
                stock:Number(product.stock || 0)
            });

            updateHeaderCounts();

            window.dispatchEvent(
                new CustomEvent("cartItemAdded",{
                    detail:{
                        id:productId,
                        name:name
                    }
                })
            );

            openCartDrawer();

            addCartBtn.textContent = "Added";

            setTimeout(()=>{
                addCartBtn.textContent = "Add To Cart";
            },900);
        });
    }

    const wishlistBtn = card.querySelector(".wishlist-btn");

    if(wishlistBtn){
        wishlistBtn.addEventListener("click",(event)=>{
            event.preventDefault();
            event.stopPropagation();

            const wishlistService =
            window.WishlistService ||
            window.wishlistService;

            if(
                wishlistService &&
                typeof wishlistService.toggleWishlist === "function"
            ){
                wishlistService.toggleWishlist({
                    id:productId,
                    name:name,
                    category:category,
                    image:image,
                    price:Number(product.price || 0)
                });
            }
            else{
                let wishlist = getWishlist();

                const exists = wishlist.some(
                    item=>String(item.id) === String(productId)
                );

                if(exists){
                    wishlist = wishlist.filter(
                        item=>String(item.id) !== String(productId)
                    );
                }
                else{
                    wishlist.push({
                        id:productId,
                        name:name,
                        category:category,
                        image:image,
                        price:Number(product.price || 0)
                    });
                }

                localStorage.setItem(
                    WISHLIST_KEY,
                    JSON.stringify(wishlist)
                );

                window.dispatchEvent(
                    new CustomEvent("wishlistUpdated")
                );
            }

            wishlistBtn.classList.toggle("active");
            updateHeaderCounts();
            refreshLucide();
        });
    }

    return card;
}


/*=========================================================
    RENDER FEATURED PRODUCTS
=========================================================*/

function renderFeaturedProducts(products){
    const grid = document.querySelector("#home-featured-products");
    const empty = document.querySelector("#home-featured-empty");

    if(!grid){
        return;
    }

    grid.innerHTML = "";

    if(!products.length){
        if(empty){
            empty.classList.add("active");
        }
        return;
    }

    if(empty){
        empty.classList.remove("active");
    }

    products.forEach(product=>{
        grid.appendChild(
            createProductCard(product)
        );
    });

    refreshLucide();
}


/*=========================================================
    NEWSLETTER
=========================================================*/

const newsletterForm = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");

if(newsletterForm && newsletterEmail){
    newsletterForm.addEventListener("submit",(event)=>{
        event.preventDefault();

        const email = newsletterEmail.value.trim();

        if(!email){
            return;
        }

        newsletterEmail.value = "";
        newsletterEmail.placeholder = "Subscribed successfully";
    });
}


/*=========================================================
    IMAGE FALLBACKS
=========================================================*/

function setupImageFallbacks(){
    document.querySelectorAll("img").forEach(img=>{
        img.addEventListener("error",function(){
            this.onerror = null;
            this.src = FALLBACK_IMAGE;
        });
    });
}


/*=========================================================
    INIT
=========================================================*/

async function initHome(){
    updateHeaderCounts();
    setupImageFallbacks();

    const products = await getProducts();

    updateCategoryCounts(products);

    const featuredProducts = getFeaturedProducts(products);

    renderFeaturedProducts(featuredProducts);

    refreshLucide();
}

window.addEventListener("cartUpdated",updateHeaderCounts);
window.addEventListener("wishlistUpdated",updateHeaderCounts);
window.addEventListener("storage",updateHeaderCounts);

window.TaqdeerHome = {
    refresh:initHome,
    updateHeaderCounts,
    openCartDrawer
};

initHome();

});