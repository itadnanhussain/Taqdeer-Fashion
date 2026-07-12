/*=========================================================
                TAQDEER FASHION
                AUTH PAGE SYSTEM
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const loginForm =
document.querySelector(
"#login-form"
);



const googleBtn =
document.querySelector(
"#google-login"
);



const message =
document.querySelector(
"#auth-message"
);







/*=========================================
        MESSAGE
=========================================*/


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
        EMAIL LOGIN
=========================================*/


if(loginForm){



loginForm.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();




    const email =
    document.querySelector(
    "#login-email"
    ).value;





    const password =
    document.querySelector(
    "#login-password"
    ).value;






    try{


        await window.AuthService
        .loginUser(
            email,
            password
        );





        showMessage(
        "Login successful",
        "success"
        );





        setTimeout(()=>{


            window.location.href =
            "../account/index.html";


        },800);




    }



    catch(error){


        showMessage(
        error.message
        );


    }



});


}







/*=========================================
        GOOGLE LOGIN
=========================================*/


if(googleBtn){



googleBtn.addEventListener(
"click",
async()=>{


    try{


        await window.AuthService
        .googleLogin();





        showMessage(
        "Google login successful",
        "success"
        );





        setTimeout(()=>{


            window.location.href =
            "../account/index.html";


        },800);



    }



    catch(error){


        showMessage(
        error.message
        );


    }



});


}








});