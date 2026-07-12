/*=========================================================
            TAQDEER FASHION
            ACCOUNT DASHBOARD SYSTEM FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


/*=========================================================
        DOM
=========================================================*/

const userPhoto =
document.querySelector("#user-photo");

const topUserPhoto =
document.querySelector("#top-user-photo");

const userName =
document.querySelector("#user-name");

const topUserName =
document.querySelector("#top-user-name");

const userEmail =
document.querySelector("#user-email");

const welcomeName =
document.querySelector("#welcome-name");

const logoutBtn =
document.querySelector("#logout-btn");

const totalOrdersEl =
document.querySelector("#total-orders");

const shippingOrdersEl =
document.querySelector("#shipping-orders");

const wishlistItemsEl =
document.querySelector("#wishlist-items");

const topWishlistCount =
document.querySelector("#top-wishlist-count");

const sidebarWishlistCount =
document.querySelector("#sidebar-wishlist-count");

const topCartCount =
document.querySelector("#top-cart-count");

const recentOrdersList =
document.querySelector("#recent-orders-list");

const wishlistPreview =
document.querySelector("#wishlist-preview");

const savedAddress =
document.querySelector("#saved-address");

const savedPhone =
document.querySelector("#saved-phone");
const couponCode =
document.querySelector("#coupon-code");

const couponDiscount =
document.querySelector("#coupon-discount");

const couponMin =
document.querySelector("#coupon-min");

const couponExpiry =
document.querySelector("#coupon-expiry");

const profileCoupon =
document.querySelector("#profile-coupon");

const reviewProductImage =
document.querySelector("#review-product-image");

const reviewProductName =
document.querySelector("#review-product-name");

const reviewStars =
document.querySelector("#review-stars");

const reviewText =
document.querySelector("#review-text");

const reviewDate =
document.querySelector("#review-date");




/*=========================================================
        HELPERS
=========================================================*/

function defaultImage(){

    return "../../assets/logos/logo-1.png";

}



function productFallback(){

    return "../../assets/placeholders/product.jpg";

}



function formatDate(dateValue){

    if(!dateValue){
        return "";
    }

    if(dateValue.toDate){
        return dateValue.toDate().toLocaleDateString(
            "en-US",
            {
                month:"short",
                day:"numeric",
                year:"numeric"
            }
        );
    }

    return new Date(dateValue).toLocaleDateString(
        "en-US",
        {
            month:"short",
            day:"numeric",
            year:"numeric"
        }
    );

}



function shortText(text,length=16){

    if(!text){
        return "";
    }

    return text.length > length
    ?
    text.slice(0,length) + "..."
    :
    text;

}



function setImage(img,url){

    if(!img){
        return;
    }

    img.src =
    url || defaultImage();

    img.onerror = function(){

        this.onerror = null;

        this.src =
        defaultImage();

    };

}





/*=========================================================
        CART COUNT
=========================================================*/

function loadCartCount(){

    const cartService =
    window.CartService ||
    window.cartService;

    let count = 0;

    if(cartService && cartService.getCart){

        const cart =
        cartService.getCart();

        count =
        cart.reduce(
            (total,item)=>
            total + Number(item.quantity || 1),
            0
        );

    }

    if(topCartCount){
        topCartCount.innerText = count;
    }

}





/*=========================================================
        WISHLIST
=========================================================*/

function loadWishlist(){

    const wishlistService =
    window.WishlistService ||
    window.wishlistService;

    const wishlist =
    wishlistService && wishlistService.getWishlist
    ?
    wishlistService.getWishlist()
    :
    [];

    if(wishlistItemsEl){
        wishlistItemsEl.innerText =
        wishlist.length;
    }

    if(topWishlistCount){
        topWishlistCount.innerText =
        wishlist.length;
    }

    if(sidebarWishlistCount){
        sidebarWishlistCount.innerText =
        wishlist.length;
    }

    renderWishlistPreview(
        wishlist.slice(0,4)
    );

}



function renderWishlistPreview(items){

    if(!wishlistPreview){
        return;
    }

    if(!items.length){

        wishlistPreview.innerHTML = `
            <p class="loading-text">
                No wishlist items yet.
            </p>
        `;

        return;

    }

    wishlistPreview.innerHTML = "";

    items.forEach(item=>{

        const div =
        document.createElement("div");

        div.className =
        "wishlist-mini-item";

        div.innerHTML = `
            <a href="../product-details/index.html?id=${item.id}">
                <img
                    src="${item.image || productFallback()}"
                    alt="${item.name || "Product"}"
                    onerror="this.src='${productFallback()}'"
                >
            </a>

            <h4>
                ${shortText(item.name || "Product",22)}
            </h4>

            <strong>
                ৳${item.price || 0}
            </strong>
        `;

        wishlistPreview.appendChild(div);

    });

}





/*=========================================================
        USER PROFILE
=========================================================*/

async function loadUserProfile(user){

    try{

        const userDoc =
        await window.db
        .collection("users")
        .doc(user.uid)
        .get();

        const data =
        userDoc.exists
        ?
        userDoc.data()
        :
        {};

        const name =
        data.name ||
        user.displayName ||
        "Taqdeer User";

        const email =
        user.email ||
        data.email ||
        "";

        const photo =
        data.photoURL ||
        user.photoURL ||
        defaultImage();

        const phone =
        data.phone ||
        "—";

        const location =
        data.location ||
        "No address added yet.";

        if(userName){
            userName.innerText = name;
        }

        if(topUserName){
            topUserName.innerText = name;
        }

        if(userEmail){
            userEmail.innerText = email;
        }

        if(welcomeName){
            welcomeName.innerText =
            `${name} 👋`;
        }

        if(savedAddress){
            savedAddress.innerText = location;
        }

        if(savedPhone){
            savedPhone.innerText = phone;
        }

        setImage(userPhoto,photo);

        setImage(topUserPhoto,photo);

    }

    catch(error){

        console.error(
            "Account Profile Error:",
            error
        );

    }

}





/*=========================================================
        ORDERS
=========================================================*/

async function loadOrders(user){

    try{

        if(!recentOrdersList){
            return;
        }

       const snapshot =
await window.db
.collection("orders")
.where("userId","==",user.uid)
.get();

        const orders =
        snapshot.docs.map(doc=>({

            id:
            doc.id,

            ...doc.data()

        }));
        orders.sort((a,b)=>{

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

});

const latestOrders =
orders.slice(0,4);

       renderRecentOrders(latestOrders);

updateOrderStats(orders);

    }

    catch(error){

        console.error(
            "Account Orders Error:",
            error
        );

        if(recentOrdersList){

            recentOrdersList.innerHTML = `
                <p class="loading-text">
                    Orders loading failed.
                </p>
            `;

        }

    }

}



function updateOrderStats(orders){

    if(totalOrdersEl){
        totalOrdersEl.innerText =
        orders.length;
    }

    const shippingCount =
    orders.filter(order=>{

        const status =
        (order.status || "pending")
        .toLowerCase();

        return [
            "processing",
            "shipped"
        ].includes(status);

    }).length;

    if(shippingOrdersEl){
        shippingOrdersEl.innerText =
        shippingCount;
    }

}



function renderRecentOrders(orders){

    if(!recentOrdersList){
        return;
    }

    if(!orders.length){

        recentOrdersList.innerHTML = `
            <p class="loading-text">
                No orders found yet.
            </p>
        `;

        return;

    }

    recentOrdersList.innerHTML = "";

    orders.forEach(order=>{

        const firstItem =
        order.items && order.items.length
        ?
        order.items[0]
        :
        {};

        const status =
        (order.status || "pending")
        .toLowerCase();

        const div =
        document.createElement("div");

        div.className =
        "recent-order-item";

        div.innerHTML = `
            <img
                src="${firstItem.image || productFallback()}"
                alt="${firstItem.name || "Product"}"
                onerror="this.src='${productFallback()}'"
            >

            <div class="recent-order-info">

                <h3>
                    Order #${shortText(order.id,8)}
                </h3>

                <p>
                    ${firstItem.name || "Product"}
                </p>

                <small>
                    Size: ${firstItem.size || "M"}
                    &nbsp; • &nbsp;
                    Qty: ${firstItem.quantity || 1}
                </small>

            </div>

            <div class="recent-order-price">

                <strong>
                    ৳${order.total || 0}
                </strong>

                <small>
                    ${formatDate(order.createdAt)}
                </small>

            </div>

            <div class="recent-order-action">

                <span class="order-chip ${status}">
                    ${status}
                </span>

                <a
                    href="../orders/details.html?id=${order.id}"
                    class="view-details-btn"
                >
                    View Details
                </a>

            </div>
        `;

        recentOrdersList.appendChild(div);

    });

}

/*=========================================================
        PROFILE COUPON - ADMIN SELECTED
=========================================================*/

async function loadProfileCoupon(){

    try{

        if(!window.db || !profileCoupon){
            return;
        }

        const snapshot =
        await window.db
        .collection("coupons")
        .where("active","==",true)
        .where("showOnProfile","==",true)
        .limit(1)
        .get();

        if(snapshot.empty){

           profileCoupon.innerHTML = `
    <div>
        <h3>NO COUPON</h3>
        <strong>No active offer</strong>
    </div>

    <div>
        <span>Expires on</span>
        <strong>—</strong>
    </div>
`;

            return;

        }

        const coupon =
        snapshot.docs[0].data();

        const type =
        coupon.type || "percentage";

        const discountText =
        type === "fixed"
        ?
        `৳${coupon.discount || 0} OFF`
        :
        `${coupon.discount || 0}% OFF`;

        if(couponCode){
            couponCode.innerText =
            coupon.code || "COUPON";
        }

        if(couponDiscount){
            couponDiscount.innerText =
            discountText;
        }

        if(couponMin){
            couponMin.innerText =
            `Min. purchase ৳${coupon.minPurchase || 0}`;
        }

        if(couponExpiry){
            couponExpiry.innerText =
            coupon.expiryDate || "No expiry";
        }

    }

    catch(error){

        console.error(
            "Profile Coupon Error:",
            error
        );

    }

}





/*=========================================================
        MOST REVIEWED / BEST REVIEW PRODUCT
=========================================================*/

async function loadBestReviewProduct(){

    try{

        if(!window.db || !reviewProductName){
            return;
        }

        const snapshot =
        await window.db
        .collection("products")
        .get();

        const products =
        snapshot.docs.map(doc=>({

            id:doc.id,
            ...doc.data()

        }));

        if(!products.length){
            return;
        }

        products.sort((a,b)=>{

            const aScore =
            Number(a.reviewCount || 0) * 10 +
            Number(a.rating || 0);

            const bScore =
            Number(b.reviewCount || 0) * 10 +
            Number(b.rating || 0);

            return bScore - aScore;

        });

        const product =
        products[0];

        if(reviewProductImage){

            reviewProductImage.src =
            product.image || productFallback();

            reviewProductImage.onerror = function(){

                this.onerror = null;
                this.src = productFallback();

            };

        }

        reviewProductName.innerText =
        product.name || "Premium Product";

        if(reviewStars){

            const rating =
            Math.round(Number(product.rating || 5));

            reviewStars.innerText =
            "★★★★★".slice(0,rating) +
            "☆☆☆☆☆".slice(0,5-rating);

        }

        if(reviewText){

            reviewText.innerText =
            product.reviewCount
            ?
            `${product.reviewCount} customer reviews. Average rating ${product.rating || 5}.`
            :
            "Excellent quality. Fabric is very comfortable.";

        }

        if(reviewDate){

            reviewDate.innerText =
            "Updated recently";

        }

    }

    catch(error){

        console.error(
            "Best Review Product Error:",
            error
        );

    }

}



/*=========================================================
        LOGOUT
=========================================================*/

if(logoutBtn){

    logoutBtn.addEventListener("click",async()=>{

        try{

            await window.auth.signOut();

            window.location.href =
            "../auth/login.html";

        }

        catch(error){

            console.error(
                "Logout Error:",
                error
            );

            alert(
                "Logout failed"
            );

        }

    });

}





/*=========================================================
        INIT
=========================================================*/

function initAccount(){

    const waitFirebase =
    setInterval(()=>{

        if(window.auth && window.db){

            clearInterval(waitFirebase);

            window.auth.onAuthStateChanged(async(user)=>{

                if(!user){

                    window.location.href =
                    "../auth/login.html";

                    return;

                }

                await loadUserProfile(user);

                await loadOrders(user);

                loadWishlist();

                loadCartCount();
                await loadProfileCoupon();

await loadBestReviewProduct();

                if(window.lucide){
                    lucide.createIcons();
                }

            });

        }

    },100);

}



initAccount();


});