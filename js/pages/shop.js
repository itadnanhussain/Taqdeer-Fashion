/*=========================================================
    TAQDEER FASHION
    SHOP PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{

/*=========================================================
    DOM
=========================================================*/

const productGrid = document.getElementById("shopProductsGrid");
const emptyBox = document.getElementById("shopEmpty");
const productCount = document.getElementById("productCount");

const searchInput = document.getElementById("shopSearchInput");
const shopHeaderSearch = document.getElementById("shopHeaderSearch");

const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll(".shop-category-btn");

const priceRange = document.getElementById("priceRange");
const priceRangeValue = document.getElementById("priceRangeValue");

const sizeFilters = document.querySelectorAll(".size-filter");
const stockInFilter = document.getElementById("stockInFilter");
const stockOutFilter = document.getElementById("stockOutFilter");

const clearAllFilters = document.getElementById("clearAllFilters");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const viewButtons = document.querySelectorAll(".view-buttons button");

const mobileFilterBtn = document.getElementById("mobileFilterBtn");
const shopSidebar = document.getElementById("shopSidebar");
const shopFilterOverlay = document.getElementById("shopFilterOverlay");

const newsletterForm = document.getElementById("shopNewsletterForm");
const newsletterEmail = document.getElementById("shopNewsletterEmail");


/*=========================================================
    STATE
=========================================================*/

let allProducts = [];
let currentCategory = "all";
let currentView = "grid";
let visibleLimit = 12;

const CART_KEY = "taqdeerCart";
const WISHLIST_KEY = "taqdeerWishlist";
const FALLBACK_IMAGE = "../../assets/placeholders/product.jpg";

const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get("category");
const urlSearch = urlParams.get("search");
const urlFilter = urlParams.get("filter");

if(urlCategory){
    currentCategory = normalizeCategory(urlCategory);
}

if(searchInput && urlSearch){
    searchInput.value = urlSearch;
}


/*=========================================================
    HELPERS
=========================================================*/

function normalizeCategory(value){
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g,"-");
}

function money(value){
    return "৳" + Number(value || 0).toLocaleString();
}

function safeText(value, fallback = ""){
    return value ? String(value) : fallback;
}

function getPrice(product){
    return Number(
        product.price ||
        product.salePrice ||
        product.finalPrice ||
        product.discountPrice ||
        product.currentPrice ||
        0
    );
}

function getOldPrice(product){
    return Number(
        product.oldPrice ||
        product.regularPrice ||
        product.comparePrice ||
        product.mrp ||
        0
    );
}

function getStock(product){
    return Number(
        product.stock ||
        product.quantity ||
        product.availableStock ||
        product.pcs ||
        0
    );
}

function getImagePath(path){
    if(!path){
        return FALLBACK_IMAGE;
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

    return FALLBACK_IMAGE;
}

function getProductImage(product){
    return getImagePath(
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        product.mainImage ||
        (
            Array.isArray(product.images)
            ?
            product.images[0]
            :
            ""
        )
    );
}

function getProductId(product){
    return product.id || product.docId || product.productId || "";
}

function getProductSizes(product){
    if(Array.isArray(product.sizes) && product.sizes.length){
        return product.sizes.map(size=>String(size).toUpperCase());
    }

    if(product.size){
        return String(product.size)
            .split(",")
            .map(size=>size.trim().toUpperCase())
            .filter(Boolean);
    }

    return ["S","M","L","XL"];
}

function getDiscountPercent(product){
    const price = getPrice(product);
    const oldPrice = getOldPrice(product);

    if(product.discount){
        return Number(product.discount);
    }

    if(!price || !oldPrice || oldPrice <= price){
        return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function getRating(product){
    return Number(product.rating || 4.8);
}

function refreshLucide(){
    if(window.lucide){
        window.lucide.createIcons();
    }
}


/*=========================================================
    CART / WISHLIST HELPERS
=========================================================*/

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

function saveWishlist(wishlist){
    localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(wishlist)
    );

    window.dispatchEvent(
        new CustomEvent("wishlistUpdated")
    );

    updateHeaderCounts();
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

function isWishlisted(productId){
    return getWishlist().some(
        item=>String(item.id) === String(productId)
    );
}

function toggleWishlist(product){
    const productId = getProductId(product);

    if(!productId){
        return;
    }

    const service = window.WishlistService || window.wishlistService;

    if(service && typeof service.toggleWishlist === "function"){
        service.toggleWishlist({
            id:productId,
            name:safeText(product.name,"Product"),
            price:getPrice(product),
            image:getProductImage(product),
            category:safeText(product.category,"Fashion")
        });

        updateHeaderCounts();
        return;
    }

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
            name:safeText(product.name,"Product"),
            price:getPrice(product),
            image:getProductImage(product),
            category:safeText(product.category,"Fashion")
        });
    }

    saveWishlist(wishlist);
}

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

function addToCart(product, openDrawer = true){
    const productId = getProductId(product);

    if(!productId){
        console.error("Invalid product id", product);
        return;
    }

    const cartItem = {
        id:productId,
        name:safeText(product.name,"Product"),
        category:safeText(product.category,"Fashion"),
        image:getProductImage(product),
        price:getPrice(product),
        quantity:1,
        size:getProductSizes(product)[0] || "M",
        color:product.color || ""
    };

    const service = window.CartService || window.cartService;

    if(service && typeof service.addToCart === "function"){
        service.addToCart(cartItem);
    }
    else{
        const cart = getCart();

        const existing = cart.find(item=>
            String(item.id) === String(cartItem.id) &&
            String(item.size || "M") === String(cartItem.size || "M")
        );

        if(existing){
            existing.quantity = Number(existing.quantity || 1) + 1;
        }
        else{
            cart.push(cartItem);
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        window.dispatchEvent(
            new CustomEvent("cartUpdated")
        );
    }

    updateHeaderCounts();

    window.dispatchEvent(
        new CustomEvent("cartItemAdded",{
            detail:cartItem
        })
    );

    if(openDrawer){
        openCartDrawer();
    }
}


/*=========================================================
    PRODUCT LOAD
=========================================================*/

async function loadProducts(){
    try{
        if(productCount){
            productCount.textContent = "Loading products...";
        }

        if(productGrid){
            productGrid.innerHTML = `
                <div class="shop-empty">
                    <h3>Loading products...</h3>
                    <p>Please wait a moment.</p>
                </div>
            `;
        }

        const service = window.productService || window.ProductService;

        if(!service || typeof service.getProducts !== "function"){
            throw new Error("Product service missing");
        }

        const products = await service.getProducts();

        allProducts = Array.isArray(products) ? products : [];

        updateCategoryCounts();
        syncActiveCategory();
        renderProducts();

        updateHeaderCounts();
    }
    catch(error){
        console.error("Shop Load Error:", error);

        if(productGrid){
            productGrid.innerHTML = "";
        }

        if(productCount){
            productCount.textContent = "0 products found";
        }

        if(emptyBox){
            emptyBox.classList.remove("hidden");
        }
    }
}


/*=========================================================
    CATEGORY COUNTS
=========================================================*/

function updateCategoryCounts(){
    const counts = {
        all:allProducts.length,
        panjabi:0,
        shirt:0,
        "t-shirt":0,
        trouser:0,
        "drop-shoulder":0,
        jersey:0
    };

    allProducts.forEach(product=>{
        const category = normalizeCategory(product.category);

        if(Object.prototype.hasOwnProperty.call(counts,category)){
            counts[category]++;
        }
    });

    Object.keys(counts).forEach(key=>{
        const element = document.getElementById("count-" + key);

        if(element){
            element.textContent = counts[key];
        }
    });
}


/*=========================================================
    FILTERING
=========================================================*/

function getSelectedSizes(){
    return Array.from(sizeFilters)
        .filter(input=>input.checked)
        .map(input=>String(input.value).toLowerCase());
}

function productHasSelectedSize(product, selectedSizes){
    if(!selectedSizes.length){
        return true;
    }

    const productSizes = getProductSizes(product)
        .map(size=>String(size).toLowerCase());

    return selectedSizes.some(size=>productSizes.includes(size));
}

function getFilteredProducts(){
    let products = [...allProducts];

    if(currentCategory !== "all"){
        products = products.filter(product=>
            normalizeCategory(product.category) === currentCategory
        );
    }

    if(urlFilter){
        const filter = String(urlFilter).toLowerCase();

        if(filter === "new"){
            products = products.filter(product=>{
                const badge = String(product.badge || "").toLowerCase();
                const type = String(product.type || "").toLowerCase();

                return badge === "new" || type === "new" || product.isNew === true;
            });
        }

        if(filter === "best"){
            products = products.filter(product=>{
                const badge = String(product.badge || "").toLowerCase();
                const type = String(product.type || "").toLowerCase();

                return (
                    badge === "best seller" ||
                    type === "best" ||
                    product.bestSeller === true
                );
            });
        }

        if(filter === "premium"){
            products = products.filter(product=>{
                const badge = String(product.badge || "").toLowerCase();
                const type = String(product.type || "").toLowerCase();

                return (
                    badge === "premium" ||
                    type === "premium" ||
                    product.premium === true
                );
            });
        }
    }

    const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

    if(search){
        products = products.filter(product=>{
            const name = String(product.name || "").toLowerCase();
            const category = String(product.category || "").toLowerCase();
            const badge = String(product.badge || "").toLowerCase();
            const description = String(product.description || "").toLowerCase();

            return (
                name.includes(search) ||
                category.includes(search) ||
                badge.includes(search) ||
                description.includes(search)
            );
        });
    }

    if(priceRange){
        const maxPrice = Number(priceRange.value || 3000);

        products = products.filter(product=>{
            return getPrice(product) <= maxPrice;
        });
    }

    products = products.filter(product=>
        productHasSelectedSize(product,getSelectedSizes())
    );

    if(stockInFilter && stockInFilter.checked){
        products = products.filter(product=>getStock(product) > 0);
    }

    if(stockOutFilter && stockOutFilter.checked){
        products = products.filter(product=>getStock(product) <= 0);
    }

    return products;
}


/*=========================================================
    SORTING
=========================================================*/

function sortProducts(products){
    if(!sortSelect){
        return products;
    }

    const value = sortSelect.value;

    if(value === "low-high"){
        products.sort((a,b)=>getPrice(a) - getPrice(b));
    }

    if(value === "high-low"){
        products.sort((a,b)=>getPrice(b) - getPrice(a));
    }

    if(value === "rating"){
        products.sort((a,b)=>getRating(b) - getRating(a));
    }

    if(value === "newest"){
        products.sort((a,b)=>{
            const dateA = a.createdAt?.toDate
                ? a.createdAt.toDate()
                : new Date(a.createdAt || 0);

            const dateB = b.createdAt?.toDate
                ? b.createdAt.toDate()
                : new Date(b.createdAt || 0);

            return dateB - dateA;
        });
    }

    if(value === "popularity"){
        products.sort((a,b)=>{
            const soldA = Number(a.sold || a.soldCount || 0);
            const soldB = Number(b.sold || b.soldCount || 0);

            if(soldB !== soldA){
                return soldB - soldA;
            }

            return getRating(b) - getRating(a);
        });
    }

    return products;
}


/*=========================================================
    RENDER
=========================================================*/

function renderProducts(){
    if(!productGrid){
        return;
    }

    let products = getFilteredProducts();
    products = sortProducts(products);

    const visibleProducts = products.slice(0,visibleLimit);

    productGrid.innerHTML = "";
    productGrid.classList.toggle("list-view",currentView === "list");

    if(productCount){
        if(products.length){
            productCount.textContent =
            `Showing 1–${visibleProducts.length} of ${products.length} products`;
        }
        else{
            productCount.textContent = "0 products found";
        }
    }

    if(!products.length){
        if(emptyBox){
            emptyBox.classList.remove("hidden");
        }

        if(loadMoreBtn){
            loadMoreBtn.style.display = "none";
        }

        return;
    }

    if(emptyBox){
        emptyBox.classList.add("hidden");
    }

    visibleProducts.forEach(product=>{
        productGrid.appendChild(
            createProductCard(product)
        );
    });

    if(loadMoreBtn){
        loadMoreBtn.style.display =
        products.length > visibleLimit ? "flex" : "none";
    }

    refreshLucide();
}

function createProductCard(product){
    const id = getProductId(product);
    const name = safeText(product.name,"Product");
    const category = safeText(product.category,"Premium Cotton");
    const price = getPrice(product);
    const oldPrice = getOldPrice(product);
    const rating = getRating(product);
    const reviews = Number(product.reviews || product.reviewCount || 0);
    const image = getProductImage(product);
    const discount = getDiscountPercent(product);
    const stock = getStock(product);
    const sizes = getProductSizes(product).slice(0,5);
    const wishlisted = isWishlisted(id);

    const card = document.createElement("article");
    card.className = "shop-product-card";
    card.dataset.id = id;

    card.innerHTML = `
        <div class="shop-product-image">
            ${
                discount
                ?
                `<span class="discount-badge">-${discount}%</span>`
                :
                (
                    product.badge
                    ?
                    `<span class="shop-badge">${product.badge}</span>`
                    :
                    ""
                )
            }

            <button
                type="button"
                class="shop-wishlist-btn ${wishlisted ? "active" : ""}"
                data-id="${id}"
                aria-label="Add to wishlist"
            >
                <i data-lucide="heart"></i>
            </button>

            <a href="../product-details/index.html?id=${encodeURIComponent(id)}">
                <img
                    src="${image}"
                    alt="${name}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                >
            </a>
        </div>

        <div class="shop-product-info">
            <p class="shop-product-category">${category}</p>

            <h3>${name}</h3>

            <div class="shop-rating">
                <strong>★</strong>
                <span>${rating.toFixed(1)} ${reviews ? `(${reviews})` : ""}</span>
            </div>

            <div class="shop-price-row">
                <strong>${money(price)}</strong>
                ${oldPrice && oldPrice > price ? `<del>${money(oldPrice)}</del>` : ""}
            </div>

            <div class="size-row">
                ${
                    sizes.map(size=>`<span>${size}</span>`).join("")
                }
            </div>

            <div class="stock-row ${stock > 0 ? "" : "out"}">
                ${stock > 0 ? "In Stock" : "Out of Stock"}
            </div>

            <div class="shop-action-row">
                <button
                    type="button"
                    class="shop-add-cart"
                    data-id="${id}"
                    ${stock <= 0 ? "disabled" : ""}
                >
                    <i data-lucide="shopping-cart"></i>
                    Add to Cart
                </button>

                <button
                    type="button"
                    class="shop-buy-now"
                    data-id="${id}"
                    ${stock <= 0 ? "disabled" : ""}
                    aria-label="Buy now"
                >
                    <i data-lucide="shopping-bag"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}


/*=========================================================
    UI SYNC
=========================================================*/

function syncActiveCategory(){
    categoryButtons.forEach(button=>{
        const buttonCategory = normalizeCategory(button.dataset.category || "all");

        button.classList.toggle(
            "active",
            buttonCategory === currentCategory
        );
    });
}

function closeMobileFilter(){
    if(shopSidebar){
        shopSidebar.classList.remove("active");
    }

    if(shopFilterOverlay){
        shopFilterOverlay.classList.remove("active");
    }

    document.body.style.overflow = "";
}

function openMobileFilter(){
    if(shopSidebar){
        shopSidebar.classList.add("active");
    }

    if(shopFilterOverlay){
        shopFilterOverlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";
}

function resetFilters(){
    currentCategory = "all";
    visibleLimit = 12;

    if(searchInput){
        searchInput.value = "";
    }

    if(priceRange){
        priceRange.value = 3000;
    }

    if(priceRangeValue){
        priceRangeValue.textContent = "৳3000+";
    }

    sizeFilters.forEach(input=>{
        input.checked = false;
    });

    if(stockInFilter){
        stockInFilter.checked = false;
    }

    if(stockOutFilter){
        stockOutFilter.checked = false;
    }

    if(sortSelect){
        sortSelect.value = "popularity";
    }

    syncActiveCategory();
    window.history.pushState({},"","index.html");

    renderProducts();
}


/*=========================================================
    EVENTS
=========================================================*/

categoryButtons.forEach(button=>{
    button.addEventListener("click",()=>{
        currentCategory = normalizeCategory(button.dataset.category || "all");
        visibleLimit = 12;

        syncActiveCategory();

        const newUrl =
        currentCategory === "all"
        ?
        "index.html"
        :
        `index.html?category=${encodeURIComponent(currentCategory)}`;

        window.history.pushState({}, "", newUrl);

        renderProducts();

        if(window.innerWidth <= 980){
            closeMobileFilter();
        }
    });
});

if(shopHeaderSearch && searchInput){
    shopHeaderSearch.addEventListener("submit",(event)=>{
        event.preventDefault();

        visibleLimit = 12;
        renderProducts();
    });

    searchInput.addEventListener("input",()=>{
        visibleLimit = 12;
        renderProducts();
    });
}

if(sortSelect){
    sortSelect.addEventListener("change",()=>{
        visibleLimit = 12;
        renderProducts();
    });
}

if(priceRange){
    priceRange.addEventListener("input",()=>{
        if(priceRangeValue){
            priceRangeValue.textContent =
            `৳${Number(priceRange.value).toLocaleString()}+`;
        }

        visibleLimit = 12;
        renderProducts();
    });
}

sizeFilters.forEach(input=>{
    input.addEventListener("change",()=>{
        visibleLimit = 12;
        renderProducts();
    });
});

if(stockInFilter){
    stockInFilter.addEventListener("change",()=>{
        visibleLimit = 12;
        renderProducts();
    });
}

if(stockOutFilter){
    stockOutFilter.addEventListener("change",()=>{
        visibleLimit = 12;
        renderProducts();
    });
}

if(clearAllFilters){
    clearAllFilters.addEventListener("click",resetFilters);
}

viewButtons.forEach(button=>{
    button.addEventListener("click",()=>{
        viewButtons.forEach(btn=>btn.classList.remove("active"));
        button.classList.add("active");

        currentView = button.dataset.view || "grid";
        renderProducts();
    });
});

if(loadMoreBtn){
    loadMoreBtn.addEventListener("click",()=>{
        visibleLimit += 12;
        renderProducts();
    });
}

if(mobileFilterBtn){
    mobileFilterBtn.addEventListener("click",openMobileFilter);
}

if(shopFilterOverlay){
    shopFilterOverlay.addEventListener("click",closeMobileFilter);
}

document.addEventListener("keydown",(event)=>{
    if(event.key === "Escape"){
        closeMobileFilter();
    }
});

document.addEventListener("click",(event)=>{
    const addCartBtn = event.target.closest(".shop-add-cart");
    const buyNowBtn = event.target.closest(".shop-buy-now");
    const wishlistBtn = event.target.closest(".shop-wishlist-btn");

    if(addCartBtn){
        const product = allProducts.find(item=>
            String(getProductId(item)) === String(addCartBtn.dataset.id)
        );

        if(product){
            addToCart(product,true);

            addCartBtn.innerHTML = `
                <i data-lucide="check"></i>
                Added
            `;

            refreshLucide();

            setTimeout(()=>{
                addCartBtn.innerHTML = `
                    <i data-lucide="shopping-cart"></i>
                    Add to Cart
                `;
                refreshLucide();
            },900);
        }

        return;
    }

    if(buyNowBtn){
        const product = allProducts.find(item=>
            String(getProductId(item)) === String(buyNowBtn.dataset.id)
        );

        if(product){
            addToCart(product,false);
            window.location.href = "../checkout/index.html";
        }

        return;
    }

    if(wishlistBtn){
        const product = allProducts.find(item=>
            String(getProductId(item)) === String(wishlistBtn.dataset.id)
        );

        if(product){
            toggleWishlist(product);
            renderProducts();
        }

        return;
    }
});

if(newsletterForm && newsletterEmail){
    newsletterForm.addEventListener("submit",(event)=>{
        event.preventDefault();

        newsletterEmail.value = "";
        newsletterEmail.placeholder = "Subscribed successfully";
    });
}

window.addEventListener("cartUpdated",updateHeaderCounts);
window.addEventListener("wishlistUpdated",updateHeaderCounts);
window.addEventListener("storage",updateHeaderCounts);


/*=========================================================
    INIT
=========================================================*/

syncActiveCategory();
updateHeaderCounts();
loadProducts();
refreshLucide();

window.TaqdeerShop = {
    refresh:loadProducts,
    render:renderProducts,
    resetFilters,
    openMobileFilter,
    closeMobileFilter
};

});