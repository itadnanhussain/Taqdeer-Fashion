/*=========================================================
                TAQDEER FASHION
                LOGIN SYSTEM v4
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const loginForm =
document.getElementById(
"login-form"
);



const googleBtn =
document.getElementById(
"google-login"
);



const message =
document.getElementById(
"auth-message"
);









/*=========================================
        ALREADY LOGIN CHECK
=========================================*/


async function checkExistingUser(){


if(
!window.auth ||
!window.db
)
return;



window.auth.onAuthStateChanged(
async(user)=>{


if(!user)
return;




try{


const snapshot =
await window.db
.collection("users")
.doc(user.uid)
.get();





if(snapshot.exists){



const data =
snapshot.data();





if(data.role === "admin"){



window.location.replace(
"../admin/index.html"
);



}

else{


window.location.replace(
"../account/index.html"
);



}



}



}

catch(error){


console.error(
"User Check Error:",
error
);


}



});


}







checkExistingUser();









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
        REDIRECT AFTER LOGIN
=========================================*/


async function redirectUser(
user
){



try{



const snapshot =
await window.db
.collection("users")
.doc(user.uid)
.get();





if(!snapshot.exists){



window.location.replace(
"../account/index.html"
);


return;


}






const data =
snapshot.data();






if(data.role === "admin"){


window.location.replace(
"../admin/index.html"
);


}

else{


window.location.replace(
"../account/index.html"
);


}



}



catch(error){


console.error(
"Redirect Error:",
error
);



window.location.replace(
"../account/index.html"
);



}


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
document
.getElementById(
"login-email"
)
.value
.trim();





const password =
document
.getElementById(
"login-password"
)
.value;






try{



const user =
await window.AuthService
.loginUser(
email,
password
);





showMessage(
"Login Successful",
"success"
);






setTimeout(
()=>{


redirectUser(
user
);



},
500
);






}



catch(error){



console.error(
error
);



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



const user =
await window.AuthService
.googleLogin();






showMessage(
"Google Login Successful",
"success"
);






setTimeout(
()=>{


redirectUser(
user
);



},
500
);





}

catch(error){



console.error(
error
);



showMessage(
error.message
);



}



});


}







});