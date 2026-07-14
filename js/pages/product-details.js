/*=========================================================
    TAQDEER FASHION
    PRODUCT DETAILS PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{

/*=========================================================
    DOM
=========================================================*/

const mainImage = document.getElementById("main-product-image");
const thumbnails = document.getElementById("product-thumbnails");

const productTitle = document.getElementById("product-title");
const productPrice = document.getElementById("product-price");
const productOldPrice = document.getElementById("product-old-price");
const productOfferBadge = document.getElementById("product-offer-badge");
const productDiscountBadge = document.getElementById("product-discount-badge");

const productRating = document.getElementById("product-rating");
const productSold = document.getElementById("product-sold");
const breadcrumbCategory = document.getElementById("breadcrumb-category");

const shortDescription = document.getElementById("product-short-description");
const descriptionText = document.getElementById("product-description-text");

const colorSection = document.getElementById("color-section");
const colorList = document.getElementById("color-variant-list");
const sizeOptions = document.getElementById("size-options");

const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");
const qtyText = document.getElementById("product-qty");

const addToCartBtn = document.getElementById("detailsAddToCartBtn");
const buyNowBtn = document.getElementById("buy-now-btn");

const stockStatusText = document.getElementById("stock-status-text");
const stockWarning = document.getElementById("stock-warning");

const relatedProducts = document.getElementById("related-products");

const lightbox = document.getElementById("product-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

const sizeChartOpen = document.querySelector(".size-chart-open");
const sizeChartPanel = document.getElementById("size-chart-panel");

const tabButtons = document.querySelectorAll(".product-tabs button");
const tabContents = document.querySelectorAll(".tab-content");

const wishlistBtn = document.getElementById("wishlistProductBtn");
const shareBtn = document.getElementById("shareProductBtn");

const galleryPrevBtn = document.getElementById("galleryPrevBtn");
const galleryNextBtn = document.getElementById("galleryNextBtn");

const productHeaderSearch = document.getElementById("productHeaderSearch");
const productSearchInput = document.getElementById("productSearchInput");


/*=========================================================
    STATE
=========================================================*/

let currentProduct = null;
let currentImages = [];
let currentImageIndex = 0;

let selectedSize = "M";
let selectedColor = "";
let selectedImage = "";
let quantity = 1;

const CART_KEY = "taqdeerCart";
const WISHLIST_KEY = "taqdeerWishlist";
const FALLBACK_IMAGE = "../../assets/placeholders/product.jpg";


/*=========================================================
    HELPERS
=========================================================*/

function getProductIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function money(value){
    return "৳" + Number(value || 0).toLocaleString();
}

function safeText(value, fallback = ""){
    return value ? String(value) : fallback;
}

function getImagePath(path){
    if(!path){
        return FALLBACK_IMAGE;
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

    return FALLBACK_IMAGE;
}

function setImage(element,path){
    if(!element){
        return;
    }

    element.src = getImagePath(path);

    element.onerror = function(){
        this.onerror = null;
        this.src = FALLBACK_IMAGE;
    };
}

function refreshLucide(){
    if(window.lucide){
        window.lucide.createIcons();
    }
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

function getRating(product){
    return Number(product.rating || 4.8);
}

function calculateOffer(price,oldPrice){
    price = Number(price || 0);
    oldPrice = Number(oldPrice || 0);

    if(!oldPrice || oldPrice <= price){
        return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function getColorHex(color){
    const map = {
        blue:"#8ab6d6",
        black:"#111111",
        maroon:"#6f1d2d",
        red:"#dc2626",
        white:"#ffffff",
        cream:"#eadfc8",
        brown:"#7c4a2d",
        green:"#3f6b46",
        olive:"#6b705c",
        navy:"#172554",
        grey:"#9ca3af",
        gray:"#9ca3af",
        sky:"#93c5fd",
        "sky blue":"#93c5fd",
        beige:"#d6c2a6"
    };

    const key = String(color || "").trim().toLowerCase();

    return map[key] || "#2f3a45";
}

function normalizeImages(product){
    const images = [];

    const singleImages = [
        product.image,
        product.imageUrl,
        product.thumbnail,
        product.mainImage
    ];

    singleImages.forEach(img=>{
        if(img && !images.includes(img)){
            images.push(img);
        }
    });

    if(Array.isArray(product.images)){
        product.images.forEach(img=>{
            if(img && !images.includes(img)){
                images.push(img);
            }
        });
    }

    if(Array.isArray(product.gallery)){
        product.gallery.forEach(img=>{
            if(img && !images.includes(img)){
                images.push(img);
            }
        });
    }

    if(Array.isArray(product.colors)){
        product.colors.forEach(color=>{
            const img = color.image || color.photo || color.imageUrl;

            if(img && !images.includes(img)){
                images.push(img);
            }
        });
    }

    return images.length ? images : [FALLBACK_IMAGE];
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

    return ["S","M","L","XL","XXL"];
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
    DEMO FALLBACK
=========================================================*/

function getDemoProducts(){
    return [
        {
            id:"demo-shirt",
            name:"Mens Premium Casual Shirt – Novellise",
            category:"Shirt",
            price:1090,
            oldPrice:1390,
            rating:4.8,
            sold:256,
            stock:8,
            image:"assets/categories/shirt.jpeg",
            images:[
                "assets/categories/shirt.jpeg",
                "assets/placeholders/product.jpg"
            ],
            description:"Premium dobby textured fabric with breathable cotton-blend comfort. Designed with structured collar, durable button fastening and smart casual versatile styling for everyday use.",
            shortDescription:"Premium quality casual shirt for everyday comfort and smart modern style.",
            sizes:["S","M","L","XL","XXL"],
            colors:[
                {
                    name:"Blue",
                    hex:"#8ab6d6",
                    image:"assets/categories/shirt.jpeg"
                },
                {
                    name:"Black",
                    hex:"#111111",
                    image:"assets/placeholders/product.jpg"
                }
            ]
        },
        {
            id:"demo-polo",
            name:"Premium Designer Edition Double PK Cotton Polo – Marine",
            category:"Polo",
            price:1140,
            oldPrice:1450,
            rating:4.8,
            sold:190,
            stock:12,
            image:"assets/placeholders/product.jpg",
            description:"Premium polo shirt with soft cotton texture, clean collar finishing and comfortable fit.",
            shortDescription:"Premium polo shirt for smart casual styling.",
            sizes:["M","L","XL"],
            colors:[]
        }
    ];
}


/*=========================================================
    LOAD PRODUCT
=========================================================*/

async function loadProduct(){
    const productId = getProductIdFromUrl();
    let product = null;

    try{
        const service = window.productService || window.ProductService;

        if(service && typeof service.getProductById === "function" && productId){
            product = await service.getProductById(productId);
        }

        if(!product && window.db && productId){
            const doc = await window.db
                .collection("products")
                .doc(productId)
                .get();

            if(doc.exists){
                product = {
                    id:doc.id,
                    ...doc.data()
                };
            }
        }
    }
    catch(error){
        console.error("Product Load Error:",error);
    }

    if(!product){
        const demos = getDemoProducts();

        product =
        demos.find(item=>String(item.id) === String(productId)) ||
        demos[0];
    }

    currentProduct = product;

    renderProduct(product);
}


/*=========================================================
    RENDER PRODUCT
=========================================================*/

function renderProduct(product){
    const title = safeText(product.name || product.title,"Product Name");
    const category = safeText(product.category,"Product");

    const price = getPrice(product);
    const oldPrice = getOldPrice(product);
    const offer = Number(product.discount || calculateOffer(price,oldPrice));

    const rating = getRating(product);
    const reviews = Number(product.reviews || product.reviewCount || 0);
    const sold = Number(
        product.sold ||
        product.soldCount ||
        product.salesCount ||
        product.totalSold ||
        0
    );

    const stock = getStock(product);

    currentImages = normalizeImages(product);
    currentImageIndex = 0;
    selectedImage = currentImages[0];

    const sizes = getProductSizes(product);
    selectedSize = sizes[0] || "M";

    if(productTitle){
        productTitle.textContent = title;
    }

    if(breadcrumbCategory){
        breadcrumbCategory.textContent = category;
    }

    document.title = `${title} | Taqdeer Fashion`;

    if(productPrice){
        productPrice.textContent = money(price);
    }

    if(productOldPrice){
        if(oldPrice && oldPrice > price){
            productOldPrice.style.display = "inline";
            productOldPrice.textContent = money(oldPrice);
        }
        else{
            productOldPrice.style.display = "none";
        }
    }

    if(productOfferBadge){
        if(offer > 0){
            productOfferBadge.style.display = "flex";
            productOfferBadge.textContent = `${offer}% OFF`;
        }
        else{
            productOfferBadge.style.display = "none";
        }
    }

    if(productDiscountBadge){
        if(offer > 0){
            productDiscountBadge.style.display = "flex";
            productDiscountBadge.innerHTML = `SALE<br>-${offer}%`;
        }
        else{
            productDiscountBadge.style.display = "none";
        }
    }

    if(productRating){
        productRating.textContent =
        `${rating.toFixed(1)} ${reviews ? `(${reviews} Reviews)` : "(0 Reviews)"}`;
    }

    if(productSold){
        productSold.textContent = sold > 0 ? `Sold ${sold}+` : "Sold 0+";
    }

    if(shortDescription){
        shortDescription.textContent =
        product.shortDescription ||
        product.summary ||
        "Premium fashion crafted for comfort, confidence and everyday style.";
    }

    if(descriptionText){
        descriptionText.textContent =
        product.description ||
        product.details ||
        product.longDescription ||
        "No product description available.";
    }

    if(stockStatusText){
        stockStatusText.textContent = stock > 0 ? "In Stock" : "Out of Stock";
    }

    if(stockWarning){
        stockWarning.textContent =
        stock > 0
        ?
        `Only ${stock} items left!`
        :
        "This product is currently out of stock.";
    }

    if(addToCartBtn){
        addToCartBtn.disabled = stock <= 0;
    }

    if(buyNowBtn){
        buyNowBtn.disabled = stock <= 0;
    }

    setImage(mainImage,currentImages[0]);
    renderThumbnails(currentImages);
    renderColors(product);
    renderSizes(sizes);
    renderRelated(product);
    syncWishlistButton();

    refreshLucide();
}


/*=========================================================
    GALLERY
=========================================================*/

function showImageByIndex(index){
    if(!currentImages.length){
        return;
    }

    if(index < 0){
        index = currentImages.length - 1;
    }

    if(index >= currentImages.length){
        index = 0;
    }

    currentImageIndex = index;
    selectedImage = currentImages[currentImageIndex];

    setImage(mainImage,selectedImage);

    document.querySelectorAll(".product-thumb").forEach((thumb,i)=>{
        thumb.classList.toggle("active",i === currentImageIndex);
    });
}

function renderThumbnails(images){
    if(!thumbnails){
        return;
    }

    thumbnails.innerHTML = "";

    images.slice(0,5).forEach((img,index)=>{
        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "product-thumb active" : "product-thumb";

        button.innerHTML = `
            <img
                src="${getImagePath(img)}"
                alt="Product thumbnail"
                onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
            >
        `;

        button.addEventListener("click",()=>{
            showImageByIndex(index);
        });

        thumbnails.appendChild(button);
    });
}

if(galleryPrevBtn){
    galleryPrevBtn.addEventListener("click",()=>{
        showImageByIndex(currentImageIndex - 1);
    });
}

if(galleryNextBtn){
    galleryNextBtn.addEventListener("click",()=>{
        showImageByIndex(currentImageIndex + 1);
    });
}


/*=========================================================
    COLORS + SIZES
=========================================================*/

function renderColors(product){
    if(!colorSection || !colorList){
        return;
    }

    const colors =
    product.colors ||
    product.colorVariants ||
    product.variants ||
    product.variantColors ||
    [];

    if(!Array.isArray(colors) || !colors.length){
        colorSection.style.display = "none";
        return;
    }

    colorSection.style.display = "flex";
    colorList.innerHTML = "";

    colors.forEach((color,index)=>{
        const colorName =
        color.name ||
        color.color ||
        color.title ||
        `Color ${index + 1}`;

        const colorHex =
        color.hex ||
        color.colorCode ||
        getColorHex(colorName);

        const colorImage =
        color.image ||
        color.photo ||
        color.imageUrl ||
        product.image ||
        "";

        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "color-pill active" : "color-pill";
        button.dataset.color = colorName;

        button.innerHTML = `
            <span class="color-dot" style="background:${colorHex};"></span>
        `;

        button.addEventListener("click",()=>{
            document.querySelectorAll(".color-pill").forEach(item=>{
                item.classList.remove("active");
            });

            button.classList.add("active");
            selectedColor = colorName;

            if(colorImage){
                selectedImage = colorImage;
                setImage(mainImage,colorImage);
            }
        });

        colorList.appendChild(button);

        if(index === 0){
            selectedColor = colorName;
        }
    });
}

function renderSizes(sizes){
    if(!sizeOptions){
        return;
    }

    sizeOptions.innerHTML = "";

    sizes.forEach((size,index)=>{
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.size = size;
        button.textContent = size;
        button.className = index === 0 ? "active" : "";

        button.addEventListener("click",()=>{
            sizeOptions.querySelectorAll("button").forEach(item=>{
                item.classList.remove("active");
            });

            button.classList.add("active");
            selectedSize = size;
        });

        sizeOptions.appendChild(button);
    });
}


/*=========================================================
    QUANTITY
=========================================================*/

function updateQuantity(){
    if(qtyText){
        qtyText.textContent = quantity;
    }
}

if(qtyPlus){
    qtyPlus.addEventListener("click",()=>{
        quantity++;
        updateQuantity();
    });
}

if(qtyMinus){
    qtyMinus.addEventListener("click",()=>{
        if(quantity > 1){
            quantity--;
        }

        updateQuantity();
    });
}


/*=========================================================
    CART
=========================================================*/

function buildCartProduct(){
    if(!currentProduct){
        return null;
    }

    return {
        id:currentProduct.id || getProductIdFromUrl(),
        name:safeText(currentProduct.name || currentProduct.title,"Product"),
        price:getPrice(currentProduct),
        oldPrice:getOldPrice(currentProduct),
        image:selectedImage || currentProduct.image || "",
        category:safeText(currentProduct.category,"Product"),
        size:selectedSize || "M",
        color:selectedColor || "",
        quantity:quantity,
        stock:getStock(currentProduct)
    };
}

function addProductToCart(openDrawer = true){
    const product = buildCartProduct();

    if(!product || !product.id){
        return;
    }

    const service = window.CartService || window.cartService;

    if(service && typeof service.addToCart === "function"){
        service.addToCart(product);
    }
    else{
        const cart = getCart();

        const existing = cart.find(item=>
            String(item.id) === String(product.id) &&
            String(item.size || "M") === String(product.size || "M") &&
            String(item.color || "") === String(product.color || "")
        );

        if(existing){
            existing.quantity = Number(existing.quantity || 1) + Number(product.quantity || 1);
        }
        else{
            cart.push(product);
        }

        localStorage.setItem(CART_KEY,JSON.stringify(cart));

        window.dispatchEvent(
            new CustomEvent("cartUpdated")
        );
    }

    updateHeaderCounts();

    window.dispatchEvent(
        new CustomEvent("cartItemAdded",{
            detail:product
        })
    );

    if(openDrawer){
        openCartDrawer();
    }
}

if(addToCartBtn){
    addToCartBtn.addEventListener("click",()=>{
        addProductToCart(true);

        addToCartBtn.innerHTML = `
            <i data-lucide="check"></i>
            Added
        `;

        refreshLucide();

        setTimeout(()=>{
            addToCartBtn.innerHTML = `
                <i data-lucide="shopping-cart"></i>
                Add to Cart
            `;
            refreshLucide();
        },900);
    });
}

if(buyNowBtn){
    buyNowBtn.addEventListener("click",()=>{
        addProductToCart(false);
        window.location.href = "../checkout/index.html";
    });
}


/*=========================================================
    WISHLIST
=========================================================*/

function syncWishlistButton(){
    if(!wishlistBtn || !currentProduct){
        return;
    }

    const productId = currentProduct.id || getProductIdFromUrl();

    wishlistBtn.classList.toggle(
        "active",
        isWishlisted(productId)
    );
}

function toggleCurrentWishlist(){
    if(!currentProduct){
        return;
    }

    const productId = currentProduct.id || getProductIdFromUrl();

    const item = {
        id:productId,
        name:safeText(currentProduct.name || currentProduct.title,"Product"),
        price:getPrice(currentProduct),
        image:selectedImage || currentProduct.image || "",
        category:safeText(currentProduct.category,"Product")
    };

    const service = window.WishlistService || window.wishlistService;

    if(service && typeof service.toggleWishlist === "function"){
        service.toggleWishlist(item);
    }
    else{
        let wishlist = getWishlist();

        const exists = wishlist.some(
            product=>String(product.id) === String(item.id)
        );

        if(exists){
            wishlist = wishlist.filter(
                product=>String(product.id) !== String(item.id)
            );
        }
        else{
            wishlist.push(item);
        }

        localStorage.setItem(WISHLIST_KEY,JSON.stringify(wishlist));

        window.dispatchEvent(
            new CustomEvent("wishlistUpdated")
        );
    }

    syncWishlistButton();
    updateHeaderCounts();
    refreshLucide();
}

if(wishlistBtn){
    wishlistBtn.addEventListener("click",toggleCurrentWishlist);
}


/*=========================================================
    SHARE
=========================================================*/

if(shareBtn){
    shareBtn.addEventListener("click",async()=>{
        const shareData = {
            title:document.title,
            text:"Check this product from Taqdeer Fashion",
            url:window.location.href
        };

        if(navigator.share){
            try{
                await navigator.share(shareData);
            }
            catch(error){
                console.info("Share cancelled");
            }
        }
        else{
            navigator.clipboard.writeText(window.location.href);
        }
    });
}


/*=========================================================
    TABS + SIZE CHART
=========================================================*/

tabButtons.forEach(button=>{
    button.addEventListener("click",()=>{
        const target = button.dataset.tab;

        tabButtons.forEach(btn=>btn.classList.remove("active"));
        tabContents.forEach(content=>content.classList.remove("active"));

        button.classList.add("active");

        const activeContent = document.getElementById(`tab-${target}`);

        if(activeContent){
            activeContent.classList.add("active");
        }
    });
});

if(sizeChartOpen && sizeChartPanel){
    sizeChartOpen.addEventListener("click",()=>{
        sizeChartPanel.scrollIntoView({
            behavior:"smooth",
            block:"center"
        });
    });
}


/*=========================================================
    LIGHTBOX
=========================================================*/

if(mainImage && lightbox && lightboxImage){
    mainImage.addEventListener("click",()=>{
        lightboxImage.src = mainImage.src;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    });
}

function closeLightbox(){
    if(!lightbox){
        return;
    }

    lightbox.classList.remove("active");
    document.body.style.overflow = "";
}

if(lightboxClose){
    lightboxClose.addEventListener("click",closeLightbox);
}

if(lightbox){
    lightbox.addEventListener("click",(event)=>{
        if(event.target === lightbox){
            closeLightbox();
        }
    });
}

document.addEventListener("keydown",(event)=>{
    if(event.key === "Escape"){
        closeLightbox();
    }
});


/*=========================================================
    RELATED PRODUCTS
=========================================================*/

async function getRelatedProducts(product){
    let items = [];

    try{
        const service = window.productService || window.ProductService;

        if(service && typeof service.getProducts === "function"){
            items = await service.getProducts();
        }
        else if(window.db){
            const snapshot = await window.db
                .collection("products")
                .limit(8)
                .get();

            snapshot.forEach(doc=>{
                items.push({
                    id:doc.id,
                    ...doc.data()
                });
            });
        }
    }
    catch(error){
        console.error("Related Products Load Error:",error);
    }

    if(!Array.isArray(items) || !items.length){
        items = getDemoProducts();
    }

    const currentId = product.id || getProductIdFromUrl();
    const currentCategory = String(product.category || "").toLowerCase();

    return items
        .filter(item=>String(item.id) !== String(currentId))
        .sort((a,b)=>{
            const aSame = String(a.category || "").toLowerCase() === currentCategory ? 1 : 0;
            const bSame = String(b.category || "").toLowerCase() === currentCategory ? 1 : 0;

            return bSame - aSame;
        })
        .slice(0,4);
}

async function renderRelated(product){
    if(!relatedProducts){
        return;
    }

    relatedProducts.innerHTML = `
        <div class="related-empty">Loading related products...</div>
    `;

    const items = await getRelatedProducts(product);

    relatedProducts.innerHTML = "";

    if(!items.length){
        relatedProducts.innerHTML = `
            <div class="related-empty">No related products found.</div>
        `;
        return;
    }

    items.forEach(item=>{
        const id = item.id || item.docId || "";
        const image = getImagePath(item.image || item.imageUrl || item.thumbnail || item.mainImage);
        const price = getPrice(item);
        const oldPrice = getOldPrice(item);
        const category = safeText(item.category,"Product");
        const name = safeText(item.name || item.title,"Product");

        const card = document.createElement("article");
        card.className = "related-card";

        card.dataset.product = JSON.stringify({
            id,
            name,
            price,
            oldPrice,
            image:item.image || item.imageUrl || item.thumbnail || item.mainImage || "",
            category,
            quantity:1
        });

        card.innerHTML = `
            <button type="button" class="related-heart-btn ${isWishlisted(id) ? "active" : ""}" data-id="${id}">
                <i data-lucide="heart"></i>
            </button>

            <a href="index.html?id=${encodeURIComponent(id)}" class="related-img">
                <img
                    src="${image}"
                    alt="${name}"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                >
            </a>

            <div class="related-info">
                <h3>${name}</h3>

                <p>
                    ${money(price)}
                    ${oldPrice && oldPrice > price ? `<del>${money(oldPrice)}</del>` : ""}
                </p>
            </div>
        `;

        relatedProducts.appendChild(card);
    });

    refreshLucide();
}

document.addEventListener("click",(event)=>{
    const relatedHeartBtn = event.target.closest(".related-heart-btn");

    if(relatedHeartBtn){
        const card = relatedHeartBtn.closest(".related-card");

        if(!card || !card.dataset.product){
            return;
        }

        const product = JSON.parse(card.dataset.product);

        let wishlist = getWishlist();

        const exists = wishlist.some(
            item=>String(item.id) === String(product.id)
        );

        if(exists){
            wishlist = wishlist.filter(
                item=>String(item.id) !== String(product.id)
            );
        }
        else{
            wishlist.push(product);
        }

        localStorage.setItem(WISHLIST_KEY,JSON.stringify(wishlist));

        relatedHeartBtn.classList.toggle("active");

        window.dispatchEvent(
            new CustomEvent("wishlistUpdated")
        );

        updateHeaderCounts();
        refreshLucide();
    }
});


/*=========================================================
    SEARCH
=========================================================*/

if(productHeaderSearch && productSearchInput){
    productHeaderSearch.addEventListener("submit",(event)=>{
        event.preventDefault();

        const query = productSearchInput.value.trim();

        if(!query){
            return;
        }

        window.location.href = `../shop/index.html?search=${encodeURIComponent(query)}`;
    });
}

const modalSearchInput = document.querySelector(".search-box input");

if(modalSearchInput){
    modalSearchInput.addEventListener("keydown",(event)=>{
        if(event.key !== "Enter"){
            return;
        }

        const query = modalSearchInput.value.trim();

        if(!query){
            return;
        }

        window.location.href = `../shop/index.html?search=${encodeURIComponent(query)}`;
    });
}


/*=========================================================
    INIT
=========================================================*/

window.addEventListener("cartUpdated",updateHeaderCounts);
window.addEventListener("wishlistUpdated",updateHeaderCounts);
window.addEventListener("storage",updateHeaderCounts);

updateHeaderCounts();
updateQuantity();
loadProduct();
refreshLucide();

window.TaqdeerProductDetails = {
    refresh:loadProduct,
    addToCart:addProductToCart,
    openCartDrawer
};

});