/*=========================================================
                TAQDEER FASHION
                PROFILE EDIT SYSTEM
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{





const profileForm =
document.querySelector(
"#profile-form"
);



const nameInput =
document.querySelector(
"#profile-name"
);



const phoneInput =
document.querySelector(
"#profile-phone"
);



const addressInput =
document.querySelector(
"#profile-address"
);



const previewImage =
document.querySelector(
"#profile-preview"
);



const message =
document.querySelector(
"#profile-message"
);







let currentUser = null;








/*=========================================
        LOAD PROFILE
=========================================*/


async function loadProfile(){


    try{


        currentUser =
        window.auth.currentUser;



        if(!currentUser){


            window.location.href =
            "../auth/login.html";


            return;

        }





        const userDoc =
        await window.db
        .collection("users")
        .doc(currentUser.uid)
        .get();






        if(userDoc.exists){


            const data =
            userDoc.data();



            nameInput.value =
            data.name || "";



            phoneInput.value =
            data.phone || "";



            addressInput.value =
            data.address || "";





            if(
                data.photo &&
                previewImage
            ){

                previewImage.src =
                data.photo;

            }


        }



    }



    catch(error){


        console.error(
        "Profile Load Error:",
        error
        );


    }



}








/*=========================================
        UPDATE PROFILE
=========================================*/


if(profileForm){



profileForm.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();





    try{


        const updateData = {



            name:
            nameInput.value,



            phone:
            phoneInput.value,



            address:
            addressInput.value,



            updatedAt:
            new Date()


        };






        await window.db
        .collection("users")
        .doc(currentUser.uid)
        .update(
            updateData
        );






        showMessage(
            "Profile updated successfully",
            "success"
        );



    }



    catch(error){


        console.error(
        "Profile Update Error:",
        error
        );



        showMessage(
        "Update failed",
        "error"
        );


    }



});


}








/*=========================================
        MESSAGE
=========================================*/


function showMessage(
text,
type
){


    if(!message)
        return;



    message.innerText =
    text;



    message.className =
    type === "success"
    ?
    "profile-success"
    :
    "profile-error";



}







loadProfile();






});