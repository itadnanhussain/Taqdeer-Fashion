/*=========================================================
                TAQDEER FASHION
                WISHLIST SERVICE FINAL
=========================================================*/

"use strict";

const WISHLIST_KEY = "taqdeerWishlist";


function getWishlist(){

    const wishlist =
    localStorage.getItem(WISHLIST_KEY);

    return wishlist
    ?
    JSON.parse(wishlist)
    :
    [];

}


function saveWishlist(items){

    localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(items)
    );

    window.dispatchEvent(
        new CustomEvent("wishlistUpdated")
    );

}


function addToWishlist(product){

    const wishlist =
    getWishlist();

    const exists =
    wishlist.find(
        item => item.id === product.id
    );

    if(!exists){

        wishlist.push({

            id:product.id,
            name:product.name,
            image:product.image,
            price:product.price,
            category:product.category

        });

        saveWishlist(wishlist);

    }

    return wishlist;

}


function removeFromWishlist(id){

    let wishlist =
    getWishlist();

    wishlist =
    wishlist.filter(
        item => item.id !== id
    );

    saveWishlist(wishlist);

    return wishlist;

}


function toggleWishlist(product){

    if(isWishlist(product.id)){

        return removeFromWishlist(product.id);

    }

    return addToWishlist(product);

}


function isWishlist(id){

    const wishlist =
    getWishlist();

    return wishlist.some(
        item => item.id === id
    );

}


function clearWishlist(){

    localStorage.removeItem(WISHLIST_KEY);

    window.dispatchEvent(
        new CustomEvent("wishlistUpdated")
    );

}


function getWishlistCount(){

    return getWishlist().length;

}


window.WishlistService = {

    getWishlist,
    saveWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlist,
    clearWishlist,
    getWishlistCount

};