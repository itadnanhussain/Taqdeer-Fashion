/*=========================================================
            TAQDEER FASHION
            ADMIN ANALYTICS SYSTEM
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{





const chartElement =
document.querySelector(
"#sales-chart"
);



const topProductsList =
document.querySelector(
"#top-products-list"
);





/*=========================================
        LOAD ANALYTICS
=========================================*/


async function loadAnalytics(){


try{


const snapshot =
await window.db
.collection("orders")
.get();





const orders =
snapshot.docs.map(
doc=>({

id:doc.id,

...doc.data()

})
);





createSalesChart(
orders
);



loadTopProducts(
orders
);



}




catch(error){


console.error(
"Analytics Error:",
error
);


}



}







/*=========================================
        SALES CHART
=========================================*/


function createSalesChart(orders){



if(!chartElement)
return;





const monthlySales = {

Jan:0,
Feb:0,
Mar:0,
Apr:0,
May:0,
Jun:0,
Jul:0,
Aug:0,
Sep:0,
Oct:0,
Nov:0,
Dec:0

};





orders.forEach(
order=>{


const date =
order.createdAt
?
new Date(
order.createdAt.seconds
?
order.createdAt.seconds * 1000
:
order.createdAt
)
:
new Date();





const month =
date.toLocaleString(
"en-US",
{
month:"short"
}
);





monthlySales[month] +=
Number(
order.total || 0
);



});







new Chart(
chartElement,
{


type:"line",



data:{


labels:
Object.keys(
monthlySales
),



datasets:[{


label:
"Revenue",



data:
Object.values(
monthlySales
),



borderWidth:3,



tension:.4



}]



},





options:{


responsive:true,


plugins:{


legend:{


display:true


}


}



}



}

);



}









/*=========================================
        TOP PRODUCTS
=========================================*/


function loadTopProducts(orders){



if(!topProductsList)
return;





const products={};





orders.forEach(
order=>{


order.items?.forEach(
item=>{


if(!products[item.name]){


products[item.name]=0;


}



products[item.name] +=
item.quantity || 1;



});


});






const sorted =
Object.entries(products)
.sort(
(a,b)=>b[1]-a[1]
)
.slice(0,5);






topProductsList.innerHTML="";





sorted.forEach(
product=>{


const div =
document.createElement(
"div"
);



div.className =
"top-product-item";




div.innerHTML=`

<strong>
${product[0]}
</strong>


<span>
${product[1]} sold
</span>


`;





topProductsList
.appendChild(div);



});



}







loadAnalytics();





});