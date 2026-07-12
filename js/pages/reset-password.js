/*=========================================================
                TAQDEER FASHION
                RESET PASSWORD SYSTEM
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const form =
document.querySelector(
"#reset-form"
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
        GET ACTION CODE
=========================================*/


const params =
new URLSearchParams(
window.location.search
);



const actionCode =
params.get(
"oobCode"
);









/*=========================================
        RESET PASSWORD
=========================================*/


if(form){



form.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();





    const newPassword =
    document.querySelector(
    "#new-password"
    ).value;





    const confirmPassword =
    document.querySelector(
    "#confirm-password"
    ).value;






    if(newPassword !== confirmPassword){


        showMessage(
        "Password does not match"
        );


        return;

    }






    if(!actionCode){


        showMessage(
        "Invalid reset link"
        );


        return;


    }







    try{


        await firebase.auth()
        .confirmPasswordReset(
            actionCode,
            newPassword
        );






        showMessage(
        "Password updated successfully",
        "success"
        );






        setTimeout(()=>{


            window.location.href =
            "login.html";


        },1500);






    }



    catch(error){


        console.error(
        "Reset Password Error:",
        error
        );



        showMessage(
        error.message
        );


    }





});


}







});