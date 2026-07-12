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
/*=========================================================
        PRODUCT COLOR VARIANT ACTIVE
=========================================================*/

document.addEventListener("click",(e)=>{

    const variant =
    e.target.closest(".color-variant");

    if(!variant){
        return;
    }

    document
    .querySelectorAll(".color-variant")
    .forEach(btn=>{

        btn.classList.remove("active");

    });

    variant.classList.add("active");

});
/*=========================================================
        PRODUCT DETAILS DYNAMIC EXTRA SECTIONS
=========================================================*/

function getProductImagePath(path){

    const fallback =
    "../../assets/placeholders/product.jpg";

    if(!path){
        return fallback;
    }

    if(
        path.startsWith("http") ||
        path.startsWith("data:") ||
        path.startsWith("../../") ||
        path.startsWith("../")
    ){
        return path;
    }

    if(path.startsWith("assets/")){
        return "../../" + path;
    }

    return fallback;

}





function getColorDot(color){

    const map = {
        blue:"#88a9c9",
        black:"#111111",
        maroon:"#6f1d2d",
        white:"#ffffff",
        red:"#b91c1c",
        green:"#3f6b46",
        navy:"#172554",
        grey:"#9ca3af",
        gray:"#9ca3af",
        cream:"#eadfc8",
        brown:"#7c4a2d"
    };

    const key =
    String(color || "")
    .toLowerCase()
    .trim();

    return map[key] || "#2f3a45";

}





function renderProductColors(product){

    const section =
    document.getElementById("color-section");

    const list =
    document.getElementById("color-variant-list");

    if(!section || !list){
        return;
    }


    const colors =
    product.colors ||
    product.variants ||
    product.colorVariants ||
    [];


    if(!Array.isArray(colors) || colors.length === 0){

        section.style.display = "none";

        return;

    }


    section.style.display = "block";

    list.innerHTML = "";


    colors.forEach((item,index)=>{

        const colorName =
        item.name ||
        item.color ||
        item.title ||
        `Color ${index + 1}`;

        const image =
        getProductImagePath(
            item.image ||
            item.photo ||
            item.imageUrl ||
            product.image
        );

        const dot =
        item.hex ||
        item.colorCode ||
        getColorDot(colorName);


        const button =
        document.createElement("button");

        button.type =
        "button";

        button.className =
        index === 0
        ?
        "color-variant active"
        :
        "color-variant";

        button.dataset.image =
        image;

        button.dataset.color =
        colorName;

        button.innerHTML = `

            <span class="variant-img">
                <img src="${image}" alt="${colorName}">
            </span>

            <span class="variant-color-dot" style="background:${dot};"></span>

            <strong>${colorName}</strong>

        `;

        list.appendChild(button);

    });

}





function renderProductDescription(product){

    const section =
    document.getElementById("description-section");

    const text =
    document.getElementById("product-description-text");

    if(!section || !text){
        return;
    }


    const description =
    product.description ||
    product.details ||
    product.longDescription ||
    "";


    if(!description.trim()){

        section.style.display = "none";

        return;

    }


    section.style.display = "block";

    text.innerText =
    description;

}





/*=========================================================
        COLOR CLICK + MAIN IMAGE CHANGE
=========================================================*/

document.addEventListener("click",(e)=>{

    const variant =
    e.target.closest(".color-variant");

    if(!variant){
        return;
    }


    document
    .querySelectorAll(".color-variant")
    .forEach(btn=>{

        btn.classList.remove("active");

    });


    variant.classList.add("active");


    const image =
    variant.dataset.image;

    const mainImage =
    document.getElementById("main-product-image");

    if(image && mainImage){

        mainImage.src =
        image;

    }

});





/*=========================================================
        PRODUCT IMAGE FULLSCREEN
=========================================================*/

document.addEventListener("DOMContentLoaded",()=>{

    const mainImage =
    document.getElementById("main-product-image");

    const lightbox =
    document.getElementById("product-lightbox");

    const lightboxImage =
    document.getElementById("lightbox-image");

    const closeBtn =
    document.getElementById("lightbox-close");


    if(mainImage && lightbox && lightboxImage){

        mainImage.addEventListener("click",()=>{

            lightboxImage.src =
            mainImage.src;

            lightbox.classList.add("active");

            document.body.style.overflow =
            "hidden";

        });

    }


    function closeLightbox(){

        if(!lightbox){
            return;
        }

        lightbox.classList.remove("active");

        document.body.style.overflow =
        "";

    }


    if(closeBtn){

        closeBtn.addEventListener("click",closeLightbox);

    }


    if(lightbox){

        lightbox.addEventListener("click",(e)=>{

            if(e.target === lightbox){

                closeLightbox();

            }

        });

    }


    document.addEventListener("keydown",(e)=>{

        if(e.key === "Escape"){

            closeLightbox();

        }

    });

});