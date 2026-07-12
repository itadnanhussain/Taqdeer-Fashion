/*=========================================================
        TAQDEER FASHION
        ADMIN DASHBOARD SYSTEM
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{



const revenueCount =
document.getElementById(
"total-revenue"
);


const profitCount =
document.getElementById(
"total-profit"
);


const ordersCount =
document.getElementById(
"total-orders"
);


const usersCount =
document.getElementById(
"total-users"
);


const recentOrders =
document.getElementById(
"recent-orders-list"
);


const logoutBtn =
document.getElementById(
"admin-logout"
);








/*==============================
        ADMIN AUTH CHECK
==============================*/


function checkAdmin(){



return new Promise(
(resolve)=>{


window.auth
.onAuthStateChanged(
async(user)=>{



if(!user){


window.location.href =
"../auth/login.html";


resolve(false);

return;


}






const userDoc =
await window.db
.collection("users")
.doc(user.uid)
.get();






if(
!userDoc.exists ||
userDoc.data().role !== "admin"
){


window.location.href =
"../account/index.html";


resolve(false);

return;


}





resolve(true);





});



});



}









/*==============================
        LOAD DASHBOARD
==============================*/


async function loadDashboard(){


const allowed =
await checkAdmin();



if(!allowed)
return;





try{


const ordersSnapshot =
await window.db
.collection("orders")
.get();





let revenue = 0;

let profit = 0;

let orders=[];





ordersSnapshot.forEach(
doc=>{


const order =
{

id:doc.id,

...doc.data()

};



orders.push(order);



revenue +=
Number(
order.total || 0
);



profit +=
Number(
order.profit || 0
);



});







if(revenueCount)

revenueCount.innerText =
"৳"+revenue.toLocaleString();






if(profitCount)

profitCount.innerText =
"৳"+profit.toLocaleString();






if(ordersCount)

ordersCount.innerText =
orders.length;







const usersSnapshot =
await window.db
.collection("users")
.get();






if(usersCount)

usersCount.innerText =
usersSnapshot.size;






renderOrders(
orders.slice(0,5)
);




}



catch(error){


console.error(
"Dashboard Error:",
error
);



}



}









/*==============================
        RECENT ORDERS
==============================*/


function renderOrders(
orders
){


if(!recentOrders)
return;



recentOrders.innerHTML="";





if(!orders.length){


recentOrders.innerHTML=

`
<p>
No orders found
</p>
`;

return;


}







orders.forEach(
order=>{


const div =
document.createElement(
"div"
);



div.className =
"admin-order-item";




div.innerHTML = `


<div>

<strong>
#${order.id}
</strong>


<p>
${order.paymentMethod || "COD"}
</p>


</div>




<div>

<strong>
৳${order.total || 0}
</strong>


<span class="status ${order.status || "pending"}">

${order.status || "Pending"}

</span>


</div>

`;



recentOrders
.appendChild(div);



});



}








/*==============================
        LOGOUT
==============================*/


if(logoutBtn){


logoutBtn.addEventListener(
"click",
async()=>{


await window.auth
.signOut();



window.location.href =
"../auth/login.html";


});


}







loadDashboard();



});