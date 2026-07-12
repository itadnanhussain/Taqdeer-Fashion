/*=========================================================
        TAQDEER FASHION
        HERO SLIDER
=========================================================*/


"use strict";



document.addEventListener(
"DOMContentLoaded",
()=>{



const slides =
document.querySelectorAll(
".slide"
);



const dots =
document.querySelectorAll(
".dot"
);



let currentSlide = 0;





function showSlide(index){



slides.forEach(
(slide)=>{


slide.classList.remove(
"active"
);


});




dots.forEach(
(dot)=>{


dot.classList.remove(
"active"
);


});





slides[index]
.classList.add(
"active"
);





if(dots[index]){


dots[index]
.classList.add(
"active"
);


}




}





function nextSlide(){


currentSlide++;





if(currentSlide >= slides.length){


currentSlide = 0;


}





showSlide(
currentSlide
);


}






setInterval(

nextSlide,

5000

);







dots.forEach(
(dot,index)=>{


dot.addEventListener(
"click",
()=>{


currentSlide = index;


showSlide(
index
);


});


});





});