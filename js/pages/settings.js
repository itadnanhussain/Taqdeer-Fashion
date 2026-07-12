/*=========================================================
            TAQDEER FASHION
            ACCOUNT SETTINGS FINAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{





/*=========================================================
        DOM - COMMON ACCOUNT UI
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

const logoutBtn =
document.getElementById("logout-btn");





/*=========================================================
        STORAGE KEYS
=========================================================*/

const SETTINGS_KEY =
"taqdeerAccountSettings";





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



function toast(message,type="success"){

    let oldToast =
    document.querySelector(".settings-toast");

    if(oldToast){
        oldToast.remove();
    }

    const box =
    document.createElement("div");

    box.className =
    `settings-toast ${type}`;

    box.innerText =
    message;

    document.body.appendChild(box);

    setTimeout(()=>{

        box.classList.add("active");

    },30);

    setTimeout(()=>{

        box.classList.remove("active");

        setTimeout(()=>{

            box.remove();

        },300);

    },2600);

}



function getLocalSettings(){

    const data =
    localStorage.getItem(SETTINGS_KEY);

    if(!data){

        return {
            orderUpdates:true,
            offerAlerts:true,
            wishlistReminders:false,
            twoStep:false
        };

    }

    try{

        return JSON.parse(data);

    }

    catch(error){

        return {
            orderUpdates:true,
            offerAlerts:true,
            wishlistReminders:false,
            twoStep:false
        };

    }

}



function saveLocalSettings(settings){

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

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
        LOAD ACCOUNT USER
=========================================================*/

async function loadAccountUser(user){

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
            "Settings User Load Error:",
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

    setImage(userPhoto,finalPhoto);

    setImage(topUserPhoto,finalPhoto);

}





/*=========================================================
        SAVE SETTINGS TO FIRESTORE
=========================================================*/

async function saveSettingsToFirestore(user,settings){

    try{

        if(!window.db || !user){
            return;
        }

        await window.db
        .collection("users")
        .doc(user.uid)
        .set(
            {
                settings:settings,
                updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                merge:true
            }
        );

    }

    catch(error){

        console.error(
            "Settings Firestore Save Error:",
            error
        );

    }

}





/*=========================================================
        LOAD SETTINGS FROM FIRESTORE
=========================================================*/

async function loadSettingsFromFirestore(user){

    const localSettings =
    getLocalSettings();

    try{

        if(!window.db || !user){
            return localSettings;
        }

        const doc =
        await window.db
        .collection("users")
        .doc(user.uid)
        .get();

        if(!doc.exists){
            return localSettings;
        }

        const data =
        doc.data() || {};

        return {
            ...localSettings,
            ...(data.settings || {})
        };

    }

    catch(error){

        console.error(
            "Settings Firestore Load Error:",
            error
        );

        return localSettings;

    }

}





/*=========================================================
        APPLY TOGGLE STATE
=========================================================*/

function applyToggleState(settings){

    const toggles =
    document.querySelectorAll(".toggle-switch");

    toggles.forEach((toggle,index)=>{

        let active = false;

        if(index === 0){
            active = settings.orderUpdates;
            toggle.dataset.setting = "orderUpdates";
        }

        if(index === 1){
            active = settings.offerAlerts;
            toggle.dataset.setting = "offerAlerts";
        }

        if(index === 2){
            active = settings.wishlistReminders;
            toggle.dataset.setting = "wishlistReminders";
        }

        toggle.classList.toggle(
            "active",
            Boolean(active)
        );

    });

}





/*=========================================================
        TOGGLE EVENTS
=========================================================*/

function initToggleEvents(user,currentSettings){

    const toggles =
    document.querySelectorAll(".toggle-switch");

    toggles.forEach(toggle=>{

        toggle.addEventListener("click",async()=>{

            const key =
            toggle.dataset.setting;

            if(!key){
                return;
            }

            currentSettings[key] =
            !currentSettings[key];

            toggle.classList.toggle(
                "active",
                currentSettings[key]
            );

            saveLocalSettings(currentSettings);

            await saveSettingsToFirestore(
                user,
                currentSettings
            );

            toast("Settings updated successfully.");

        });

    });

}





/*=========================================================
        CHANGE PASSWORD
=========================================================*/

async function handleChangePassword(user){

    if(!user || !user.email){

        toast(
            "Email account not found.",
            "error"
        );

        return;

    }

    try{

        await window.auth
        .sendPasswordResetEmail(user.email);

        toast(
            "Password reset email sent."
        );

    }

    catch(error){

        console.error(
            "Password Reset Error:",
            error
        );

        toast(
            "Password reset failed. Try again.",
            "error"
        );

    }

}





/*=========================================================
        TWO STEP UI PLACEHOLDER
=========================================================*/

async function handleTwoStep(user,currentSettings){

    currentSettings.twoStep =
    !currentSettings.twoStep;

    saveLocalSettings(currentSettings);

    await saveSettingsToFirestore(
        user,
        currentSettings
    );

    toast(
        currentSettings.twoStep
        ?
        "Two-step verification marked as enabled."
        :
        "Two-step verification marked as disabled."
    );

}





/*=========================================================
        LOGIN ACTIVITY
=========================================================*/

function handleLoginActivity(user){

    const lastLogin =
    user.metadata && user.metadata.lastSignInTime
    ?
    user.metadata.lastSignInTime
    :
    "Not available";

    alert(
        `Last login:\n${lastLogin}`
    );

}





/*=========================================================
        PROFILE VISIBILITY
=========================================================*/

async function handleProfileVisibility(user){

    try{

        const settings =
        getLocalSettings();

        settings.profileVisibility =
        settings.profileVisibility === "private"
        ?
        "public"
        :
        "private";

        saveLocalSettings(settings);

        await saveSettingsToFirestore(
            user,
            settings
        );

        toast(
            `Profile visibility set to ${settings.profileVisibility}.`
        );

    }

    catch(error){

        console.error(
            "Profile Visibility Error:",
            error
        );

        toast(
            "Failed to update visibility.",
            "error"
        );

    }

}





/*=========================================================
        SAVED DATA VIEW
=========================================================*/

async function handleSavedData(user){

    try{

        if(!window.db || !user){

            toast(
                "Database not ready.",
                "error"
            );

            return;

        }

        const doc =
        await window.db
        .collection("users")
        .doc(user.uid)
        .get();

        const userData =
        doc.exists
        ?
        doc.data()
        :
        {};

        alert(
            "Saved account data:\n\n" +
            JSON.stringify(
                {
                    name:userData.name || user.displayName || "",
                    email:userData.email || user.email || "",
                    phone:userData.phone || "",
                    location:userData.location || "",
                    settings:userData.settings || {}
                },
                null,
                2
            )
        );

    }

    catch(error){

        console.error(
            "Saved Data Error:",
            error
        );

        toast(
            "Could not load saved data.",
            "error"
        );

    }

}





/*=========================================================
        DELETE ACCOUNT
=========================================================*/

async function handleDeleteAccount(user){

    const firstConfirm =
    confirm(
        "Are you sure you want to delete this account? This action is serious."
    );

    if(!firstConfirm){
        return;
    }

    const secondConfirm =
    confirm(
        "Final confirmation: delete your account data?"
    );

    if(!secondConfirm){
        return;
    }


    try{

        if(window.db && user){

            await window.db
            .collection("users")
            .doc(user.uid)
            .delete();

        }


        await user.delete();

        localStorage.removeItem(SETTINGS_KEY);

        toast(
            "Account deleted."
        );

        setTimeout(()=>{

            window.location.href =
            "../auth/login.html";

        },1200);

    }

    catch(error){

        console.error(
            "Delete Account Error:",
            error
        );

        if(error.code === "auth/requires-recent-login"){

            toast(
                "Please login again before deleting account.",
                "error"
            );

            return;

        }

        toast(
            "Account delete failed.",
            "error"
        );

    }

}





/*=========================================================
        BUTTON EVENTS
=========================================================*/

function initButtonEvents(user,currentSettings){

    const buttons =
    document.querySelectorAll(".setting-btn");

    buttons.forEach(button=>{

        const text =
        button.innerText.trim().toLowerCase();

        button.addEventListener("click",async()=>{

            if(text === "change"){

                await handleChangePassword(user);

                return;

            }

            if(text === "enable"){

                await handleTwoStep(
                    user,
                    currentSettings
                );

                button.innerText =
                currentSettings.twoStep
                ?
                "Disable"
                :
                "Enable";

                return;

            }

            if(text === "disable"){

                await handleTwoStep(
                    user,
                    currentSettings
                );

                button.innerText =
                currentSettings.twoStep
                ?
                "Disable"
                :
                "Enable";

                return;

            }

            if(text === "view"){

                handleLoginActivity(user);

                return;

            }

            if(text === "manage"){

                await handleProfileVisibility(user);

                return;

            }

            if(text === "view data"){

                await handleSavedData(user);

                return;

            }

            if(text === "delete"){

                await handleDeleteAccount(user);

                return;

            }

        });

    });

}





/*=========================================================
        LOGOUT
=========================================================*/

function initLogout(){

    if(!logoutBtn){
        return;
    }

    logoutBtn.addEventListener("click",async()=>{

        try{

            if(window.auth){

                await window.auth.signOut();

            }

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





/*=========================================================
        AUTH INIT
=========================================================*/

function initSettings(){

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


                await loadAccountUser(user);

                updateCounts();


                const currentSettings =
                await loadSettingsFromFirestore(user);

                saveLocalSettings(currentSettings);

                applyToggleState(currentSettings);

                initToggleEvents(
                    user,
                    currentSettings
                );

                initButtonEvents(
                    user,
                    currentSettings
                );

            });

        }

    },100);

}





/*=========================================================
        INIT
=========================================================*/

initSettings();

initLogout();

window.addEventListener(
    "storage",
    updateCounts
);

window.addEventListener(
    "cartUpdated",
    updateCounts
);

window.addEventListener(
    "wishlistUpdated",
    updateCounts
);

if(window.lucide){
    lucide.createIcons();
}


});