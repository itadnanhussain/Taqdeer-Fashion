/*=========================================================
        TAQDEER FASHION
        WISHLIST PAGE SYSTEM FINAL POLISH
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


const wishlistContainer =
document.querySelector("#wishlist-products");

const wishlistCountText =
document.querySelector("#wishlist-count-text");





/*=========================================================
        HELPERS
=========================================================*/

function getFallbackImage(){

    return "../../assets/placeholders/product.jpg";

}


function getWishlistItems(){

    const wishlistService =
    window.WishlistService ||
    window.wishlistService;

    if(wishlistService && wishlistService.getWishlist){

        return wishlistService.getWishlist();

    }

    return JSON.parse(
        localStorage.getItem("taqdeerWishlist")
    ) || [];

}


function saveWishlistItems(items){

    localStorage.setItem(
        "taqdeerWishlist",
        JSON.stringify(items)
    );

    window.dispatchEvent(
        new Event("wishlistUpdated")
    );

}


function updateCount(items){

    if(!wishlistCountText){
        return;
    }

    wishlistCountText.innerText =
    `${items.length} item${items.length > 1 ? "s" : ""} saved`;

}


function getProductLink(id){

    return `../product-details/index.html?id=${id}`;

}


function shortName(name,max=55){

    if(!name){
        return "Product Name";
    }

    return name.length > max
    ?
    name.slice(0,max) + "..."
    :
    name;

}


function updateHeaderCounts(){

    window.dispatchEvent(
        new Event("cartUpdated")
    );

    window.dispatchEvent(
        new Event("wishlistUpdated")
    );

}





/*=========================================================
        RENDER
=========================================================*/

function loadWishlist(){

    if(!wishlistContainer){
        return;
    }

    const wishlist =
    getWishlistItems();

    updateCount(wishlist);

    wishlistContainer.innerHTML = "";

    if(!wishlist.length){

        wishlistContainer.innerHTML = `
            <div class="empty-wishlist">

                <div class="empty-wishlist-icon">
                    <i data-lucide="heart"></i>
                </div>

                <h2>
                    Your wishlist is empty
                </h2>

                <p>
                    Save your favourite products and find them here later.
                </p>

                <a href="../shop/index.html">
                    Start Shopping
                </a>

            </div>
        `;

        if(window.lucide){
            lucide.createIcons();
        }

        updateHeaderCounts();

        return;

    }


    wishlist.forEach(product=>{

        const card =
        document.createElement("div");

        card.className =
        "wishlist-card";

        card.innerHTML = `
            <div class="wishlist-image">

                <a href="${getProductLink(product.id)}">

                    <img
                    src="${product.image || getFallbackImage()}"
                    alt="${product.name || "Product"}"
                    class="wishlist-product-img"
                    >

                </a>

                <button
                type="button"
                class="wishlist-remove-icon"
                data-id="${product.id}"
                aria-label="Remove from wishlist"
                >
                    <i data-lucide="x"></i>
                </button>

            </div>


            <div class="wishlist-content">

                <p class="wishlist-category">
                    ${product.category || "Fashion"}
                </p>

                <a href="${getProductLink(product.id)}" class="wishlist-title-link">

                    <h3>
                        ${shortName(product.name)}
                    </h3>

                </a>

                <div class="wishlist-rating">
                    ★★★★★ <span>${product.rating || "4.8"}</span>
                </div>

                <div class="wishlist-bottom">

                    <strong>
                        ৳${product.price || 0}
                    </strong>

                    <button
                    type="button"
                    class="wishlist-cart-btn"
                    data-id="${product.id}"
                    >
                        Add To Cart
                    </button>

                </div>

            </div>
        `;

        const img =
        card.querySelector(".wishlist-product-img");

        img.onerror = function(){

            this.onerror = null;

            this.src =
            getFallbackImage();

        };

        wishlistContainer.appendChild(card);

    });


    if(window.lucide){
        lucide.createIcons();
    }

    updateHeaderCounts();

}





/*=========================================================
        ACTIONS
=========================================================*/

document.addEventListener("click",(e)=>{


/* REMOVE */

    const removeBtn =
    e.target.closest(".wishlist-remove-icon");

    if(removeBtn){

        const id =
        removeBtn.dataset.id;

        let wishlist =
        getWishlistItems();

        wishlist =
        wishlist.filter(
            item =>
            item.id !== id
        );

        saveWishlistItems(wishlist);

        loadWishlist();

        return;

    }





/* ADD TO CART */

    const cartBtn =
    e.target.closest(".wishlist-cart-btn");

    if(cartBtn){

        const id =
        cartBtn.dataset.id;

        const wishlist =
        getWishlistItems();

        const product =
        wishlist.find(
            item =>
            item.id === id
        );

        if(!product){
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

            window.dispatchEvent(
                new Event("cartUpdated")
            );

            cartBtn.innerText =
            "Added";

            setTimeout(()=>{

                cartBtn.innerText =
                "Add To Cart";

            },900);

        }

        else{

            console.error(
                "Cart service missing"
            );

        }

    }


});





/*=========================================================
        INIT
=========================================================*/

loadWishlist();


});