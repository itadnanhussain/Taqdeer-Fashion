/*=========================================================
                TAQDEER FASHION
                HOME PAGE SCRIPT FINAL v2
                DYNAMIC PRODUCT SYNC
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


/*=========================================================
            PAGE LOADER
=========================================================*/

const loader =
document.querySelector(".page-loader");

if(loader){

    window.addEventListener("load",()=>{

        setTimeout(()=>{

            loader.style.opacity = "0";

            setTimeout(()=>{

                loader.remove();

            },500);

        },500);

    });

}





/*=========================================================
            HERO SLIDER READY
=========================================================*/

const heroSlides =
document.querySelectorAll(".hero-slide");

const heroDots =
document.querySelectorAll(".hero-dot");

let currentSlide = 0;


function showSlide(index){

    if(!heroSlides.length){
        return;
    }

    heroSlides.forEach(slide=>{
        slide.classList.remove("active");
    });

    heroDots.forEach(dot=>{
        dot.classList.remove("active");
    });

    heroSlides[index].classList.add("active");

    if(heroDots[index]){
        heroDots[index].classList.add("active");
    }

}


function nextSlide(){

    currentSlide++;

    if(currentSlide >= heroSlides.length){
        currentSlide = 0;
    }

    showSlide(currentSlide);

}


if(heroSlides.length > 1){

    setInterval(nextSlide,5000);

}





/*=========================================================
            SCROLL REVEAL
=========================================================*/

const revealElements =
document.querySelectorAll(".reveal");

if(revealElements.length){

    const revealObserver =
    new IntersectionObserver(
        (entries)=>{

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    entry.target.classList.add("active");

                }

            });

        },
        {
            threshold:.15
        }
    );

    revealElements.forEach(element=>{
        revealObserver.observe(element);
    });

}





/*=========================================================
            BACK TO TOP
=========================================================*/

const backTop =
document.querySelector(".back-top");

if(backTop){

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 500){

            backTop.classList.add("active");

        }

        else{

            backTop.classList.remove("active");

        }

    });


    backTop.addEventListener("click",()=>{

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    });

}





/*=========================================================
            NUMBER COUNTER
=========================================================*/

const counters =
document.querySelectorAll(".counter");

counters.forEach(counter=>{

    const target =
    Number(counter.dataset.count || 0);

    let count = 0;

    const updateCounter = ()=>{

        const increment =
        Math.ceil(target / 100);

        count += increment;

        if(count < target){

            counter.innerText = count;

            requestAnimationFrame(updateCounter);

        }

        else{

            counter.innerText = target + "+";

        }

    };

    updateCounter();

});





/*=========================================================
            CATEGORY HOVER
=========================================================*/

const categoryCards =
document.querySelectorAll(".category-card");

categoryCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.classList.add("hovered");

    });

    card.addEventListener("mouseleave",()=>{

        card.classList.remove("hovered");

    });

});





/*=========================================================
            PRODUCT HELPERS
=========================================================*/

function getAssetPath(path){

    const fallback =
    "assets/placeholders/product.jpg";

    if(!path){
        path = fallback;
    }

    if(
        path.startsWith("http") ||
        path.startsWith("data:")
    ){
        return path;
    }

    if(path.startsWith("assets/")){
        return path;
    }

    return fallback;

}



function money(value){

    return "৳" + Number(value || 0).toLocaleString();

}



function getProductDetailsPath(productId){

    return `pages/product-details/index.html?id=${productId}`;

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
            CREATE HOME PRODUCT CARD
=========================================================*/

function createHomeProductCard(product){

    const productLink =
    getProductDetailsPath(product.id);

    const image =
    getAssetPath(product.image);

    const stockInfo =
    getStockInfo(product);

    const badge =
    product.badge && product.badge.trim()
    ?
    product.badge.trim()
    :
    "";

    const card =
    document.createElement("div");

    card.className =
    "product-card";

    card.innerHTML = `

        <div class="product-image">

            <a href="${productLink}">
                <img
                src="${image}"
                alt="${product.name || "Product"}"
                class="home-product-img">
            </a>

            <button
            type="button"
            class="wishlist-btn"
            data-id="${product.id}">
                <i data-lucide="heart"></i>
            </button>

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

        </div>


        <div class="product-info">

            <p class="product-category">
                ${product.category || "Fashion"}
            </p>

            <h3 class="product-name">
                <a href="${productLink}">
                    ${product.name || "Product Name"}
                </a>
            </h3>

            <div class="product-rating">
                <span class="rating-stars">★★★★★</span>
                <span>${product.rating || "4.8"}</span>
            </div>

            <div class="product-bottom">

                <h4>
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


    const img =
    card.querySelector(".home-product-img");

    img.onerror = function(){

        this.onerror = null;
        this.src = "assets/placeholders/product.jpg";

    };


    const addCartBtn =
    card.querySelector(".add-cart-btn");

    addCartBtn.addEventListener("click",(event)=>{

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

            addCartBtn.innerText = "Added";

            setTimeout(()=>{

                addCartBtn.innerText = "Add To Cart";

            },900);

        }

        else{

            console.error("Cart service missing");

        }

    });


    const wishlistBtn =
    card.querySelector(".wishlist-btn");

    wishlistBtn.addEventListener("click",(event)=>{

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
            RENDER PRODUCT GRID
=========================================================*/

function renderProductGrid(container, products, emptyText){

    if(!container){
        return;
    }

    container.innerHTML = "";

    if(!products || !products.length){

        container.innerHTML = `
            <div class="home-empty-products">
                <h3>${emptyText || "No products found"}</h3>
                <p>Add products from admin panel first.</p>
            </div>
        `;

        return;

    }

    products.forEach(product=>{

        container.appendChild(
            createHomeProductCard(product)
        );

    });

    if(window.lucide){
        lucide.createIcons();
    }

}





/*=========================================================
            LOAD HOME PRODUCTS FROM FIREBASE
=========================================================*/

async function loadHomeProducts(){

    const latestGrid =
    document.querySelector(".new-arrival-section .product-grid");

    const bestGrid =
    document.querySelector(".best-seller-section .product-grid");

    try{

        if(latestGrid){

            latestGrid.innerHTML = `
                <div class="home-empty-products">
                    <h3>Loading products...</h3>
                    <p>Please wait a moment.</p>
                </div>
            `;

        }

        if(bestGrid){

            bestGrid.innerHTML = `
                <div class="home-empty-products">
                    <h3>Loading best sellers...</h3>
                    <p>Please wait a moment.</p>
                </div>
            `;

        }


        if(!window.productService){

            console.error("Product service missing");

            return;

        }


        const products =
        await window.productService.getProducts();


        const activeProducts =
        products.filter(product=>
            Number(product.stock || 0) > 0
        );


        const latestProducts =
        [...activeProducts]
        .sort((a,b)=>{

            const dateA =
            a.createdAt?.toDate
            ?
            a.createdAt.toDate()
            :
            new Date(a.createdAt || 0);

            const dateB =
            b.createdAt?.toDate
            ?
            b.createdAt.toDate()
            :
            new Date(b.createdAt || 0);

            return dateB - dateA;

        })
        .slice(0,4);


        const featuredProducts =
        activeProducts
        .filter(product=>
            product.featured === true ||
            product.isFeatured === true ||
            product.type === "featured" ||
            product.badge?.toLowerCase() === "best seller" ||
            product.badge?.toLowerCase() === "premium"
        );


        const bestProducts =
        (
            featuredProducts.length
            ?
            featuredProducts
            :
            [...activeProducts]
            .sort((a,b)=>
                Number(b.rating || 0) -
                Number(a.rating || 0)
            )
        )
        .slice(0,4);


        renderProductGrid(
            latestGrid,
            latestProducts,
            "No latest products found"
        );


        renderProductGrid(
            bestGrid,
            bestProducts,
            "No best seller products found"
        );


        updateHeroMiniProducts(activeProducts.slice(0,3));

    }

    catch(error){

        console.error("Home product load error:",error);

        renderProductGrid(
            latestGrid,
            [],
            "Products could not load"
        );

        renderProductGrid(
            bestGrid,
            [],
            "Products could not load"
        );

    }

}





/*=========================================================
            UPDATE HERO MINI PRODUCTS
=========================================================*/

function updateHeroMiniProducts(products){

    const miniBox =
    document.querySelector(".hero-mini-products");

    if(!miniBox || !products.length){
        return;
    }

    miniBox.innerHTML = "";

    products.forEach(product=>{

        const img =
        document.createElement("img");

        img.src =
        getAssetPath(product.image);

        img.alt =
        product.name || "Product";

        img.onerror = function(){

            this.onerror = null;
            this.src = "assets/placeholders/product.jpg";

        };

        miniBox.appendChild(img);

    });

}





/*=========================================================
            GLOBAL HOME API
=========================================================*/

window.TaqdeerHome = {

    refreshProducts(){
        loadHomeProducts();
    },

    refreshCategories(){
        console.log("Categories refresh ready");
    }

};





/*=========================================================
            INIT
=========================================================*/

loadHomeProducts();


});