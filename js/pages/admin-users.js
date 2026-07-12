/*=========================================================
            TAQDEER FASHION
            ADMIN USER MANAGEMENT v4
=========================================================*/


"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{



const usersContainer =
document.querySelector(
"#admin-users-list"
);



const searchInput =
document.querySelector(
"#user-search"
);



const roleFilter =
document.querySelector(
"#role-filter"
);



const statusFilter =
document.querySelector(
"#status-filter"
);



const userModal =
document.querySelector(
"#user-modal"
);



const userDetailsContent =
document.querySelector(
"#user-details-content"
);



const closeModal =
document.querySelector(
"#close-user-modal"
);




let allUsers = [];









/*=========================================
        LOAD USERS
=========================================*/


async function loadUsers(){


try{


const snapshot =
await window.db
.collection("users")
.orderBy(
"createdAt",
"desc"
)
.get();





allUsers =
snapshot.docs.map(
doc=>({

id:doc.id,

...doc.data()

})
);





renderUsers(
allUsers
);



}



catch(error){


console.error(
"Load Users Error:",
error
);


}



}









/*=========================================
        DATE FORMAT
=========================================*/


function formatDate(date){


if(!date)
return "N/A";



return new Date(

date.seconds
?
date.seconds * 1000
:
date

)
.toLocaleDateString();


}









/*=========================================
        RENDER USERS
=========================================*/


function renderUsers(users){


if(!usersContainer)
return;




usersContainer.innerHTML="";





if(!users.length){


usersContainer.innerHTML=`

<p>
No Users Found
</p>

`;

return;


}







users.forEach(
user=>{



const card =
document.createElement(
"div"
);



card.className =
"admin-card user-card";





card.innerHTML=`


<div class="user-header">


<img

src="${
user.photo ||
"../../assets/logos/logo.png"
}"

class="user-avatar"

>



<div>


<h3>

${user.name || "Taqdeer User"}

</h3>



<span>

${user.role || "customer"}

</span>


</div>


</div>





<p>

Email:

${user.email || "N/A"}

</p>





<p>

Phone:

${user.phone || "N/A"}

</p>





<p>

Status:

${user.status || "active"}

</p>





<p>

Joined:

${formatDate(
user.createdAt
)}

</p>






<button

class="view-user-btn"

data-id="${user.id}">

View Details

</button>




<button

class="edit-user-btn"

data-id="${user.id}">

Edit

</button>





<button

class="block-user-btn"

data-id="${user.id}">

${
user.status==="blocked"
?
"Unblock"
:
"Block"
}

</button>



`;





usersContainer
.appendChild(card);



});



}









/*=========================================
        FILTER
=========================================*/


function filterUsers(){


let filtered =
[...allUsers];



const search =
searchInput
?
searchInput.value
.toLowerCase()
:
"";



const role =
roleFilter
?
roleFilter.value
:
"all";



const status =
statusFilter
?
statusFilter.value
:
"all";





if(search){


filtered =
filtered.filter(
user=>


user.name
?.toLowerCase()
.includes(search)

||

user.email
?.toLowerCase()
.includes(search)


);


}




if(role !== "all"){


filtered =
filtered.filter(
user=>

user.role === role

);


}




if(status !== "all"){


filtered =
filtered.filter(
user=>

(user.status || "active")
=== status

);


}





renderUsers(filtered);



}









/*=========================================
        BLOCK / UNBLOCK
=========================================*/


document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList
.contains(
"block-user-btn"
)

){



const id =
e.target.dataset.id;




const user =
allUsers.find(
u=>u.id===id
);





const newStatus =

user.status==="blocked"

?

"active"

:

"blocked";






await window.db
.collection("users")
.doc(id)
.update({

status:newStatus,

updatedAt:
new Date()

});





loadUsers();



}



});









/*=========================================
        EDIT USER
=========================================*/


document.addEventListener(
"click",
async(e)=>{


if(
e.target.classList
.contains(
"edit-user-btn"
)

){



const id =
e.target.dataset.id;



const user =
allUsers.find(
u=>u.id===id
);





const name =
prompt(
"User Name",
user.name
);




const role =
prompt(
"Role",
user.role
);






if(name && role){


await window.db
.collection("users")
.doc(id)
.update({

name:name,

role:role,

updatedAt:
new Date()

});



loadUsers();



}



}



});









/*=========================================
        VIEW USER DETAILS
=========================================*/


document.addEventListener(
"click",
async(e)=>{



if(
e.target.classList
.contains(
"view-user-btn"
)

){



const id =
e.target.dataset.id;



const user =
allUsers.find(
u=>u.id===id
);





const ordersSnapshot =
await window.db
.collection("orders")
.where(
"userId",
"==",
id
)
.get();






let totalSpend = 0;





ordersSnapshot.forEach(
doc=>{


const order =
doc.data();


totalSpend +=
Number(
order.total || 0
);


});







userDetailsContent.innerHTML = `


<img

src="${
user.photo ||
"../../assets/logos/logo.png"
}"

class="modal-user-photo"

>




<h2>

${user.name || "User"}

</h2>



<p>

Email:

${user.email || "N/A"}

</p>



<p>

Phone:

${user.phone || "N/A"}

</p>



<p>

Role:

${user.role || "customer"}

</p>



<p>

Status:

${user.status || "active"}

</p>





<hr>





<h3>
Order Summary
</h3>



<p>

Total Orders:

${ordersSnapshot.size}

</p>




<p>

Total Spend:

৳${totalSpend}

</p>



`;






if(userModal){

userModal.style.display =
"flex";

}



}



});









/*=========================================
        CLOSE MODAL
=========================================*/


if(closeModal){


closeModal.addEventListener(
"click",
()=>{


userModal.style.display =
"none";


});


}









/*=========================================
        FILTER EVENTS
=========================================*/


if(searchInput){

searchInput.addEventListener(
"input",
filterUsers
);

}



if(roleFilter){

roleFilter.addEventListener(
"change",
filterUsers
);

}



if(statusFilter){

statusFilter.addEventListener(
"change",
filterUsers
);

}








loadUsers();





});