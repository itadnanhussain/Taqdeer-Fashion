/*=========================================================
    TAQDEER FASHION
    PRODUCT DETAILS CLEAN FINAL JS
    Replace: js/pages/product-details.js
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
const relatedSection = document.querySelector(".related-products-section");

const lightbox = document.getElementById("product-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

const sizeChartOpen = document.querySelector(".size-chart-open");
const sizeChartPanel = document.getElementById("size-chart-panel");
const sizeChartBody = document.getElementById("size-chart-body");

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

let selectedSize = "";
let selectedColor = "";
let selectedImage = "";
let quantity = 1;

const CART_KEY = "taqdeerCart";
const WISHLIST_KEY = "taqdeerWishlist";
const FALLBACK_IMAGE = "../../assets/placeholders/product.jpg";
const DEFAULT_SIZES = ["S","M","L","XL","XXL"];


/*=========================================================
    HELPERS
=========================================================*/

function getProductIdFromUrl(){
    return new URLSearchParams(window.location.search).get("id");
}

function money(value){
    return "৳" + Number(value || 0).toLocaleString();
}

function safeText(value, fallback = ""){
    return value ? String(value) : fallback;
}

function refreshLucide(){
    if(window.lucide){
        window.lucide.createIcons();
    }
}

function getImagePath(path){
    if(!path){
        return FALLBACK_IMAGE;
    }

    const imagePath = String(path).trim();

    if(
        imagePath.startsWith("http") ||
        imagePath.startsWith("data:") ||
        imagePath.startsWith("../../") ||
        imagePath.startsWith("../")
    ){
        return imagePath;
    }

    if(imagePath.startsWith("assets/")){
        return "../../" + imagePath;
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
        product.stock ??
        product.quantity ??
        product.availableStock ??
        product.pcs ??
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

    function pushImage(img){
        if(!img){
            return;
        }

        const clean = String(img).trim();

        if(clean && !images.includes(clean)){
            images.push(clean);
        }
    }

    [
        product.image,
        product.imageUrl,
        product.thumbnail,
        product.mainImage,
        product.frontImage,
        product.backImage,
        product.sideImage,
        product.detailImage,
        product.image1,
        product.image2,
        product.image3,
        product.image4,
        product.photo1,
        product.photo2,
        product.photo3,
        product.photo4
    ].forEach(pushImage);

    [
        "images",
        "gallery",
        "photos",
        "productImages",
        "additionalImages",
        "imageGallery"
    ].forEach(key=>{
        if(Array.isArray(product[key])){
            product[key].forEach(pushImage);
        }
    });

    if(Array.isArray(product.colors)){
        product.colors.forEach(color=>{
            pushImage(color.image || color.photo || color.imageUrl);
        });
    }

    if(Array.isArray(product.variants)){
        product.variants.forEach(variant=>{
            pushImage(variant.image || variant.photo || variant.imageUrl);
        });
    }

    return images.length ? images : [FALLBACK_IMAGE];
}

function getProductSizes(product){
    let sizes = [];

    if(Array.isArray(product.sizes) && product.sizes.length){
        sizes = product.sizes
            .map(size=>String(size).trim().toUpperCase())
            .filter(Boolean);
    }
    else if(product.size){
        sizes = String(product.size)
            .split(",")
            .map(size=>size.trim().toUpperCase())
            .filter(Boolean);
    }

    if(!sizes.length || sizes.length < DEFAULT_SIZES.length){
        return [...DEFAULT_SIZES];
    }

    return DEFAULT_SIZES.filter(size=>sizes.includes(size));
}

function getSizeChartRows(product){
    const fromProduct =
        product.sizeChart ||
        product.size_chart ||
        product.measurements;

    if(Array.isArray(fromProduct) && fromProduct.length){
        return fromProduct;
    }

    return [
        { size:"S", chest:"38", shoulder:"16.5", sleeve:"8.5", length:"27" },
        { size:"M", chest:"40", shoulder:"17.5", sleeve:"9", length:"28" },
        { size:"L", chest:"42", shoulder:"18.5", sleeve:"9.5", length:"29" },
        { size:"XL", chest:"44", shoulder:"19.5", sleeve:"10", length:"30" },
        { size:"XXL", chest:"46", shoulder:"20.5", sleeve:"10.5", length:"31" }
    ];
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

function saveCart(cart){
    localStorage.setItem(CART_KEY,JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
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
    localStorage.setItem(WISHLIST_KEY,JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent("wishlistUpdated"));
}

function updateHeaderCounts(){
    const cartCount = getCart().reduce(
        (total,item)=>total + Number(item.quantity || 1),
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

function getProductLink(id){
    return `index.html?id=${encodeURIComponent(id)}`;
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
            category:"shirt",
            price:1090,
            oldPrice:1390,
            rating:4.8,
            reviews:0,
            sold:0,
            stock:10,
            image:"assets/categories/shirt.jpeg",
            images:[
                "assets/categories/shirt.jpeg"
            ],
            description:"Premium dobby textured fabric with breathable cotton-blend comfort. Added spandex for stretch and mobility. Structured collar with collar stand. Durable button fastening. Smart casual versatile design. Lightweight yet structured feel.",
            shortDescription:"Premium dobby textured fabric with breathable cotton-blend comfort and a clean smart casual look.",
            sizes:["S","M","L","XL","XXL"],
            colors:[
                {name:"Blue",hex:"#8ab6d6",image:"assets/categories/shirt.jpeg"},
                {name:"Black",hex:"#111111"}
            ]
        },
        {
            id:"demo-drop-shoulder",
            name:"Mens Premium Drop Shoulder T-Shirt – RDSTR",
            category:"drop shoulder",
            price:690,
            oldPrice:990,
            rating:4.7,
            reviews:0,
            sold:0,
            stock:11,
            image:"assets/categories/drop-shoulder.jpeg",
            images:[
                "assets/categories/drop-shoulder.jpeg"
            ],
            description:"The RDSTR Drop Shoulder T-Shirt is crafted for bold, effortless street style. Built from premium lacoste fabric with a relaxed drop shoulder silhouette.",
            shortDescription:"Premium drop shoulder t-shirt with relaxed fit and confident streetwear styling.",
            sizes:["S","M","L","XL","XXL"]
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
    selectedSize = "";
    selectedColor = "";
    quantity = 1;

    const sizes = getProductSizes(product);

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
        productRating.textContent = `${rating.toFixed(1)} (${reviews} Reviews)`;
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
            ? `Only ${stock} items left!`
            : "This product is currently out of stock.";
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
    renderSizeChart(product);
    renderRelated(product);
    syncWishlistButton();
    updateQuantity();
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

    images.slice(0,4).forEach((img,index)=>{
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
            "";

        const button = document.createElement("button");
        button.type = "button";
        button.className = index === 0 ? "color-pill active" : "color-pill";
        button.dataset.color = colorName;

        button.innerHTML = `
            <span class="color-dot" style="background:${colorHex};"></span>
        `;

        button.addEventListener("click",()=>{
            colorList.querySelectorAll(".color-pill").forEach(item=>{
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
    selectedSize = "";

    sizes.forEach(size=>{
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.size = size;
        button.textContent = size;
        button.className = "";

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

function renderSizeChart(product){
    /*
        Size chart image is static in HTML.
        JS will not overwrite it.
    */
    return;
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
        const stock = currentProduct ? getStock(currentProduct) : 99;

        if(quantity < Math.max(stock,1)){
            quantity++;
        }

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
        size:selectedSize,
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
            String(item.size || "") === String(product.size || "") &&
            String(item.color || "") === String(product.color || "")
        );

        if(existing){
            existing.quantity =
                Number(existing.quantity || 1) +
                Number(product.quantity || 1);
        }
        else{
            cart.push(product);
        }

        saveCart(cart);
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
        if(!selectedSize){
            showSizeRequiredPopup();
            return;
        }

        addProductToCart(true);

        addToCartBtn.innerHTML = `
            <i data-lucide="check"></i>
            <span>Added</span>
        `;

        refreshLucide();

        setTimeout(()=>{
            addToCartBtn.innerHTML = `
                <i data-lucide="shopping-cart"></i>
                <span>Add to Cart</span>
            `;

            refreshLucide();
        },900);
    });
}

if(buyNowBtn){
    buyNowBtn.addEventListener("click",()=>{
        if(!selectedSize){
            showSizeRequiredPopup();
            return;
        }

        addProductToCart(false);
        window.location.href = "../checkout/index.html";
    });
}


/*=========================================================
    SIZE REQUIRED POPUP
=========================================================*/

function showSizeRequiredPopup(){
    let popup = document.querySelector(".size-required-popup");

    if(!popup){
        popup = document.createElement("div");
        popup.className = "size-required-popup";

        popup.innerHTML = `
            <div class="size-required-box">
                <button type="button" class="size-required-close" aria-label="Close">×</button>

                <div class="size-required-icon">
                    <i data-lucide="ruler"></i>
                </div>

                <h3>Select Your Size</h3>
                <p>Please choose a size before adding this product to cart.</p>

                <button type="button" class="size-required-ok">
                    Choose Size
                </button>
            </div>
        `;

        document.body.appendChild(popup);
    }

    popup.classList.add("active");

    if(window.lucide){
        lucide.createIcons();
    }

    const closeBtn = popup.querySelector(".size-required-close");
    const okBtn = popup.querySelector(".size-required-ok");

    if(closeBtn){
        closeBtn.onclick = closeSizeRequiredPopup;
    }

    if(okBtn){
        okBtn.onclick = ()=>{
            closeSizeRequiredPopup();

            if(sizeOptions){
                sizeOptions.scrollIntoView({
                    behavior:"smooth",
                    block:"center"
                });
            }
        };
    }

    popup.onclick = event=>{
        if(event.target === popup){
            closeSizeRequiredPopup();
        }
    };
}

function closeSizeRequiredPopup(){
    const popup = document.querySelector(".size-required-popup");

    if(popup){
        popup.classList.remove("active");
    }
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

        saveWishlist(wishlist);
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
        else if(navigator.clipboard){
            await navigator.clipboard.writeText(window.location.href);
        }
    });
}


/*=========================================================
    TABS + SIZE CHART SCROLL
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
        closeSizeRequiredPopup();
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
            const aSame =
                String(a.category || "").toLowerCase() === currentCategory
                ? 1
                : 0;

            const bSame =
                String(b.category || "").toLowerCase() === currentCategory
                ? 1
                : 0;

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
        if(relatedSection){
            relatedSection.style.display = "none";
        }

        return;
    }

    if(relatedSection){
        relatedSection.style.display = "block";
    }

    items.forEach(item=>{
        const id = item.id || item.docId || "";
        const imageRaw =
            item.image ||
            item.imageUrl ||
            item.thumbnail ||
            item.mainImage ||
            item.frontImage ||
            item.image1 ||
            (Array.isArray(item.images) ? item.images[0] : "");

        const image = getImagePath(imageRaw);
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
            image:imageRaw,
            category,
            quantity:1
        });

        card.innerHTML = `
            <button type="button" class="related-heart-btn ${isWishlisted(id) ? "active" : ""}" data-id="${id}" aria-label="Wishlist">
                <i data-lucide="heart"></i>
            </button>

            <a href="${getProductLink(id)}" class="related-img">
                <img
                    src="${image}"
                    alt="${name}"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                >
            </a>

            <div class="related-info">
                <p class="related-category">${category}</p>
                <h3>${name}</h3>

                <p class="related-price">
                    <strong>${money(price)}</strong>
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

    if(!relatedHeartBtn){
        return;
    }

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

    saveWishlist(wishlist);
    relatedHeartBtn.classList.toggle("active");
    updateHeaderCounts();
    refreshLucide();
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

        window.location.href =
            `../shop/index.html?search=${encodeURIComponent(query)}`;
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

        window.location.href =
            `../shop/index.html?search=${encodeURIComponent(query)}`;
    });
}


/*=========================================================
    ACCOUNT ICON CLEANER
=========================================================*/

function cleanAccountIcon(){
    const accountBtn = document.querySelector(".account-btn");

    if(!accountBtn){
        return;
    }

    [...accountBtn.childNodes].forEach(node=>{
        if(node.nodeType === Node.TEXT_NODE){
            node.remove();
        }
    });

    accountBtn.querySelectorAll("small,p,strong,em").forEach(el=>{
        el.remove();
    });

    let wrap = accountBtn.querySelector(".header-user-photo-wrap");

    if(!wrap){
        wrap = document.createElement("span");
        wrap.className = "header-user-photo-wrap";
        accountBtn.prepend(wrap);
    }

    const userPhoto =
        localStorage.getItem("taqdeerUserPhoto") ||
        localStorage.getItem("userPhoto") ||
        "";

    if(userPhoto && !wrap.querySelector("img")){
        wrap.innerHTML = `<img class="header-user-photo" src="${userPhoto}" alt="Profile">`;
    }
    else if(!wrap.innerHTML.trim()){
        wrap.innerHTML = `<i data-lucide="user" class="header-user-icon"></i>`;
    }

    refreshLucide();
}

if(window.firebase && firebase.auth){
    firebase.auth().onAuthStateChanged(user=>{
        const accountBtn = document.querySelector(".account-btn");

        if(!accountBtn){
            return;
        }

        const wrap =
            accountBtn.querySelector(".header-user-photo-wrap") ||
            document.createElement("span");

        wrap.className = "header-user-photo-wrap";

        if(!accountBtn.contains(wrap)){
            accountBtn.prepend(wrap);
        }

        if(user && user.photoURL){
            wrap.innerHTML = `
                <img class="header-user-photo" src="${user.photoURL}" alt="Profile">
            `;
        }
        else{
            wrap.innerHTML = `
                <i data-lucide="user" class="header-user-icon"></i>
            `;
        }

        cleanAccountIcon();
    });
}
else{
    cleanAccountIcon();
}


/*=========================================================
    BUY NOW ATTENTION HELPER
=========================================================*/

function startBuyNowAttention(){
    if(!buyNowBtn){
        return;
    }

    buyNowBtn.classList.add("buy-now-attention");
}

startBuyNowAttention();


/*=========================================================
    INIT
=========================================================*/

window.addEventListener("cartUpdated",updateHeaderCounts);
window.addEventListener("wishlistUpdated",updateHeaderCounts);
window.addEventListener("storage",updateHeaderCounts);

updateHeaderCounts();
updateQuantity();
cleanAccountIcon();
loadProduct();
refreshLucide();

window.TaqdeerProductDetails = {
    refresh:loadProduct,
    addToCart:addProductToCart,
    openCartDrawer
};

});