/*=========================================================
            TAQDEER FASHION
            PRODUCTS HOME SYSTEM
            v2.0 FINAL
=========================================================*/


"use strict";





document.addEventListener(
"DOMContentLoaded",
()=>{





/*=========================================================
            LOAD LATEST COLLECTION
=========================================================*/


const latestContainer =
document.querySelector(
"#latest-products"
);





/*=========================================================
            LOAD BEST SELLERS
=========================================================*/


const bestSellerContainer =
document.querySelector(
"#best-sellers"
);








async function loadProducts(){



try{



if(!window.productService){


console.error(
"Product Service Missing"
);


return;


}





const products =
await window.productService.getProducts();








if(!products || products.length===0){


console.log(
"No Products Found"
);


return;


}






/*---------------------------------
        LATEST PRODUCTS
---------------------------------*/


if(latestContainer){



const latest =
products
.slice(0,4);



window.productCard.renderProducts(

latestContainer,

latest

);



}








/*---------------------------------
        BEST SELLERS
---------------------------------*/


if(bestSellerContainer){



const bestSeller =

products

.filter(
product =>
product.bestSeller === true
)


.slice(0,4);






window.productCard.renderProducts(

bestSellerContainer,

bestSeller.length
?
bestSeller
:
products.slice(0,4)

);



}






}



catch(error){



console.error(
"Products Load Error:",
error
);



}



}







loadProducts();





});