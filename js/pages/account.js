/*=========================================================
            TAQDEER FASHION
            ACCOUNT SYSTEM v4
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{



const userName =
document.getElementById(
"user-name"
);


const userEmail =
document.getElementById(
"user-email"
);


const userPhoto =
document.getElementById(
"user-photo"
);


const logoutBtn =
document.getElementById(
"logout-btn"
);







/*=========================================
            AUTH CHECK
=========================================*/


function initAccount(){


if(
!window.auth ||
!window.db
){

console.error(
"Firebase not ready"
);

return;

}






window.auth.onAuthStateChanged(
async(user)=>{





console.log(
"Account Auth:",
user
);






/*
Do not redirect instantly.
Wait for Firebase state.
*/


if(!user){


console.log(
"User not logged in"
);


return;


}







try{


const userRef =
window.db
.collection("users")
.doc(user.uid);





const snapshot =
await userRef.get();





const userData =
snapshot.exists
?
snapshot.data()
:
{};







if(userName){


userName.innerText =

userData.name ||

user.displayName ||

"Taqdeer Customer";


}






if(userEmail){


userEmail.innerText =

user.email;


}






if(userPhoto){


userPhoto.src =

user.photoURL ||

userData.photo ||

"../../assets/logos/logo-1.png";


}







}



catch(error){


console.error(
"Account Load Error:",
error
);


}





});



}









/*=========================================
            LOGOUT
=========================================*/


if(logoutBtn){



logoutBtn.addEventListener(
"click",
async()=>{


try{


await window.auth
.signOut();



window.location.href =
"../auth/login.html";



}



catch(error){


console.error(
"Logout Error:",
error
);


}



});



}









/*=========================================
            INIT
=========================================*/


initAccount();




if(window.lucide){

lucide.createIcons();

}



});