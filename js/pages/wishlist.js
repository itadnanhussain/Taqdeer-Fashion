/*=========================================================
        TAQDEER FASHION
        WISHLIST SYSTEM
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{





const wishlistContainer =
document.querySelector(
"#wishlist-products"
);



let wishlist =
JSON.parse(
localStorage.getItem(
"taqdeerWishlist"
)
)
||
[];








/*=========================================
        LOAD WISHLIST
=========================================*/


function loadWishlist(){



    if(!wishlistContainer)
        return;




    wishlistContainer.innerHTML="";





    if(!wishlist.length){



        wishlistContainer.innerHTML = `

        <div class="empty-wishlist">

        <h2>
        Your wishlist is empty
        </h2>


        <p>
        Add your favourite products here
        </p>


        </div>

        `;



        return;


    }









    wishlist.forEach(product=>{


        const card =
        document.createElement(
            "div"
        );



        card.className =
        "wishlist-card";






        card.innerHTML = `



        <img

        src="${product.image || ''}"

        alt="${product.name}">





        <div class="wishlist-content">


        <h3>

        ${product.name}

        </h3>




        <div class="wishlist-price">

        ৳${product.price}

        </div>





        <div class="wishlist-actions">



        <button

        class="wishlist-btn add-cart"

        data-id="${product.id}">

        Cart

        </button>





        <button

        class="wishlist-btn remove-wishlist-btn"

        data-id="${product.id}">

        Remove

        </button>




        </div>




        </div>



        `;




        wishlistContainer
        .appendChild(card);



    });



}









/*=========================================
        ACTIONS
=========================================*/


document.addEventListener(
"click",
(e)=>{





/* ADD CART */


if(
e.target.classList
.contains(
"add-cart"
)
){



const id =
e.target.dataset.id;




const product =
wishlist.find(
item=>
item.id === id
);





window.CartService
.addToCart(
product
);



}








/* REMOVE */


if(
e.target.classList
.contains(
"remove-wishlist-btn"
)
){



const id =
e.target.dataset.id;





wishlist =
wishlist.filter(
item=>

item.id !== id

);






localStorage.setItem(

"taqdeerWishlist",

JSON.stringify(
wishlist
)

);





loadWishlist();



}




});








loadWishlist();






});