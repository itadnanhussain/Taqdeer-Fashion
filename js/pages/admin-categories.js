/*=========================================================
            TAQDEER FASHION
            ADMIN CATEGORY MANAGEMENT
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{





const categoryList =
document.querySelector(
"#categories-list"
);



const addBtn =
document.querySelector(
"#add-category-btn"
);



const formSection =
document.querySelector(
"#category-form-section"
);



const form =
document.querySelector(
"#category-form"
);







/*=========================================
        SHOW FORM
=========================================*/


if(addBtn){


addBtn.addEventListener(
"click",
()=>{


    formSection.style.display =
    formSection.style.display === "none"
    ?
    "block"
    :
    "none";


});


}







/*=========================================
        LOAD CATEGORIES
=========================================*/


async function loadCategories(){


    try{


        const snapshot =
        await window.db
        .collection("categories")
        .get();





        const categories =
        snapshot.docs.map(doc=>{


            return {

                id:doc.id,

                ...doc.data()

            };


        });





        renderCategories(categories);



    }



    catch(error){


        console.error(
        "Category Load Error:",
        error
        );


    }



}








/*=========================================
        RENDER
=========================================*/


function renderCategories(categories){



    if(!categoryList)
        return;




    categoryList.innerHTML="";






    if(!categories.length){


        categoryList.innerHTML=

        `
        <p>
        No categories found
        </p>
        `;


        return;


    }








    categories.forEach(category=>{



        const card =
        document.createElement(
            "div"
        );



        card.className =
        "admin-card";





        card.innerHTML=

        `

        <img

        src="${category.image || ''}"

        style="
        width:100%;
        height:180px;
        object-fit:cover;
        border-radius:15px;
        ">


        <h3>
        ${category.name}
        </h3>




        <button

        class="delete-category-btn"

        data-id="${category.id}">


        Delete


        </button>


        `;




        categoryList
        .appendChild(card);



    });



}









/*=========================================
        ADD CATEGORY
=========================================*/


if(form){



form.addEventListener(
"submit",
async(e)=>{


    e.preventDefault();





    const category = {


        name:
        document.querySelector(
        "#category-name"
        ).value,



        image:
        document.querySelector(
        "#category-image"
        ).value,



        createdAt:
        new Date()


    };






    await window.db
    .collection("categories")
    .add(category);






    form.reset();



    loadCategories();



});


}








/*=========================================
        DELETE CATEGORY
=========================================*/


document.addEventListener(
"click",
async(e)=>{



    if(
    e.target.classList
    .contains(
        "delete-category-btn"
    )
    ){



        const id =
        e.target.dataset.id;





        await window.db
        .collection("categories")
        .doc(id)
        .delete();





        loadCategories();



    }



});








loadCategories();






});