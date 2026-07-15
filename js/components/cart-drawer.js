/*=========================================================
    TAQDEER FASHION - GLOBAL CART DRAWER
=========================================================*/

"use strict";

(function(){

    const CART_KEY = "taqdeerCart";

    function money(value){
        return "৳" + Number(value || 0).toLocaleString();
    }

    function isInsidePagesFolder(){
        return window.location.pathname.includes("/pages/");
    }

    function pagePath(pathFromPages){
        return isInsidePagesFolder()
            ? pathFromPages
            : "pages/" + pathFromPages.replace("../", "");
    }

    function getCart(){
        const cartService = window.CartService || window.cartService;

        if(cartService && typeof cartService.getCart === "function"){
            return cartService.getCart() || [];
        }

        try{
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        }
        catch(error){
            return [];
        }
    }

    function getImage(path){
        const fallback = isInsidePagesFolder()
            ? "../../assets/placeholders/product.jpg"
            : "assets/placeholders/product.jpg";

        if(!path){
            return fallback;
        }

        if(path.startsWith("http") || path.startsWith("data:")){
            return path;
        }

        if(path.startsWith("../../") || path.startsWith("../")){
            return path;
        }

        if(path.startsWith("assets/")){
            return isInsidePagesFolder() ? "../../" + path : path;
        }

        return fallback;
    }

    function renderDrawer(){
        const body = document.getElementById("tf-cart-drawer-items");
        const totalEl = document.getElementById("tf-cart-drawer-total");
        const checkoutLink = document.getElementById("tf-drawer-checkout");
        const viewCartLink = document.getElementById("tf-drawer-view-cart");

        if(!body){
            return;
        }

        if(checkoutLink){
            checkoutLink.href = pagePath("../checkout/index.html");
        }

        if(viewCartLink){
            viewCartLink.href = pagePath("../cart/index.html");
        }

        const cart = getCart();

        body.innerHTML = "";

        if(!cart.length){
            body.innerHTML = `
                <div class="tf-drawer-empty">
                    <h4>Your cart is empty</h4>
                    <p>Add some products first.</p>
                </div>
            `;

            if(totalEl){
                totalEl.textContent = money(0);
            }

            return;
        }

        let subtotal = 0;

        cart.forEach(item=>{
            const qty = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const lineTotal = price * qty;

            subtotal += lineTotal;

            const card = document.createElement("div");
            card.className = "tf-drawer-item";

            card.innerHTML = `
                <div class="tf-drawer-item-img">
                    <img
                        src="${getImage(item.image)}"
                        alt="${item.name || "Product"}"
                        onerror="this.onerror=null;this.src='${getImage("")}';"
                    >
                </div>

                <div class="tf-drawer-item-info">

    <h4>${item.name || "Product"}</h4>

    <p>
        ${item.category || "Fashion"}
        ${item.size ? " • Size: " + item.size : ""}
    </p>

    <strong>${money(lineTotal)}</strong>

    <div class="tf-drawer-item-actions">

        <div class="tf-drawer-qty">

            <button
                type="button"
                class="tf-drawer-minus"
                data-id="${item.id}"
                data-size="${item.size || "M"}"
            >
                −
            </button>

            <span>${qty}</span>

            <button
                type="button"
                class="tf-drawer-plus"
                data-id="${item.id}"
                data-size="${item.size || "M"}"
            >
                +
            </button>

        </div>

        <button
            type="button"
            class="tf-drawer-remove"
            data-id="${item.id}"
            data-size="${item.size || "M"}"
        >
            Remove
        </button>

    </div>

</div>
            `;

            body.appendChild(card);
        });

        if(totalEl){
            totalEl.textContent = money(subtotal);
        }
    }

    function openDrawer(){
        renderDrawer();

        const drawer = document.getElementById("tf-cart-drawer");
        const overlay = document.getElementById("tf-cart-overlay");

        if(drawer){
            drawer.classList.add("active");
        }

        if(overlay){
            overlay.classList.add("active");
        }

        document.body.style.overflow = "hidden";
    }

    function closeDrawer(){
        const drawer = document.getElementById("tf-cart-drawer");
        const overlay = document.getElementById("tf-cart-overlay");

        if(drawer){
            drawer.classList.remove("active");
        }

        if(overlay){
            overlay.classList.remove("active");
        }

        document.body.style.overflow = "";
    }

    document.addEventListener("DOMContentLoaded",()=>{
        const closeBtn = document.getElementById("tf-cart-close");
        const overlay = document.getElementById("tf-cart-overlay");

        if(closeBtn){
            closeBtn.addEventListener("click", closeDrawer);
        }

        if(overlay){
            overlay.addEventListener("click", closeDrawer);
        }

        renderDrawer();
    });

    window.addEventListener("cartUpdated", renderDrawer);
document.addEventListener("click", event => {

    const plusBtn = event.target.closest(".tf-drawer-plus");
    const minusBtn = event.target.closest(".tf-drawer-minus");
    const removeBtn = event.target.closest(".tf-drawer-remove");

    if(!plusBtn && !minusBtn && !removeBtn){
        return;
    }

    const button = plusBtn || minusBtn || removeBtn;

    const productId = String(button.dataset.id || "");
    const productSize = String(button.dataset.size || "M");

    const cartService =
        window.CartService ||
        window.cartService;

    if(!cartService){
        return;
    }

    const cart = getCart();

    const item = cart.find(cartItem =>
        String(cartItem.id) === productId &&
        String(cartItem.size || "M") === productSize
    );

    if(!item){
        return;
    }

    if(plusBtn){
        item.quantity = Number(item.quantity || 1) + 1;
    }

    if(minusBtn){
        item.quantity = Math.max(
            1,
            Number(item.quantity || 1) - 1
        );
    }

    if(removeBtn){

        const updatedCart = cart.filter(cartItem =>
            !(
                String(cartItem.id) === productId &&
                String(cartItem.size || "M") === productSize
            )
        );

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(updatedCart)
        );

        window.dispatchEvent(
            new CustomEvent("cartUpdated")
        );

        return;
    }

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    window.dispatchEvent(
        new CustomEvent("cartUpdated")
    );
});
    window.TaqdeerCartDrawer = {
        open: openDrawer,
        close: closeDrawer,
        render: renderDrawer
    };

})();
/*=========================================================
    TF CART DRAWER RECOMMENDATIONS
=========================================================*/

let tfDrawerRecommendedProducts = [];
let tfDrawerAutoSlideTimer = null;

function tfDrawerInsidePagesFolder(){
    return window.location.pathname.includes("/pages/");
}

function tfDrawerFallbackImage(){
    return tfDrawerInsidePagesFolder()
        ? "../../assets/placeholders/product.jpg"
        : "assets/placeholders/product.jpg";
}

function getTfProductId(product){
    return product.id || product.docId || product.productId || "";
}

function getTfProductPrice(product){
    return Number(
        product.price ||
        product.salePrice ||
        product.finalPrice ||
        product.discountPrice ||
        0
    );
}

function getTfProductImage(product){

    const image =
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        product.mainImage ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        );

    if(!image){
        return tfDrawerFallbackImage();
    }

    if(
        image.startsWith("http") ||
        image.startsWith("data:") ||
        image.startsWith("../../") ||
        image.startsWith("../")
    ){
        return image;
    }

    if(image.startsWith("assets/")){
        return tfDrawerInsidePagesFolder()
            ? "../../" + image
            : image;
    }

    return image;
}

function tfDrawerMoney(value){
    return "৳" + Number(value || 0).toLocaleString();
}

async function loadTfDrawerRecommendations(){

    const track = document.getElementById(
        "tfDrawerRecommendationTrack"
    );

    const section = document.querySelector(
        ".tf-drawer-recommendations"
    );

    if(!track || !section){
        return;
    }

    try{

        const service =
            window.productService ||
            window.ProductService;

        if(
            !service ||
            typeof service.getProducts !== "function"
        ){
            section.style.display = "none";
            return;
        }

        const products = await service.getProducts();

        const cart = JSON.parse(
            localStorage.getItem("taqdeerCart") || "[]"
        );

        const cartIds = new Set(
            cart.map(item => String(item.id))
        );

        tfDrawerRecommendedProducts = (
            Array.isArray(products) ? products : []
        )
            .filter(product => {

                const id = getTfProductId(product);

                return (
                    id &&
                    !cartIds.has(String(id))
                );

            })
            .slice(0, 8);

        if(!tfDrawerRecommendedProducts.length){

            section.style.display = "none";
            return;
        }

        section.style.display = "block";

        renderTfDrawerRecommendations();
        startTfDrawerAutoSlide();

    }catch(error){

        console.error(
            "TF drawer recommendation error:",
            error
        );

        section.style.display = "none";
    }
}

function renderTfDrawerRecommendations(){

    const track = document.getElementById(
        "tfDrawerRecommendationTrack"
    );

    if(!track){
        return;
    }

    track.innerHTML = tfDrawerRecommendedProducts
        .map(product => {

            const id = getTfProductId(product);

            const name =
                product.name ||
                product.title ||
                "Product";

            const price = getTfProductPrice(product);
            const image = getTfProductImage(product);

            return `
                <article class="tf-drawer-recommend-card">

                    <img
                        src="${image}"
                        alt="${name}"
                        onerror="
                            this.onerror=null;
                            this.src='${tfDrawerFallbackImage()}';
                        "
                    >

                    <div class="tf-drawer-recommend-info">

                        <h5>${name}</h5>

                        <strong>
                            ${tfDrawerMoney(price)}
                        </strong>

                        <button
                            type="button"
                            class="tf-drawer-recommend-add"
                            data-id="${id}"
                        >
                            Add
                        </button>

                    </div>

                </article>
            `;

        })
        .join("");

    if(window.lucide){
        window.lucide.createIcons();
    }
}

function slideTfDrawerRecommendations(direction = 1){

    const track = document.getElementById(
        "tfDrawerRecommendationTrack"
    );

    if(!track){
        return;
    }

    const card = track.querySelector(
        ".tf-drawer-recommend-card"
    );

    if(!card){
        return;
    }

    const distance = card.offsetWidth + 12;

    const reachedEnd =
        track.scrollLeft + track.clientWidth >=
        track.scrollWidth - 10;

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

function startTfDrawerAutoSlide(){

    clearInterval(tfDrawerAutoSlideTimer);

    tfDrawerAutoSlideTimer = setInterval(() => {

        slideTfDrawerRecommendations(1);

    }, 3200);
}

document.addEventListener("click", event => {

    const nextButton = event.target.closest(
        "#tfDrawerRecommendNext"
    );

    const prevButton = event.target.closest(
        "#tfDrawerRecommendPrev"
    );

    const addButton = event.target.closest(
        ".tf-drawer-recommend-add"
    );

    if(nextButton){

        slideTfDrawerRecommendations(1);
        startTfDrawerAutoSlide();
        return;
    }

    if(prevButton){

        slideTfDrawerRecommendations(-1);
        startTfDrawerAutoSlide();
        return;
    }

    if(!addButton){
        return;
    }

    const product = tfDrawerRecommendedProducts.find(
        item =>
            String(getTfProductId(item)) ===
            String(addButton.dataset.id)
    );

    if(!product){
        return;
    }

    const cartService =
        window.CartService ||
        window.cartService;

    if(
        !cartService ||
        typeof cartService.addToCart !== "function"
    ){
        return;
    }

    cartService.addToCart({
        id:getTfProductId(product),
        name:product.name || product.title || "Product",
        category:product.category || "",
        price:getTfProductPrice(product),
        image:getTfProductImage(product),
        quantity:1,
        size:
            Array.isArray(product.sizes) &&
            product.sizes.length
                ? product.sizes[0]
                : "M"
    });

    addButton.textContent = "Added";
    addButton.disabled = true;

    setTimeout(() => {
        loadTfDrawerRecommendations();
    }, 400);
});

document.addEventListener(
    "DOMContentLoaded",
    loadTfDrawerRecommendations
);

window.addEventListener(
    "cartUpdated",
    loadTfDrawerRecommendations
);