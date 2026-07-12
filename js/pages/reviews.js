/*=========================================================
        TAQDEER FASHION
        PRODUCT REVIEW SYSTEM
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{





const reviewList =
document.querySelector(
"#review-list"
);



const ratingSelect =
document.querySelector(
"#review-rating"
);



const reviewText =
document.querySelector(
"#review-text"
);



const submitBtn =
document.querySelector(
"#submit-review"
);







const params =
new URLSearchParams(
window.location.search
);



const productId =
params.get("id");








/*=========================================
        LOAD REVIEWS
=========================================*/


async function loadReviews(){


    try{


        const snapshot =
        await window.db
        .collection("reviews")
        .where(
            "productId",
            "==",
            productId
        )
        .get();





        renderReviews(
            snapshot.docs
            .map(doc=>({

                id:doc.id,

                ...doc.data()

            }))
        );



    }



    catch(error){


        console.error(
        "Review Load Error:",
        error
        );


    }


}







/*=========================================
        RENDER REVIEWS
=========================================*/


function renderReviews(reviews){


    if(!reviewList)
        return;




    reviewList.innerHTML="";





    if(!reviews.length){


        reviewList.innerHTML = `

        <p>
        No reviews yet
        </p>

        `;


        return;


    }







    reviews.forEach(review=>{


        const card =
        document.createElement(
            "div"
        );



        card.className =
        "review-card";





        card.innerHTML = `


        <h4>

        ${review.userName || "Customer"}

        </h4>




        <div class="review-rating">

        ${"★".repeat(review.rating)}

        </div>




        <p class="review-text">

        ${review.comment}

        </p>





        <span class="review-date">

        ${review.createdAt
        ?
        new Date(
        review.createdAt.seconds
        ?
        review.createdAt.seconds * 1000
        :
        review.createdAt
        )
        .toLocaleDateString()
        :
        ""}

        </span>



        `;




        reviewList
        .appendChild(card);



    });



}









/*=========================================
        SUBMIT REVIEW
=========================================*/


if(submitBtn){



submitBtn.addEventListener(
"click",
async()=>{


    const user =
    window.auth.currentUser;





    if(!user){


        alert(
        "Please login first"
        );


        return;


    }






    const review = {


        productId:productId,



        userId:user.uid,



        userName:
        user.displayName ||
        user.email,



        rating:
        Number(
        ratingSelect.value
        ),



        comment:
        reviewText.value,



        createdAt:
        new Date()



    };






    await window.db
    .collection("reviews")
    .add(review);






    reviewText.value="";



    loadReviews();



});


}







loadReviews();






});