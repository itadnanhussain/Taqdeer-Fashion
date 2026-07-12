/*=========================================================
            TAQDEER FASHION
            FIREBASE STORAGE SERVICE
=========================================================*/


"use strict";





async function uploadImage(
file,
folder="products"
){


try{


if(!file){

throw new Error(
"No image selected"
);

}





const storageRef =
firebase
.storage()
.ref();






const imageRef =
storageRef
.child(

`${folder}/${Date.now()}_${file.name}`

);







const snapshot =
await imageRef
.put(file);







const downloadURL =
await snapshot.ref
.getDownloadURL();







return downloadURL;





}



catch(error){


console.error(
"Image Upload Error:",
error
);



throw error;


}



}









window.StorageService = {


uploadImage


};