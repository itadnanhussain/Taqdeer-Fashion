/*=========================================================
            TAQDEER FASHION
            PROFILE PAGE FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{


/*=========================================================
        DOM
=========================================================*/

const userPhoto =
document.getElementById("user-photo");

const userName =
document.getElementById("user-name");

const userEmail =
document.getElementById("user-email");

const topUserPhoto =
document.getElementById("top-user-photo");

const topUserName =
document.getElementById("top-user-name");

const sidebarWishlistCount =
document.getElementById("sidebar-wishlist-count");

const topWishlistCount =
document.getElementById("top-wishlist-count");

const topCartCount =
document.getElementById("top-cart-count");


const profileForm =
document.getElementById("profile-form");

const profileName =
document.getElementById("profile-name");

const profileEmail =
document.getElementById("profile-email");

const profilePhone =
document.getElementById("profile-phone");

const profileLocation =
document.getElementById("profile-location");

const profilePhotoFile =
document.getElementById("profile-photo-file");

let uploadedPhotoData =
"";

const profileBio =
document.getElementById("profile-bio");

const profileMessage =
document.getElementById("profile-message");


const previewPhoto =
document.getElementById("profile-preview-photo");

const previewName =
document.getElementById("profile-preview-name");

const previewEmail =
document.getElementById("profile-preview-email");





/*=========================================================
        HELPERS
=========================================================*/

function fallbackPhoto(){

    return "../../assets/logos/logo-1.png";

}



function setImage(element,src){

    if(!element){
        return;
    }

    element.src =
    src || fallbackPhoto();

    element.onerror = function(){

        this.onerror = null;

        this.src =
        fallbackPhoto();

    };

}



function showMessage(text,type){

    if(!profileMessage){
        return;
    }

    profileMessage.innerText =
    text;

    profileMessage.className =
    `profile-message ${type}`;

}



function updateCounts(){

    const wishlistService =
    window.WishlistService ||
    window.wishlistService;

    const cartService =
    window.CartService ||
    window.cartService;


    let wishlistCount = 0;

    if(wishlistService && wishlistService.getWishlist){

        wishlistCount =
        wishlistService.getWishlist().length;

    }


    let cartCount = 0;

    if(cartService && cartService.getCart){

        const cart =
        cartService.getCart();

        cartCount =
        cart.reduce(
            (total,item)=>
            total + Number(item.quantity || 1),
            0
        );

    }


    if(sidebarWishlistCount){
        sidebarWishlistCount.innerText = wishlistCount;
    }

    if(topWishlistCount){
        topWishlistCount.innerText = wishlistCount;
    }

    if(topCartCount){
        topCartCount.innerText = cartCount;
    }

}





/*=========================================================
        LOAD PROFILE
=========================================================*/

async function loadProfile(user){

    const authName =
    user.displayName || "Taqdeer User";

    const authEmail =
    user.email || "";

    const authPhoto =
    user.photoURL || fallbackPhoto();


    let data = {};

    try{

        if(window.db){

            const doc =
            await window.db
            .collection("users")
            .doc(user.uid)
            .get();

            if(doc.exists){

                data =
                doc.data() || {};

            }

        }

    }

    catch(error){

        console.error(
            "Profile Load Error:",
            error
        );

    }


    const finalName =
    data.name || authName;

    const finalEmail =
    data.email || authEmail;

    const finalPhoto =
    data.photoURL || authPhoto;


    if(userName){
        userName.innerText = finalName;
    }

    if(userEmail){
        userEmail.innerText = finalEmail;
    }

    if(topUserName){
        topUserName.innerText = finalName;
    }

    if(previewName){
        previewName.innerText = finalName;
    }

    if(previewEmail){
        previewEmail.innerText = finalEmail;
    }


    setImage(userPhoto,finalPhoto);

    setImage(topUserPhoto,finalPhoto);

    setImage(previewPhoto,finalPhoto);


    if(profileName){
        profileName.value = finalName;
    }

    if(profileEmail){
        profileEmail.value = finalEmail;
    }

    if(profilePhone){
        profilePhone.value = data.phone || "";
    }

    if(profileLocation){
        profileLocation.value = data.location || "";
    }

    uploadedPhotoData =
data.photoURL || user.photoURL || "";

    if(profileBio){
        profileBio.value = data.bio || "";
    }

}





/*=========================================================
        LIVE PREVIEW
=========================================================*/

if(profileName){

    profileName.addEventListener("input",()=>{

        if(previewName){
            previewName.innerText =
            profileName.value || "Taqdeer User";
        }

        if(userName){
            userName.innerText =
            profileName.value || "Taqdeer User";
        }

        if(topUserName){
            topUserName.innerText =
            profileName.value || "Account";
        }

    });

}



if(profilePhotoFile){

    profilePhotoFile.addEventListener("change",()=>{

        const file =
        profilePhotoFile.files[0];

        if(!file){
            return;
        }

        if(!file.type.startsWith("image/")){

            showMessage(
                "Please upload a valid image file.",
                "error"
            );

            return;

        }

        if(file.size > 700 * 1024){

            showMessage(
                "Image is too large. Please upload below 700KB.",
                "error"
            );

            profilePhotoFile.value = "";

            return;

        }

        const reader =
        new FileReader();

        reader.onload = ()=>{

            uploadedPhotoData =
            reader.result;

            setImage(previewPhoto,uploadedPhotoData);

            setImage(userPhoto,uploadedPhotoData);

            setImage(topUserPhoto,uploadedPhotoData);

            showMessage(
                "Photo selected. Click Save Changes to update.",
                "success"
            );

        };

        reader.readAsDataURL(file);

    });

}





/*=========================================================
        SAVE PROFILE
=========================================================*/

async function saveProfile(user){

    const name =
    profileName.value.trim();

    const phone =
    profilePhone.value.trim();

    const location =
    profileLocation.value.trim();

    const photoURL =
uploadedPhotoData || user.photoURL || "";

    const bio =
    profileBio.value.trim();


    if(!name){

        showMessage(
            "Name is required.",
            "error"
        );

        return;

    }


    try{

        showMessage(
            "Saving profile...",
            "success"
        );


        if(user.updateProfile){

            await user.updateProfile({

                displayName:name,

                photoURL:
                photoURL || user.photoURL || ""

            });

        }


        if(window.db){

            await window.db
            .collection("users")
            .doc(user.uid)
            .set(
                {
                    uid:user.uid,
                    name:name,
                    email:user.email || "",
                    phone:phone,
                    location:location,
                    photoURL:
                    photoURL || user.photoURL || "",
                    bio:bio,
                    updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()
                },
                {
                    merge:true
                }
            );

        }


        showMessage(
            "Profile updated successfully.",
            "success"
        );


        await loadProfile(user);

    }

    catch(error){

        console.error(
            "Profile Save Error:",
            error
        );

        showMessage(
            "Profile update failed. Check console.",
            "error"
        );

    }

}





/*=========================================================
        AUTH INIT
=========================================================*/

function initProfile(){

    const waitForAuth =
    setInterval(()=>{

        if(window.auth && window.auth.onAuthStateChanged){

            clearInterval(waitForAuth);

            window.auth.onAuthStateChanged(async user=>{

                if(!user){

                    window.location.href =
                    "../auth/login.html";

                    return;

                }


                await loadProfile(user);

                updateCounts();


                if(profileForm){

                    profileForm.addEventListener("submit",async e=>{

                        e.preventDefault();

                        await saveProfile(user);

                    });

                }

            });

        }

    },100);

}





/*=========================================================
        LOGOUT
=========================================================*/

const logoutBtn =
document.getElementById("logout-btn");

if(logoutBtn){

    logoutBtn.addEventListener("click",async()=>{

        if(window.auth){

            await window.auth.signOut();

            window.location.href =
            "../auth/login.html";

        }

    });

}





/*=========================================================
        INIT
=========================================================*/

initProfile();

window.addEventListener("storage",updateCounts);

window.addEventListener("cartUpdated",updateCounts);

window.addEventListener("wishlistUpdated",updateCounts);

if(window.lucide){
    lucide.createIcons();
}


});