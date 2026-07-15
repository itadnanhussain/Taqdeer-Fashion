/*=========================================================
    TAQDEER FASHION
    CLEAN GLOBAL CART DRAWER
=========================================================*/

"use strict";

(function(){

    const CART_KEY = "taqdeerCart";

    let recommendedProducts = [];
    let autoSlideTimer = null;

    const byId = id =>
        document.getElementById(id);

    const query = selector =>
        document.querySelector(selector);


    /*=====================================================
        PATH HELPERS
    =====================================================*/

    function isInsidePagesFolder(){

        return window.location.pathname.includes("/pages/");

    }


    function resolvePagePath(pathFromPages){

        return isInsidePagesFolder()
            ? pathFromPages
            : "pages/" + pathFromPages.replace("../", "");

    }


    function fallbackImage(){

        return isInsidePagesFolder()
            ? "../../assets/placeholders/product.jpg"
            : "assets/placeholders/product.jpg";

    }


    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }


    /*=====================================================
        CART STORAGE
    =====================================================*/

    function getCart(){

        const service =
            window.CartService ||
            window.cartService;


        if(
            service &&
            typeof service.getCart === "function"
        ){

            const cart = service.getCart();

            return Array.isArray(cart)
                ? cart
                : [];

        }


        try{

            const savedCart = JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

            return Array.isArray(savedCart)
                ? savedCart
                : [];

        }catch(error){

            console.error("Cart read error:", error);

            return [];

        }

    }


    function saveCart(cart){

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

        window.dispatchEvent(
            new CustomEvent("cartUpdated")
        );

    }


    /*=====================================================
        PRODUCT HELPERS
    =====================================================*/

    function getProductId(product){

        return String(
            product?.id ||
            product?.docId ||
            product?.productId ||
            ""
        );

    }


    function getProductPrice(product){

        return Number(
            product?.price ??
            product?.salePrice ??
            product?.finalPrice ??
            product?.discountPrice ??
            0
        );

    }


    function getProductImage(product){

        const image =
            product?.image ||
            product?.imageUrl ||
            product?.thumbnail ||
            product?.mainImage ||
            (
                Array.isArray(product?.images)
                    ? product.images[0]
                    : ""
            );


        if(!image){

            return fallbackImage();

        }


        if(
            image.startsWith("http") ||
            image.startsWith("data:") ||
            image.startsWith("../")
        ){

            return image;

        }


        if(image.startsWith("assets/")){

            return isInsidePagesFolder()
                ? "../../" + image
                : image;

        }


        return image;

    }


    function removeStraySparkles(){

        document
            .querySelectorAll(
                `
                .add-cart-float-popup,
                .add-cart-popup-icon,
                .add-cart-popup-check,
                .add-cart-popup-spark,
                [class*="add-cart"][class*="spark"]
                `
            )
            .forEach(element => {

                element.remove();

            });

    }
        /*=====================================================
        CART DRAWER RENDER
    =====================================================*/

    function renderDrawer(){

        const body =
            byId("tf-cart-drawer-items");

        const totalElement =
            byId("tf-cart-drawer-total");

        const checkoutLink =
            byId("tf-drawer-checkout");

        const viewCartLink =
            byId("tf-drawer-view-cart");


        if(!body){

            return;

        }


        if(checkoutLink){

            checkoutLink.href =
                resolvePagePath("../checkout/index.html");

        }


        if(viewCartLink){

            viewCartLink.href =
                resolvePagePath("../cart/index.html");

        }


        const cart = getCart();


        const subtotal = cart.reduce(
            (sum, item) => {

                const price =
                    Number(item.price || 0);

                const quantity =
                    Number(item.quantity || 1);

                return sum + price * quantity;

            },
            0
        );


        if(totalElement){

            totalElement.textContent =
                money(subtotal);

        }


        if(!cart.length){

            body.innerHTML = `
                <div class="tf-drawer-empty">

                    <h4>Your cart is empty</h4>

                    <p>
                        Add some products first.
                    </p>

                </div>
            `;

            return;

        }


        body.innerHTML = cart
            .map((item, index) => {

                const quantity =
                    Number(item.quantity || 1);

                const lineTotal =
                    Number(item.price || 0) *
                    quantity;


                const itemKey =
                    encodeURIComponent(
                        [
                            item.id || "",
                            item.size || "",
                            item.color || "",
                            index
                        ].join("__")
                    );


                return `
                    <article class="tf-drawer-item">

                        <div class="tf-drawer-item-img">

                            <img
                                src="${getProductImage(item)}"
                                alt="${item.name || "Product"}"
                                onerror="
                                    this.onerror=null;
                                    this.src='${fallbackImage()}';
                                "
                            >

                        </div>


                        <div class="tf-drawer-item-info">

                            <h4>
                                ${item.name || "Product"}
                            </h4>


                            <p>
                                ${item.category || "Fashion"}

                                ${
                                    item.size
                                        ? " • Size: " + item.size
                                        : ""
                                }

                                ${
                                    item.color
                                        ? " • Color: " + item.color
                                        : ""
                                }
                            </p>


                            <strong>
                                ${money(lineTotal)}
                            </strong>


                            <div class="tf-drawer-item-actions">

                                <div class="tf-drawer-qty">

                                    <button
                                        type="button"
                                        data-action="minus"
                                        data-key="${itemKey}"
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>


                                    <span>
                                        ${quantity}
                                    </span>


                                    <button
                                        type="button"
                                        data-action="plus"
                                        data-key="${itemKey}"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>

                                </div>


                                <button
    type="button"
    class="tf-drawer-remove"
    data-action="remove"
    data-key="${itemKey}"
    aria-label="Remove product"
>
    <i data-lucide="trash-2"></i>
</button>

                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");

    }


    function getCartIndexFromKey(key){

        const decodedKey =
            decodeURIComponent(key || "");

        const keyParts =
            decodedKey.split("__");

        const index =
            Number(keyParts[3]);


        return Number.isInteger(index)
            ? index
            : -1;

    }


    /*=====================================================
        LOAD PRODUCTS
    =====================================================*/

    async function fetchProducts(){

        const service =
            window.productService ||
            window.ProductService;


        if(
            service &&
            typeof service.getProducts === "function"
        ){

            const products =
                await service.getProducts();

            return Array.isArray(products)
                ? products
                : [];

        }


        if(
            window.db &&
            typeof window.db.collection === "function"
        ){

            const snapshot =
                await window.db
                    .collection("products")
                    .get();


            return snapshot.docs.map(doc => ({

                id:doc.id,

                ...doc.data()

            }));

        }


        return [];

    }


    /*=====================================================
        RECOMMENDATION PRODUCTS
    =====================================================*/

    async function loadRecommendations(){

        const section =
            query(".tf-drawer-recommendations");

        const track =
            byId("tfDrawerRecommendationTrack");


        if(!section || !track){

            return;

        }


        try{

            const products =
                await fetchProducts();


            const cartIds = new Set(

                getCart().map(item =>
                    String(item.id)
                )

            );


            recommendedProducts = products
                .filter(product => {

                    const id =
                        getProductId(product);

                    return (
                        id &&
                        !cartIds.has(id)
                    );

                })
                .slice(0, 8);


            if(!recommendedProducts.length){

                section.classList.remove("visible");

                track.innerHTML = "";

                return;

            }


            track.innerHTML = recommendedProducts
                .map(product => {

                    const id =
                        getProductId(product);

                    const name =
                        product.name ||
                        product.title ||
                        "Product";

                    const price =
                        getProductPrice(product);

                    const image =
                        getProductImage(product);


                    return `
                        <article
                            class="tf-drawer-recommend-card"
                        >

                            <img
                                src="${image}"
                                alt="${name}"
                                onerror="
                                    this.onerror=null;
                                    this.src='${fallbackImage()}';
                                "
                            >


                            <div
                                class="tf-drawer-recommend-info"
                            >

                                <h5>
                                    ${name}
                                </h5>


                                <strong>
                                    ${money(price)}
                                </strong>


                                <button
                                    type="button"
                                    class="tf-drawer-recommend-add"
                                    data-product-id="${id}"
                                >
                                    Add
                                </button>

                            </div>

                        </article>
                    `;

                })
                .join("");


            section.classList.add("visible");


            if(window.lucide){

                window.lucide.createIcons();

            }


            startAutoSlide();

        }catch(error){

            console.error(
                "Drawer recommendations error:",
                error
            );

            section.classList.remove("visible");

            track.innerHTML = "";

        }

    }
        /*=====================================================
        RECOMMENDATION SLIDER
    =====================================================*/

    function slideRecommendations(direction = 1){

        const track =
            byId("tfDrawerRecommendationTrack");

        const card = track?.querySelector(
            ".tf-drawer-recommend-card"
        );


        if(!track || !card){

            return;

        }


        const distance =
            card.offsetWidth + 10;


        const reachedEnd =

            track.scrollLeft +
            track.clientWidth >=

            track.scrollWidth - 8;


        if(direction > 0 && reachedEnd){

            track.scrollTo({

                left:0,

                behavior:"smooth"

            });

            return;

        }


        track.scrollBy({

            left:distance * direction,

            behavior:"smooth"

        });

    }


    function startAutoSlide(){

    clearInterval(autoSlideTimer);

    autoSlideTimer = setInterval(() => {

        const track =
            byId("tfDrawerRecommendationTrack");

        const card = track?.querySelector(
            ".tf-drawer-recommend-card"
        );

        if(!track || !card){
            return;
        }

        const distance =
            card.offsetWidth + 10;

        const reachedEnd =
            track.scrollLeft +
            track.clientWidth >=
            track.scrollWidth - 8;

        if(reachedEnd){

            track.scrollTo({
                left:0,
                behavior:"smooth"
            });

        }else{

            track.scrollBy({
                left:distance,
                behavior:"smooth"
            });

        }

    }, 3000);

}


    /*=====================================================
        OPEN AND CLOSE DRAWER
    =====================================================*/

    function openDrawer(){

        renderDrawer();

        removeStraySparkles();


        const drawer =
            byId("tf-cart-drawer");

        const overlay =
            byId("tf-cart-overlay");


        drawer?.classList.add("active");

        overlay?.classList.add("active");


        document.body.style.overflow =
            "hidden";


        loadRecommendations();
        if(window.lucide){
    window.lucide.createIcons();
}

    }


function closeDrawer(){

    clearInterval(autoSlideTimer);

    byId("tf-cart-drawer")
        ?.classList.remove("active");

    byId("tf-cart-overlay")
        ?.classList.remove("active");

    document.body.style.overflow = "";

}


    /*=====================================================
        PLUS, MINUS, REMOVE
    =====================================================*/

    document.addEventListener(
        "click",
        event => {

            const actionButton =
                event.target.closest(
                    "[data-action][data-key]"
                );


            if(!actionButton){

                return;

            }


            const cart =
                getCart();


            const index =
                getCartIndexFromKey(
                    actionButton.dataset.key
                );


            if(index < 0 || !cart[index]){

                return;

            }


            const action =
                actionButton.dataset.action;


            if(action === "plus"){

                cart[index].quantity =
                    Number(
                        cart[index].quantity || 1
                    ) + 1;

            }


            if(action === "minus"){

                cart[index].quantity =
                    Math.max(
                        1,
                        Number(
                            cart[index].quantity || 1
                        ) - 1
                    );

            }


            if(action === "remove"){

                cart.splice(index, 1);

            }


            saveCart(cart);

        }
    );


    /*=====================================================
        ADD RECOMMENDED PRODUCT
    =====================================================*/

    document.addEventListener(
        "click",
        event => {

            const addButton =
                event.target.closest(
                    ".tf-drawer-recommend-add"
                );


            if(!addButton){

                return;

            }


            const product =
                recommendedProducts.find(item =>

                    getProductId(item) ===
                    String(
                        addButton.dataset.productId
                    )

                );


            if(!product){

                return;

            }


            const cart =
                getCart();

            const productId =
                getProductId(product);


            const existingItem =
                cart.find(item =>

                    String(item.id) ===
                    productId

                );


            if(existingItem){

                existingItem.quantity =
                    Number(
                        existingItem.quantity || 1
                    ) + 1;

            }else{

                cart.push({

                    id:productId,

                    name:
                        product.name ||
                        product.title ||
                        "Product",

                    category:
                        product.category || "",

                    price:
                        getProductPrice(product),

                    image:
                        getProductImage(product),

                    quantity:1,

                    size:
                        Array.isArray(product.sizes) &&
                        product.sizes.length
                            ? product.sizes[0]
                            : "M"

                });

            }


            saveCart(cart);


            addButton.textContent =
                "Added";

            addButton.disabled =
                true;

        }
    );
        /*=====================================================
        SLIDER ARROWS
    =====================================================*/

    document.addEventListener(
        "click",
        event => {

            if(
                event.target.closest(
                    "#tfDrawerRecommendNext"
                )
            ){

                slideRecommendations(1);

                startAutoSlide();

                return;

            }


            if(
                event.target.closest(
                    "#tfDrawerRecommendPrev"
                )
            ){

                slideRecommendations(-1);

                startAutoSlide();

            }

        }
    );


    /*=====================================================
        ESCAPE KEY
    =====================================================*/

    document.addEventListener(
        "keydown",
        event => {

            if(event.key === "Escape"){

                closeDrawer();

            }

        }
    );


    /*=====================================================
        PAGE INITIALIZATION
    =====================================================*/

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            const recommendationTrack =
    byId("tfDrawerRecommendationTrack");

recommendationTrack?.addEventListener(
    "mouseenter",
    () => clearInterval(autoSlideTimer)
);

recommendationTrack?.addEventListener(
    "mouseleave",
    startAutoSlide
);
            closeDrawer();
            const closeButton =
                byId("tf-cart-close");

            const overlay =
                byId("tf-cart-overlay");


            closeButton?.addEventListener(
                "click",
                closeDrawer
            );


            overlay?.addEventListener(
                "click",
                closeDrawer
            );


            renderDrawer();

            removeStraySparkles();

        }
    );


    /*=====================================================
        CART UPDATE
    =====================================================*/

    window.addEventListener(
        "cartUpdated",
        () => {

            renderDrawer();

            loadRecommendations();

        }
    );

/*=====================================================
    CLOSE DRAWER AFTER BROWSER BACK
=====================================================*/

window.addEventListener("pageshow", event => {

    const drawer =
        document.getElementById("tf-cart-drawer");

    const overlay =
        document.getElementById("tf-cart-overlay");

    drawer?.classList.remove("active");
    overlay?.classList.remove("active");

    document.body.style.overflow = "";

});
    /*=====================================================
        GLOBAL API
    =====================================================*/

    window.TaqdeerCartDrawer = {

        open:openDrawer,

        close:closeDrawer,

        render:renderDrawer,

        loadRecommendations:
            loadRecommendations

    };

})();