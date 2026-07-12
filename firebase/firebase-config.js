/*=========================================================
                TAQDEER FASHION
                FIREBASE CONFIG v4
=========================================================*/


"use strict";



/*=========================================
            FIREBASE CONFIG
=========================================*/


const firebaseConfig = {


    apiKey:
    "AIzaSyCRXn7COpUAKI8ycCgPZjNqWwPaRfGfzAo",


    authDomain:
    "taqdeer-fashion.firebaseapp.com",


    projectId:
    "taqdeer-fashion",


    storageBucket:
    "taqdeer-fashion.appspot.com",


    messagingSenderId:
    "405037607966",


    appId:
    "1:405037607966:web:8e0a48f4753a1eba43520f"


};









/*=========================================
        INITIALIZE FIREBASE
=========================================*/


if(!firebase.apps.length){


    firebase.initializeApp(
        firebaseConfig
    );


}









/*=========================================
        GLOBAL SERVICES
=========================================*/


window.auth =
firebase.auth();



window.db =
firebase.firestore();









/*=========================================
        AUTH PERSISTENCE
=========================================*/


window.auth
.setPersistence(
    firebase.auth.Auth.Persistence.LOCAL
)

.then(()=>{


    console.log(
        "Firebase Auth Persistence Enabled"
    );


})

.catch(error=>{


    console.error(
        "Auth Persistence Error:",
        error
    );


});









/*=========================================
        CONNECTION TEST
=========================================*/


console.log(
"Firebase Connected Successfully"
);