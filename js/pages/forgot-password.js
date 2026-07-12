/*=========================================================
                TAQDEER FASHION
                FORGOT PASSWORD SYSTEM
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const form =
document.querySelector(
"#forgot-form"
);



const message =
document.querySelector(
"#auth-message"
);







function showMessage(
text,
type="error"
){


    if(!message)
        return;



    message.innerText =
    text;



    message.className =
    type === "success"
    ?
    "auth-success"
    :
    "auth-error";


}







/*=========================================
        RESET PASSWORD
=========================================*/


if(form){



form.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();





    const email =
    document.querySelector(
    "#forgot-email"
    ).value;






    try{


        await window.AuthService
        .resetPassword(email);






        showMessage(
        "Password reset link sent to your email",
        "success"
        );





    }



    catch(error){


        showMessage(
        error.message
        );



    }





});


}







});