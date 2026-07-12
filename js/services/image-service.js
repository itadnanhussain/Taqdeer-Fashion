/*=========================================================
        TAQDEER FASHION
        IMGBB IMAGE UPLOAD SERVICE
=========================================================*/


"use strict";


const IMGBB_API_KEY =
"e1ce1094f39a8176ede8091aae76b643";





async function uploadImage(file){


    try{


        if(!file){

            throw new Error(
                "No image selected"
            );

        }





        const formData =
        new FormData();



        formData.append(
            "image",
            file
        );







        const response =
        await fetch(

            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,

            {

                method:"POST",

                body:formData

            }

        );







        const data =
        await response.json();







        if(!data.success){


            throw new Error(
                "ImgBB upload failed"
            );


        }







        return data.data.url;





    }



    catch(error){


        console.error(
            "Image Upload Error:",
            error
        );


        throw error;


    }



}







window.ImageService = {


    uploadImage


};