/*=========================================================
                TAQDEER FASHION
                ORDER SUCCESS PAGE FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const params =
    new URLSearchParams(window.location.search);

    const orderId =
    params.get("id");

    const orderIdElement =
    document.querySelector("#order-id");

    const statusElement =
    document.querySelector("#success-status");

    const paymentElement =
    document.querySelector("#success-payment");

    const totalElement =
    document.querySelector("#success-total");



    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }



    if(!orderId){

        if(orderIdElement){
            orderIdElement.innerText = "Not Found";
        }

        return;

    }



    if(orderIdElement){

        orderIdElement.innerText = orderId;

    }





    async function loadOrder(){

        try{

            if(!window.db){

                console.log("Firebase not loaded");

                return;

            }

            const orderDoc =
            await window.db
            .collection("orders")
            .doc(orderId)
            .get();


            if(!orderDoc.exists){

                console.log("Order not found");

                return;

            }


            const order =
            orderDoc.data();


            if(statusElement){

                statusElement.innerText =
                order.status || "Pending";

            }


            if(paymentElement){

                paymentElement.innerText =
                order.paymentMethod || "COD";

            }


            if(totalElement){

                totalElement.innerText =
                money(order.total);

            }


        }

        catch(error){

            console.error("Order loading error:", error);

        }

    }



    loadOrder();


    if(window.CartService){

        window.CartService.updateCartCount();

    }

});