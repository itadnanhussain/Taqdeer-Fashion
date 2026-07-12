/*=========================================================
                TAQDEER FASHION
                REGISTER PAGE SYSTEM
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const registerForm =
document.querySelector(
"#register-form"
);



const googleRegister =
document.querySelector(
"#google-register"
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
        REGISTER
=========================================*/


if(registerForm){



registerForm.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();





    const name =
    document.querySelector(
    "#register-name"
    ).value;




    const email =
    document.querySelector(
    "#register-email"
    ).value;




    const phone =
    document.querySelector(
    "#register-phone"
    ).value;




    const password =
    document.querySelector(
    "#register-password"
    ).value;




    const confirmPassword =
    document.querySelector(
    "#register-confirm"
    ).value;







    if(password !== confirmPassword){


        showMessage(
        "Password does not match"
        );


        return;


    }








    try{


        await window.AuthService
        .registerUser(

            email,

            password,

            {

                name,

                phone

            }

        );






        showMessage(
        "Account created successfully",
        "success"
        );







        setTimeout(()=>{


            window.location.href =
            "../account/index.html";


        },1000);






    }



    catch(error){


        showMessage(
        error.message
        );


    }





});


}









/*=========================================
        GOOGLE REGISTER
=========================================*/


if(googleRegister){



googleRegister.addEventListener(
"click",
async()=>{


    try{


        await window.AuthService
        .googleLogin();





        showMessage(
        "Google account created",
        "success"
        );





        setTimeout(()=>{


            window.location.href =
            "../account/index.html";


        },1000);





    }



    catch(error){


        showMessage(
        error.message
        );


    }



});


}







});