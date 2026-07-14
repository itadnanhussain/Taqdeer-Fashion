/*=========================================================
            TAQDEER FASHION
            PRODUCT DETAILS PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{





/*=========================================================
        DOM
=========================================================*/

const mainImage =
document.getElementById("main-product-image");

const thumbnails =
document.getElementById("product-thumbnails");

const productTitle =
document.getElementById("product-title");

const productPrice =
document.getElementById("product-price");

const productOldPrice =
document.getElementById("product-old-price");

const productOfferBadge =
document.getElementById("product-offer-badge");

const productDiscountBadge =
document.getElementById("product-discount-badge");

const productRating =
document.getElementById("product-rating");

const productSold =
document.getElementById("product-sold");

const breadcrumbCategory =
document.getElementById("breadcrumb-category");

const shortDescription =
document.getElementById("product-short-description");

const descriptionText =
document.getElementById("product-description-text");

const colorSection =
document.getElementById("color-section");

const colorList =
document.getElementById("color-variant-list");

const qtyMinus =
document.getElementById("qty-minus");

const qtyPlus =
document.getElementById("qty-plus");

const qtyText =
document.getElementById("product-qty");

const addToCartBtn =
document.getElementById("add-to-cart-btn");

const buyNowBtn =
document.getElementById("buy-now-btn");

const stockWarning =
document.getElementById("stock-warning");

const relatedProducts =
document.getElementById("related-products");

const lightbox =
document.getElementById("product-lightbox");

const lightboxImage =
document.getElementById("lightbox-image");

const lightboxClose =
document.getElementById("lightbox-close");

const sizeChartOpen =
document.querySelector(".size-chart-open");

const sizeChartPanel =
document.getElementById("size-chart-panel");

const sizeChartClose =
document.querySelector(".size-chart-close");

const tabButtons =
document.querySelectorAll(".product-tabs button");

const tabContents =
document.querySelectorAll(".tab-content");





/*=========================================================
        STATE
=========================================================*/

let currentProduct = null;

let selectedSize = "M";

let selectedColor = "";

let selectedImage = "";

let quantity = 1;





/*=========================================================
        HELPERS
=========================================================*/

function getProductId(){

    const params =
    new URLSearchParams(window.location.search);

    return params.get("id");

}



function money(value){

    return "৳" + Number(value || 0).toLocaleString();

}



function fallbackImage(){

    return "../../assets/placeholders/product.jpg";

}



function getImagePath(path){

    if(!path){
        return fallbackImage();
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

    return fallbackImage();

}



function setImage(element,path){

    if(!element){
        return;
    }

    element.src =
    getImagePath(path);

    element.onerror = function(){

        this.onerror = null;

        this.src =
        fallbackImage();

    };

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
        "sky blue & white":"#93c5fd"
    };

    const key =
    String(color || "")
    .trim()
    .toLowerCase();

    return map[key] || "#2f3a45";

}



function calculateOffer(price,oldPrice){

    price =
    Number(price || 0);

    oldPrice =
    Number(oldPrice || 0);

    if(!oldPrice || oldPrice <= price){
        return 0;
    }

    return Math.round(
        ((oldPrice - price) / oldPrice) * 100
    );

}



function normalizeImages(product){

    const images = [];

    if(product.image){
        images.push(product.image);
    }

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

            const img =
            color.image ||
            color.photo ||
            color.imageUrl;

            if(img && !images.includes(img)){
                images.push(img);
            }

        });

    }

    return images.length
    ?
    images
    :
    [fallbackImage()];

}





/*=========================================================
        DEMO PRODUCT FALLBACK
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
                "assets/categories/polo.jpeg",
                "assets/categories/panjabi.jpeg"
            ],
            description:"Premium dobby textured fabric with breathable cotton-blend comfort. Designed with structured collar, durable button fastening and smart casual versatile styling for everyday use.",
            shortDescription:"Premium quality casual shirt for everyday comfort and smart modern style.",
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
                },
                {
                    name:"Maroon",
                    hex:"#6f1d2d",
                    image:"assets/categories/panjabi.jpeg"
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
            image:"assets/categories/polo.jpeg",
            description:"Premium polo shirt with soft cotton texture, clean collar finishing and comfortable fit.",
            shortDescription:"Premium polo shirt for smart casual styling.",
            colors:[]
        }
    ];

}





/*=========================================================
        LOAD PRODUCT
=========================================================*/

async function loadProduct(){

    const productId =
    getProductId();

    let product = null;


    try{

        if(window.db && productId){

            const doc =
            await window.db
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

        console.error(
            "Product Firestore Load Error:",
            error
        );

    }


    if(!product){

        const demos =
        getDemoProducts();

        product =
        demos.find(item=>item.id === productId) ||
        demos[0];

    }


    currentProduct =
    product;

    renderProduct(product);

}





/*=========================================================
        RENDER PRODUCT
=========================================================*/

function renderProduct(product){

    const title =
    product.name ||
    product.title ||
    "Product Name";

    const category =
    product.category ||
    "Product";

    const price =
    Number(product.price || 0);

    const oldPrice =
    Number(product.oldPrice || product.comparePrice || product.regularPrice || 0);

    const offer =
    product.discount ||
    calculateOffer(price,oldPrice);

    const rating =
    product.rating || 4.8;

    const sold =
Number(
    product.sold ||
    product.soldCount ||
    product.salesCount ||
    product.totalSold ||
    0
);

    const stock =
    Number(product.stock || product.quantity || 0);

    const images =
    normalizeImages(product);


    selectedImage =
    images[0];


    if(productTitle){
        productTitle.innerText = title;
    }

    if(breadcrumbCategory){
        breadcrumbCategory.innerText = category;
    }

    if(productPrice){
        productPrice.innerText = money(price);
    }

    if(productOldPrice){

        if(oldPrice && oldPrice > price){

            productOldPrice.style.display = "inline";
            productOldPrice.innerText = money(oldPrice);

        }

        else{

            productOldPrice.style.display = "none";

        }

    }

    if(productOfferBadge){

        if(offer > 0){

            productOfferBadge.style.display = "flex";
            productOfferBadge.innerText = `${offer}% OFF`;

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
        productRating.innerText = rating;
    }

    if(productSold){

    productSold.innerText =
    sold > 10
    ?
    `Sold ${sold}+`
    :
    "Sold 0";

}

    if(stockWarning){
        stockWarning.innerText =
        stock > 0
        ?
        `Only ${stock} items left!`
        :
        "Out of stock";
    }


   if(shortDescription){
    shortDescription.style.display = "none";
}

    if(descriptionText){

        descriptionText.innerText =
        product.description ||
        product.details ||
        product.longDescription ||
        "No product description available.";

    }


    setImage(mainImage,images[0]);

    renderThumbnails(images);

    renderColors(product);

    renderRelated(product);

    if(window.lucide){
        lucide.createIcons();
    }

}





/*=========================================================
        THUMBNAILS
=========================================================*/

function renderThumbnails(images){

    if(!thumbnails){
        return;
    }

    thumbnails.innerHTML = "";

    images.slice(0,4).forEach((img,index)=>{

        const button =
        document.createElement("button");

        button.type =
        "button";

        button.className =
        index === 0
        ?
        "product-thumb active"
        :
        "product-thumb";

        button.innerHTML = `
            <img src="${getImagePath(img)}" alt="Product">
        `;

        button.addEventListener("click",()=>{

            document
            .querySelectorAll(".product-thumb")
            .forEach(item=>item.classList.remove("active"));

            button.classList.add("active");

            selectedImage =
            img;

            setImage(mainImage,img);

        });

        thumbnails.appendChild(button);

    });

}





/*=========================================================
        COLOR VARIANTS
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

    if(!Array.isArray(colors) || colors.length === 0){

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
        product.image;

        const button =
        document.createElement("button");

        button.type =
        "button";

        button.className =
        index === 0
        ?
        "color-pill active"
        :
        "color-pill";

        button.dataset.image =
        colorImage || "";

        button.dataset.color =
        colorName;

        button.innerHTML = `
            <img src="${getImagePath(colorImage)}" alt="${colorName}">
            <span class="color-dot" style="background:${colorHex};"></span>
            ${colorName}
        `;

        button.addEventListener("click",()=>{

            document
            .querySelectorAll(".color-pill")
            .forEach(item=>item.classList.remove("active"));

            button.classList.add("active");

            selectedColor =
            colorName;

            if(colorImage){

                selectedImage =
                colorImage;

                setImage(mainImage,colorImage);

            }

        });

        colorList.appendChild(button);


        if(index === 0){

            selectedColor =
            colorName;

        }

    });

}





/*=========================================================
        SIZE SELECT
=========================================================*/

document.querySelectorAll(".size-options button").forEach(button=>{

    button.addEventListener("click",()=>{

        document
        .querySelectorAll(".size-options button")
        .forEach(item=>item.classList.remove("active"));

        button.classList.add("active");

        selectedSize =
        button.innerText.trim();

    });

});





/*=========================================================
        QUANTITY
=========================================================*/

function updateQuantity(){

    if(qtyText){
        qtyText.innerText = quantity;
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
        ADD TO CART / BUY NOW
=========================================================*/

function buildCartProduct(){

    if(!currentProduct){
        return null;
    }

    return {
        id: currentProduct.id,
        name: currentProduct.name || currentProduct.title || "Product",
        price: Number(currentProduct.price || 0),
        oldPrice: Number(currentProduct.oldPrice || currentProduct.comparePrice || currentProduct.regularPrice || 0),
        image: selectedImage || currentProduct.image || "",
        category: currentProduct.category || "Product",
        size: selectedSize || "M",
        color: selectedColor || "",
        quantity: quantity,
        stock: Number(currentProduct.stock || currentProduct.quantity || 0)
    };

}



function addProductToCart(){

    const product =
    buildCartProduct();

    if(!product){
        return;
    }

    if(window.CartService && window.CartService.addToCart){

        window.CartService.addToCart(product);

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        

    }

    else{

        const cart =
        JSON.parse(
            localStorage.getItem("taqdeerCart")
        ) || [];

        const existing =
        cart.find(item=>
            item.id === product.id &&
            item.size === product.size &&
            item.color === product.color
        );

        if(existing){
            existing.quantity += quantity;
        }
        else{
            cart.push(product);
        }

        localStorage.setItem(
            "taqdeerCart",
            JSON.stringify(cart)
        );

        window.dispatchEvent(
            new Event("cartUpdated")
        );

        

    }

}


if(addToCartBtn){

    addToCartBtn.addEventListener("click",()=>{

        addProductToCart();

    });

}


if(buyNowBtn){

    buyNowBtn.addEventListener("click",()=>{

        addProductToCart();

        window.location.href =
        "../cart/index.html";

    });

}





/*=========================================================
        SIZE CHART
=========================================================*/

if(sizeChartOpen && sizeChartPanel){

    sizeChartOpen.addEventListener("click",()=>{

        sizeChartPanel.scrollIntoView({
            behavior:"smooth",
            block:"center"
        });

    });

}








/*=========================================================
        TABS
=========================================================*/

tabButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const target =
        button.dataset.tab;

        tabButtons.forEach(btn=>
            btn.classList.remove("active")
        );

        tabContents.forEach(content=>
            content.classList.remove("active")
        );

        button.classList.add("active");

        const activeContent =
        document.getElementById(`tab-${target}`);

        if(activeContent){
            activeContent.classList.add("active");
        }

    });

});





/*=========================================================
        IMAGE LIGHTBOX
=========================================================*/

if(mainImage && lightbox && lightboxImage){

    mainImage.addEventListener("click",()=>{

        lightboxImage.src =
        mainImage.src;

        lightbox.classList.add("active");

        document.body.style.overflow =
        "hidden";

    });

}


function closeLightbox(){

    if(!lightbox){
        return;
    }

    lightbox.classList.remove("active");

    document.body.style.overflow =
    "";

}


if(lightboxClose){

    lightboxClose.addEventListener("click",closeLightbox);

}


if(lightbox){

    lightbox.addEventListener("click",(e)=>{

        if(e.target === lightbox){
            closeLightbox();
        }

    });

}


document.addEventListener("keydown",(e)=>{

    if(e.key === "Escape"){
        closeLightbox();
    }

});





/*=========================================================
        RELATED PRODUCTS DEMO
=========================================================*/

async function renderRelated(product){

    if(!relatedProducts){
        return;
    }

    relatedProducts.innerHTML = `
        <div class="related-loading">
            Loading related products...
        </div>
    `;

    let items = [];

    try{

        if(window.db){

            const snapshot =
            await window.db
            .collection("products")
            .limit(8)
            .get();

            snapshot.forEach(doc=>{

                const data = {
                    id: doc.id,
                    ...doc.data()
                };

                if(data.id !== product.id){
                    items.push(data);
                }

            });

        }

    }

    catch(error){

        console.error("Related Products Load Error:",error);

    }


    if(!items.length){

        items =
        getDemoProducts()
        .filter(item=>item.id !== product.id);

    }


    items =
    items
    .filter(item=>item.id !== product.id)
    .slice(0,4);


    relatedProducts.innerHTML = "";


    if(!items.length){

        relatedProducts.innerHTML = `
            <div class="related-empty">
                No related products found.
            </div>
        `;

        return;

    }


    items.forEach(item=>{

        const id =
        item.id;

        const image =
        getImagePath(item.image || item.mainImage);

        const price =
        Number(item.price || 0);

        const oldPrice =
        Number(item.oldPrice || item.comparePrice || item.regularPrice || 0);

        const category =
        item.category || "Product";

        const card =
        document.createElement("article");

        card.className =
        "related-card";

        card.innerHTML = `
            <button type="button" class="related-heart-btn" data-id="${id}">
                <i data-lucide="heart"></i>
            </button>

            <a href="index.html?id=${id}" class="related-img">
                <img
                    src="${image}"
                    alt="${item.name || "Product"}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">
            </a>

            <div class="related-info">
                <span>${category}</span>

                <h3>${item.name || item.title || "Product"}</h3>

                <div class="related-price">
                    <strong>${money(price)}</strong>
                    ${
                        oldPrice > price
                        ?
                        `<del>${money(oldPrice)}</del>`
                        :
                        ""
                    }
                </div>

                <div class="related-actions">
                    <button type="button" class="related-add-cart" data-id="${id}">
                        <i data-lucide="shopping-cart"></i>
                        Add to Cart
                    </button>

                    <a href="index.html?id=${id}">
                        View
                    </a>
                </div>
            </div>
        `;

        card.dataset.product =
        JSON.stringify({
            id,
            name:item.name || item.title || "Product",
            price,
            oldPrice,
            image:item.image || item.mainImage || "",
            category,
            quantity:1
        });

        relatedProducts.appendChild(card);

    });


    if(window.lucide){
        lucide.createIcons();
    }

}





/*=========================================================
        WISHLIST BUTTON
=========================================================*/

const wishlistBtn =
document.querySelector(".wishlist-product-btn");

if(wishlistBtn){

    wishlistBtn.addEventListener("click",()=>{

        if(!currentProduct){
            return;
        }

        const item = {
            id:currentProduct.id,
            name:currentProduct.name || currentProduct.title,
            price:Number(currentProduct.price || 0),
            image:selectedImage || currentProduct.image,
            category:currentProduct.category || "Product"
        };

        if(window.WishlistService && window.WishlistService.addToWishlist){

            window.WishlistService.addToWishlist(item);

        }

        else{

            const wishlist =
            JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];

            const exists =
            wishlist.find(product=>product.id === item.id);

            if(!exists){
                wishlist.push(item);
            }

            localStorage.setItem(
                "taqdeerWishlist",
                JSON.stringify(wishlist)
            );

        }

        window.dispatchEvent(
            new Event("wishlistUpdated")
        );

        wishlistBtn.classList.add("active");

        alert("Product added to wishlist.");

    });

}

document.addEventListener("click",(e)=>{

    const relatedAddBtn =
    e.target.closest(".related-add-cart");

    if(relatedAddBtn){

        const card =
        relatedAddBtn.closest(".related-card");

        if(!card || !card.dataset.product){
            return;
        }

        const product =
        JSON.parse(card.dataset.product);

        const cartItem = {
            ...product,
            size:"M",
            color:"",
            quantity:1
        };

        if(window.CartService && window.CartService.addToCart){

            window.CartService.addToCart(cartItem);

        }

        else{

            const cart =
            JSON.parse(localStorage.getItem("taqdeerCart")) || [];

            const existing =
            cart.find(item=>item.id === cartItem.id);

            if(existing){
                existing.quantity = Number(existing.quantity || 1) + 1;
            }
            else{
                cart.push(cartItem);
            }

            localStorage.setItem("taqdeerCart",JSON.stringify(cart));

        }

        window.dispatchEvent(new Event("cartUpdated"));

        

        return;

    }


    const relatedHeartBtn =
    e.target.closest(".related-heart-btn");

    if(relatedHeartBtn){

        relatedHeartBtn.classList.toggle("active");

        const card =
        relatedHeartBtn.closest(".related-card");

        if(!card || !card.dataset.product){
            return;
        }

        const product =
        JSON.parse(card.dataset.product);

        const wishlist =
        JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];

        const exists =
        wishlist.some(item=>item.id === product.id);

        if(!exists){
            wishlist.push(product);
            localStorage.setItem("taqdeerWishlist",JSON.stringify(wishlist));
        }

        window.dispatchEvent(new Event("wishlistUpdated"));

        return;

    }

});



/*=========================================================
        INIT
=========================================================*/

loadProduct();

updateQuantity();

if(window.lucide){
    lucide.createIcons();
}


});