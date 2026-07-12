/*=========================================================
                TAQDEER FASHION
                AUTH SERVICE v3
=========================================================*/


"use strict";





/*=========================================
            REGISTER USER
=========================================*/


async function registerUser(
email,
password,
userData = {}
){


try{


const result =
await window.auth
.createUserWithEmailAndPassword(
email,
password
);



const user =
result.user;





await window.db
.collection("users")
.doc(user.uid)
.set({

uid:user.uid,

email:user.email,

name:
userData.name || "",

phone:
userData.phone || "",

photo:
"",

role:
"customer",

createdAt:
firebase.firestore.FieldValue.serverTimestamp()


});




return user;



}

catch(error){


console.error(
"Register Error:",
error
);


throw error;


}


}









/*=========================================
            EMAIL LOGIN
=========================================*/


async function loginUser(
email,
password
){


try{


const result =
await window.auth
.signInWithEmailAndPassword(
email,
password
);



return result.user;



}

catch(error){


console.error(
"Login Error:",
error
);


throw error;


}


}









/*=========================================
            GOOGLE LOGIN
=========================================*/


async function googleLogin(){


try{


const provider =
new firebase.auth.GoogleAuthProvider();




const result =
await window.auth
.signInWithPopup(
provider
);



const user =
result.user;






const userRef =
window.db
.collection("users")
.doc(user.uid);






const snapshot =
await userRef.get();






/*
    Only create new user.
    Existing role will never change.
*/


if(!snapshot.exists){



await userRef.set({

uid:user.uid,

email:user.email,

name:
user.displayName || "",

photo:
user.photoURL || "",

role:
"customer",

createdAt:
firebase.firestore.FieldValue.serverTimestamp()


});


}






return user;



}

catch(error){


console.error(
"Google Login Error:",
error
);


throw error;


}


}









/*=========================================
            GET CURRENT USER DATA
=========================================*/


async function getCurrentUserData(){


const user =
window.auth.currentUser;



if(!user){

return null;

}





const snapshot =
await window.db
.collection("users")
.doc(user.uid)
.get();





if(snapshot.exists){


return snapshot.data();


}



return null;



}









/*=========================================
            LOGOUT
=========================================*/


async function logoutUser(){


try{


await window.auth.signOut();



}

catch(error){


console.error(
"Logout Error:",
error
);


throw error;


}


}









/*=========================================
            RESET PASSWORD
=========================================*/


async function resetPassword(email){


return await window.auth
.sendPasswordResetEmail(
email
);


}









/*=========================================
            EXPORT
=========================================*/


window.AuthService = {


registerUser,

loginUser,

googleLogin,

getCurrentUserData,

logoutUser,

resetPassword


};