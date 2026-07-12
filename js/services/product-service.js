/*=========================================================
            TAQDEER FASHION
            PRODUCT SERVICE
            Firebase Product System v2.0
=========================================================*/


"use strict";



/*=========================================================
                GET ALL PRODUCTS
=========================================================*/


async function getProducts(){


try{


const snapshot =
await window.db
.collection("products")
.get();



const products = [];



snapshot.forEach(doc=>{


products.push({

id:doc.id,

...doc.data()


});


});



return products;



}

catch(error){


console.error(
"Get Products Error:",
error
);


return [];


}


}








/*=========================================================
                GET SINGLE PRODUCT
=========================================================*/


async function getProductById(id){


try{


const doc =
await window.db
.collection("products")
.doc(id)
.get();




if(!doc.exists){


return null;


}




return {


id:doc.id,

...doc.data()


};



}

catch(error){


console.error(
"Single Product Error:",
error
);



return null;


}


}








/*=========================================================
                GET PRODUCTS BY CATEGORY
=========================================================*/


async function getProductsByCategory(category){


try{


const snapshot =
await window.db
.collection("products")
.where(
"category",
"==",
category
)
.get();



const products=[];



snapshot.forEach(doc=>{


products.push({

id:doc.id,

...doc.data()


});


});



return products;



}

catch(error){


console.error(
"Category Error:",
error
);


return [];


}


}








/*=========================================================
                GET FEATURED PRODUCTS
=========================================================*/


async function getFeaturedProducts(){


try{


const snapshot =
await window.db
.collection("products")
.where(
"featured",
"==",
true
)
.limit(8)
.get();



const products=[];



snapshot.forEach(doc=>{


products.push({

id:doc.id,

...doc.data()


});


});



return products;


}

catch(error){


console.error(
"Featured Error:",
error
);



return [];


}


}








/*=========================================================
                IMAGE FALLBACK
=========================================================*/


function handleProductImage(img){


if(!img)
return;



img.onerror=function(){


this.onerror=null;


this.src=
"assets/placeholders/product.jpg";


};



}








/*=========================================================
                EXPORT GLOBAL
=========================================================*/


window.productService={


getProducts,

getProductById,

getProductsByCategory,

getFeaturedProducts,

handleProductImage


};