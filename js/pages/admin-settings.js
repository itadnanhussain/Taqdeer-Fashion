/*=========================================================
            TAQDEER FASHION
            ADMIN SETTINGS SYSTEM v2
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{





const form =
document.querySelector(
"#settings-form"
);



const message =
document.querySelector(
"#settings-message"
);



const SETTINGS_ID =
"store";






const fields = {


storeName:
document.querySelector("#store-name"),


email:
document.querySelector("#store-email"),


phone:
document.querySelector("#store-phone"),


deliveryCharge:
document.querySelector("#delivery-charge"),


freeDeliveryLimit:
document.querySelector("#free-delivery-limit"),


autoConfirm:
document.querySelector("#auto-confirm-orders"),


aiEnabled:
document.querySelector("#ai-enabled"),


maintenance:
document.querySelector("#maintenance-mode")


};









/*=========================================
        MESSAGE
=========================================*/


function showMessage(
text,
type="success"
){


if(!message)
return;



message.innerText =
text;



message.style.color =
type==="success"
?
"green"
:
"red";



}









/*=========================================
        LOAD SETTINGS
=========================================*/


async function loadSettings(){


try{


const doc =
await window.db
.collection("settings")
.doc(SETTINGS_ID)
.get();





if(doc.exists){


const data =
doc.data();





fields.storeName.value =
data.storeName || "";



fields.email.value =
data.email || "";



fields.phone.value =
data.phone || "";



fields.deliveryCharge.value =
data.deliveryCharge || 0;




fields.freeDeliveryLimit.value =
data.freeDeliveryLimit || 0;




fields.autoConfirm.checked =
data.autoConfirm || false;



fields.aiEnabled.checked =
data.aiEnabled || false;



fields.maintenance.checked =
data.maintenance || false;



}



}



catch(error){


console.error(
"Settings Load Error:",
error
);



}



}









/*=========================================
        SAVE SETTINGS
=========================================*/


if(form){


form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





try{


await window.db
.collection("settings")
.doc(SETTINGS_ID)
.set({

storeName:

fields.storeName.value,



email:

fields.email.value,



phone:

fields.phone.value,



deliveryCharge:

Number(
fields.deliveryCharge.value
),



freeDeliveryLimit:

Number(
fields.freeDeliveryLimit.value
),



autoConfirm:

fields.autoConfirm.checked,



aiEnabled:

fields.aiEnabled.checked,



maintenance:

fields.maintenance.checked,



updatedAt:

new Date()



});






showMessage(
"Settings saved successfully",
"success"
);




}



catch(error){


console.error(
"Settings Save Error:",
error
);



showMessage(
"Save failed",
"error"
);



}



});


}








loadSettings();





});