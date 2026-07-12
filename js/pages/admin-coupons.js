/*=========================================================
            TAQDEER FASHION
            ADMIN COUPON MANAGEMENT v2
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{



const couponList =
document.querySelector(
"#coupon-list"
);



const addBtn =
document.querySelector(
"#add-coupon-btn"
);



const formSection =
document.querySelector(
"#coupon-form-section"
);



const form =
document.querySelector(
"#coupon-form"
);




let editCouponId = null;









/*=========================================
        SHOW FORM
=========================================*/


if(addBtn){


addBtn.addEventListener(
"click",
()=>{


formSection.style.display =
formSection.style.display === "none"
?
"block"
:
"none";


});


}









/*=========================================
        LOAD COUPONS
=========================================*/


async function loadCoupons(){


try{


const snapshot =
await window.db
.collection("coupons")
.orderBy(
"createdAt",
"desc"
)
.get();





const coupons =
snapshot.docs.map(
doc=>({

id:doc.id,

...doc.data()

})
);





renderCoupons(
coupons
);



}



catch(error){


console.error(
"Coupon Load Error:",
error
);


}



}









/*=========================================
        RENDER COUPONS
=========================================*/


function renderCoupons(coupons){



if(!couponList)
return;




couponList.innerHTML="";





if(!coupons.length){


couponList.innerHTML=`

<p>
No Coupons Found
</p>

`;

return;


}






coupons.forEach(
coupon=>{


const card =
document.createElement(
"div"
);



card.className =
"admin-card";





card.innerHTML=`


<h3>

${coupon.code}

</h3>





<p>

Discount:

${
coupon.type==="percentage"
?
coupon.value+"%"
:
"৳"+coupon.value
}

</p>





<p>

Minimum:

৳${coupon.minimumPurchase || 0}

</p>





<p>

Expiry:

${coupon.expiryDate || "N/A"}

</p>





<p>

Status:

<strong>

${coupon.status || "active"}

</strong>

</p>







<button

class="edit-coupon-btn"

data-id="${coupon.id}">

Edit

</button>







<button

class="toggle-coupon-btn"

data-id="${coupon.id}">

${
coupon.status==="disabled"
?
"Enable"
:
"Disable"
}

</button>







<button

class="delete-coupon-btn"

data-id="${coupon.id}">

Delete

</button>




`;





couponList
.appendChild(card);



});



}









/*=========================================
        SAVE COUPON
=========================================*/


if(form){



form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





const couponData = {



code:

document.querySelector(
"#coupon-code"
)
.value
.toUpperCase(),





type:

document.querySelector(
"#discount-type"
)
.value,





value:

Number(
document.querySelector(
"#discount-value"
)
.value
),





minimumPurchase:

Number(
document.querySelector(
"#minimum-purchase"
)
?.value || 0
),





expiryDate:

document.querySelector(
"#coupon-expiry"
)
.value,





status:

"active",





updatedAt:

new Date()


};








if(editCouponId){



await window.db
.collection("coupons")
.doc(editCouponId)
.update(
couponData
);



editCouponId=null;



}



else{



couponData.createdAt =
new Date();



await window.db
.collection("coupons")
.add(
couponData
);



}







form.reset();


formSection.style.display =
"none";



loadCoupons();



});



}









/*=========================================
        EDIT COUPON
=========================================*/


document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList
.contains(
"edit-coupon-btn"
)

){



const id =
e.target.dataset.id;



const doc =
await window.db
.collection("coupons")
.doc(id)
.get();





const coupon =
doc.data();





editCouponId =
id;






document.querySelector(
"#coupon-code"
)
.value =
coupon.code || "";





document.querySelector(
"#discount-type"
)
.value =
coupon.type || "percentage";





document.querySelector(
"#discount-value"
)
.value =
coupon.value || "";





document.querySelector(
"#minimum-purchase"
)
.value =
coupon.minimumPurchase || "";





document.querySelector(
"#coupon-expiry"
)
.value =
coupon.expiryDate || "";






formSection.style.display =
"block";



}



});









/*=========================================
        ENABLE DISABLE
=========================================*/


document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList
.contains(
"toggle-coupon-btn"
)

){



const id =
e.target.dataset.id;




const doc =
await window.db
.collection("coupons")
.doc(id)
.get();





const coupon =
doc.data();





await window.db
.collection("coupons")
.doc(id)
.update({

status:

coupon.status==="disabled"
?
"active"
:
"disabled",


updatedAt:
new Date()

});





loadCoupons();



}



});









/*=========================================
        DELETE
=========================================*/


document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList
.contains(
"delete-coupon-btn"
)

){



const id =
e.target.dataset.id;




await window.db
.collection("coupons")
.doc(id)
.delete();





loadCoupons();



}



});







loadCoupons();





});