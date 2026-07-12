/*=========================================================
            TAQDEER FASHION
            PRODUCT CARD COMPONENT FINAL v2
=========================================================*/

"use strict";


/*=========================================================
            PATH HELPERS
=========================================================*/

function getProductDetailsPath(productId){

    const isInsidePages =
    window.location.pathname.includes("/pages/");

    const basePath =
    isInsidePages
    ?
    "../product-details/index.html"
    :
    "pages/product-details/index.html";

    return `${basePath}?id=${productId}`;

}



function getAssetPath(path){

    const fallback =
    "assets/placeholders/product.jpg";

    if(!path){
        path = fallback;
    }

    if(
        path.startsWith("http") ||
        path.startsWith("data:") ||
        path.startsWith("../") ||
        path.startsWith("../../")
    ){
        return path;
    }

    const isInsidePages =
    window.location.pathname.includes("/pages/");

    if(path.startsWith("assets/")){
        return isInsidePages ? `../../${path}` : path;
    }

    return isInsidePages ? `../../${fallback}` : fallback;

}



function money(value){

    return "৳" + Number(value || 0).toLocaleString();

}



function getStockInfo(product){

    const stock =
    Number(product.stock || 0);

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



/*=========================================================
            CREATE PRODUCT CARD
=========================================================*/

function createProductCard(product){

    const productLink =
    getProductDetailsPath(product.id);

    const productImage =
    getAssetPath(product.image);

    const stockInfo =
    getStockInfo(product);

    const badge =
    product.badge && product.badge.trim()
    ?
    product.badge.trim()
    :
    "";

    const rating =
    product.rating || "4.8";


    const card =
    document.createElement("div");

    card.className =
    "product-card";


    card.innerHTML = `

        <div class="product-image">

            <a href="${productLink}" class="product-link">

                <img
                src="${productImage}"
                alt="${product.name || "Product"}"
                class="product-img">

            </a>


            ${
                badge
                ?
                `<span class="product-badge">${badge}</span>`
                :
                ""
            }


            <span class="product-stock ${stockInfo.className}">
                ${stockInfo.text}
            </span>


            <button
            type="button"
            class="wishlist-btn"
            data-id="${product.id}">

                <i data-lucide="heart"></i>

            </button>

        </div>


        <div class="product-info">

            <p class="product-category">
                ${product.category || "Fashion"}
            </p>


            <a href="${productLink}" class="product-title-link">

                <h3 class="product-name">
                    ${product.name || "Product Name"}
                </h3>

            </a>


            <div class="product-rating">

                <span class="rating-stars">
                    ★★★★★
                </span>

                <span class="rating-number">
                    ${rating}
                </span>

            </div>


            <div class="product-bottom">

                <h4 class="product-price">
                    ${money(product.price)}
                </h4>


                <button
                type="button"
                class="add-cart-btn"
                data-id="${product.id}"
                ${stockInfo.disabled ? "disabled" : ""}>

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



    /*==============================
            IMAGE FALLBACK
    ==============================*/

    const image =
    card.querySelector(".product-img");

    image.onerror = function(){

        this.onerror = null;

        this.src =
        getAssetPath("assets/placeholders/product.jpg");

    };



    /*==============================
            ADD TO CART
    ==============================*/

    const addCartBtn =
    card.querySelector(".add-cart-btn");

    addCartBtn.addEventListener("click", (event)=>{

        event.preventDefault();
        event.stopPropagation();

        if(stockInfo.disabled){
            return;
        }

        const cartService =
        window.CartService ||
        window.cartService;

        if(cartService && cartService.addToCart){

            cartService.addToCart({
                ...product,
                quantity:1
            });

            if(cartService.updateCartCount){
                cartService.updateCartCount();
            }

            addCartBtn.innerText = "Added";

            setTimeout(()=>{
                addCartBtn.innerText = "Add To Cart";
            },900);

        }

        else{

            console.error("Cart service missing");

        }

    });



    /*==============================
            WISHLIST
    ==============================*/

    const wishlistBtn =
    card.querySelector(".wishlist-btn");

    wishlistBtn.addEventListener("click", (event)=>{

        event.preventDefault();
        event.stopPropagation();

        const wishlistService =
        window.WishlistService ||
        window.wishlistService;

        if(
            wishlistService &&
            wishlistService.toggleWishlist
        ){

            wishlistService.toggleWishlist(product);

        }

        wishlistBtn.classList.toggle("active");

    });


    return card;

}



/*=========================================================
            RENDER PRODUCTS
=========================================================*/

function renderProducts(container, products){

    if(!container){
        return;
    }

    container.innerHTML = "";

    if(!products || products.length === 0){

        container.innerHTML = `
            <div class="empty-products">
                <h3>No products found</h3>
                <p>Please add products first.</p>
            </div>
        `;

        return;

    }

    products.forEach(product=>{

        container.appendChild(
            createProductCard(product)
        );

    });

    if(window.lucide){
        lucide.createIcons();
    }

}



/*=========================================================
            GLOBAL EXPORT
=========================================================*/

window.productCard = {
    createProductCard,
    renderProducts
};

window.createProductCard =
createProductCard;