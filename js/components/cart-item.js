/*=========================================================
                TAQDEER FASHION
                CART ITEM COMPONENT
=========================================================*/


"use strict";



function createCartItem(item){


    const cartItem =
    document.createElement("div");


    cartItem.className =
    "cart-item";



    cartItem.innerHTML = `


        <div class="cart-item-image">


            <img
            src="${item.image || 
            'assets/images/placeholders/product.jpg'}"
            alt="${item.name}"
            >


        </div>




        <div class="cart-item-info">


            <h4>
                ${item.name}
            </h4>



            <p class="cart-item-price">

                ৳${item.price}

            </p>



            <div class="quantity-control">


                <button 
                class="qty-minus"
                data-id="${item.id}">

                    -

                </button>



                <span>

                    ${item.quantity}

                </span>



                <button 
                class="qty-plus"
                data-id="${item.id}">

                    +

                </button>


            </div>



        </div>




        <div class="cart-item-right">


            <strong>

                ৳${item.price * item.quantity}

            </strong>



            <button
            class="cart-remove"
            data-id="${item.id}">


                <i data-lucide="trash-2"></i>


            </button>


        </div>


    `;



    return cartItem;


}





window.createCartItem =
createCartItem;