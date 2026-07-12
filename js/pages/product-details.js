/*=========================================================
            TAQDEER FASHION
            PRODUCT DETAILS SYSTEM
            v2.0 FINAL
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const params =
new URLSearchParams(
window.location.search
);



const productId =
params.get("id");





let product = null;

let quantity = 1;

let selectedSize = "";








/*=========================================================
                LOAD PRODUCT
=========================================================*/


async function loadProduct(){



try{



if(!productId)
return;




product =

await window.productService
.getProductById(productId);





if(!product){

console.log(
"Product Not Found"
);

return;

}







document.getElementById(
"productName"
).innerText =
product.name;





document.getElementById(
"productCategory"
).innerText =
product.category;






document.getElementById(
"productPrice"
).innerText =
"৳" + product.price;





document.getElementById(
"productDescription"
).innerText =
product.description || "";








const mainImage =

document.getElementById(
"mainProductImage"
);





mainImage.src =

product.image;









loadGallery();

loadRelatedProducts();




}



catch(error){


console.error(
"Product Details Error:",
error
);



}



}









/*=========================================================
                IMAGE GALLERY
=========================================================*/


function loadGallery(){



const container =

document.getElementById(
"productThumbnails"
);




if(!container)
return;






let images =

product.images || [

product.image

];






container.innerHTML="";






images.forEach(
(image,index)=>{



const thumb =

document.createElement(
"div"
);



thumb.className =

"product-thumbnail";



if(index===0)

thumb.classList.add(
"active"
);







thumb.innerHTML=`

<img src="${image}">

`;







thumb.onclick=()=>{



document.getElementById(
"mainProductImage"
).src=image;





document
.querySelectorAll(
".product-thumbnail"
)
.forEach(
item=>

item.classList.remove(
"active"
)

);





thumb.classList.add(
"active"
);



};







container.appendChild(
thumb
);



});


}









/*=========================================================
                SIZE SELECT
=========================================================*/


document
.querySelectorAll(
".size-options button"
)
.forEach(
button=>{



button.addEventListener(
"click",
()=>{


document
.querySelectorAll(
".size-options button"
)
.forEach(
btn=>

btn.classList.remove(
"active"
)

);





button.classList.add(
"active"
);




selectedSize =
button.innerText;



});


});









/*=========================================================
                QUANTITY
=========================================================*/


const qtyInput =

document.getElementById(
"quantity"
);




document
.getElementById(
"qtyPlus"
)
?.addEventListener(
"click",
()=>{


quantity++;


qtyInput.value =
quantity;


});







document
.getElementById(
"qtyMinus"
)
?.addEventListener(
"click",
()=>{


if(quantity>1){


quantity--;


qtyInput.value =
quantity;


}


});









/*=========================================================
                ADD CART
=========================================================*/


document
.getElementById(
"addToCartBtn"
)
?.addEventListener(
"click",
()=>{



if(window.cartService){



window.cartService.addToCart({

...product,

quantity,

size:selectedSize


});


}



});









/*=========================================================
                BUY NOW
=========================================================*/


document
.getElementById(
"buyNowBtn"
)
?.addEventListener(
"click",
()=>{


if(window.cartService){


window.cartService.addToCart({

...product,

quantity,

size:selectedSize


});


}



window.location.href =

"../checkout/index.html";



});









/*=========================================================
                RELATED PRODUCTS
=========================================================*/


async function loadRelatedProducts(){



const container =

document.getElementById(
"relatedProducts"
);



if(!container)
return;





const products =

await window.productService
.getProductsByCategory(
product.category
);





const related =

products
.filter(
item=>

item.id !== product.id

)
.slice(0,4);






window.productCard.renderProducts(

container,

related

);



}









loadProduct();





});