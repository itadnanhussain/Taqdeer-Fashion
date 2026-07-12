/*=========================================================
                TAQDEER FASHION
                ORDER SERVICE v2
=========================================================*/


"use strict";



const ORDERS_COLLECTION = "orders";







/*=========================================
        CREATE ORDER
=========================================*/


async function createOrder(orderData){


try{


if(!window.db){

throw new Error(
"Firebase database not initialized"
);

}






const user =
window.auth.currentUser;






if(!user){


throw new Error(
"User must login before ordering"
);


}









const order = {


userId:
user.uid,



customer:
{

name:
orderData.customer.name || "",


phone:
orderData.customer.phone || "",


email:
orderData.customer.email || "",


address:
orderData.customer.address || ""


},





items:
orderData.items || [],





subtotal:
Number(
orderData.subtotal || 0
),




delivery:
Number(
orderData.delivery || 0
),




total:
Number(
orderData.total || 0
),






paymentMethod:
orderData.paymentMethod || "COD",






status:
"pending",





createdAt:
firebase.firestore
.FieldValue
.serverTimestamp(),





updatedAt:
firebase.firestore
.FieldValue
.serverTimestamp()




};








const orderRef =
await window.db
.collection(
ORDERS_COLLECTION
)
.add(
order
);








console.log(
"Order Created:",
orderRef.id
);






return orderRef.id;




}





catch(error){


console.error(
"Order Create Error:",
error
);



throw error;



}



}









/*=========================================
        GET USER ORDERS
=========================================*/


async function getUserOrders(){



try{


const user =
window.auth.currentUser;





if(!user){


return [];


}







const snapshot =
await window.db
.collection(
ORDERS_COLLECTION
)
.where(
"userId",
"==",
user.uid
)
.orderBy(
"createdAt",
"desc"
)
.get();








return snapshot.docs.map(
doc=>({


id:
doc.id,


...doc.data()



})

);





}

catch(error){


console.error(
"Get Orders Error:",
error
);


return [];



}



}









/*=========================================
        GET SINGLE ORDER
=========================================*/


async function getOrderById(
orderId
){



try{


const doc =
await window.db
.collection(
ORDERS_COLLECTION
)
.doc(
orderId
)
.get();






if(!doc.exists){


return null;


}







return {


id:
doc.id,


...doc.data()


};





}

catch(error){


console.error(
"Single Order Error:",
error
);


return null;



}



}









/*=========================================
        UPDATE ORDER STATUS
=========================================*/


async function updateOrderStatus(
orderId,
status
){



try{


await window.db
.collection(
ORDERS_COLLECTION
)
.doc(
orderId
)
.update({


status,


updatedAt:
firebase.firestore
.FieldValue
.serverTimestamp()



});





return true;




}

catch(error){


console.error(
"Status Update Error:",
error
);


return false;


}



}









/*=========================================
        EXPORT
=========================================*/


window.OrderService = {


createOrder,

getUserOrders,

getOrderById,

updateOrderStatus


};