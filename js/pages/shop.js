/*=========================================================
            TAQDEER FASHION
            SHOP SYSTEM FINAL v3
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded",()=>{

    const productContainer =
    document.getElementById("shopProductsGrid");

    const searchInput =
    document.getElementById("shopSearchInput");

    const sortSelect =
    document.getElementById("sortSelect");

    const categoryButtons =
    document.querySelectorAll(".shop-category-btn");

    const emptyBox =
    document.getElementById("shopEmpty");

    const productCount =
    document.getElementById("productCount");


    let allProducts = [];
    let currentCategory = "all";


    /*=========================================================
        READ CATEGORY FROM URL
=========================================================*/

const urlParams =
new URLSearchParams(
    window.location.search
);

const urlCategory =
urlParams.get("category");

if(urlCategory){

    currentCategory =
    urlCategory
    .toLowerCase()
    .trim();

}
    /*=========================================================
                LOAD PRODUCTS
    =========================================================*/

 async function loadProducts(){

    try{

        if(productCount){
            productCount.innerText = "Loading products...";
        }

        if(productContainer){
            productContainer.innerHTML = `
                <div class="empty-products">
                    <h3>Loading products...</h3>
                    <p>Please wait a moment.</p>
                </div>
            `;
        }

        if(!window.productService){

            console.error("Product service missing");

            if(productCount){
                productCount.innerText = "0 products found";
            }

            return;

        }

        allProducts =
        await window.productService.getProducts();

        renderProducts();

    }

    catch(error){

        console.error("Shop Load Error:", error);

        if(productCount){
            productCount.innerText = "0 products found";
        }

        if(productContainer){
            productContainer.innerHTML = `
                <div class="empty-products">
                    <h3>Products could not load</h3>
                    <p>Please check Firebase connection.</p>
                </div>
            `;
        }

    }

}

    /*=========================================================
                FILTER PRODUCTS
    =========================================================*/

    function getFilteredProducts(){

        let products =
        [...allProducts];

if(currentCategory !== "all"){

    products =
    products.filter(product=>{

        const productCategory =
        String(product.category || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g,"-");

        return productCategory === currentCategory;

    });

}


        /* SEARCH */
        if(searchInput && searchInput.value.trim()){

            const search =
            searchInput.value
            .toLowerCase()
            .trim();

            products =
            products.filter(product => {

                const name =
                (product.name || "").toLowerCase();

                const category =
                (product.category || "").toLowerCase();

                const badge =
                (product.badge || "").toLowerCase();

                return (
                    name.includes(search) ||
                    category.includes(search) ||
                    badge.includes(search)
                );

            });

        }

        return products;

    }



    /*=========================================================
                SORT
    =========================================================*/

    function sortProducts(products){

        if(!sortSelect){
            return products;
        }

        const value =
        sortSelect.value;

        if(value === "low-high"){

            products.sort((a,b)=>
                Number(a.price || 0) - Number(b.price || 0)
            );

        }

        if(value === "high-low"){

            products.sort((a,b)=>
                Number(b.price || 0) - Number(a.price || 0)
            );

        }

        if(value === "rating"){

            products.sort((a,b)=>
                Number(b.rating || 0) - Number(a.rating || 0)
            );

        }

        if(value === "newest"){

            products.sort((a,b)=>{

                const dateA =
                a.createdAt?.toDate
                ?
                a.createdAt.toDate()
                :
                new Date(a.createdAt || 0);

                const dateB =
                b.createdAt?.toDate
                ?
                b.createdAt.toDate()
                :
                new Date(b.createdAt || 0);

                return dateB - dateA;

            });

        }

        return products;

    }



    /*=========================================================
                RENDER
    =========================================================*/

    function renderProducts(){

        if(!productContainer){
            return;
        }

        let products =
        getFilteredProducts();

        products =
        sortProducts(products);


        if(productCount){

            productCount.innerText =
            `${products.length} products found`;

        }


       if(!products.length){

    productContainer.innerHTML = "";

    if(emptyBox){
        emptyBox.classList.remove("hidden");
        emptyBox.style.display = "block";
    }

    return;

}

if(emptyBox){
    emptyBox.classList.add("hidden");
    emptyBox.style.display = "none";
}


        window.productCard.renderProducts(
            productContainer,
            products
        );

    }



    /*=========================================================
                CATEGORY CLICK
    =========================================================*/

/*=========================================================
                CATEGORY CLICK
=========================================================*/

categoryButtons.forEach(
button=>{


    const buttonCategory =
    button.dataset.category
    ?
    button.dataset.category.toLowerCase().trim()
    :
    "all";


    if(buttonCategory === currentCategory){

        categoryButtons.forEach(btn=>
            btn.classList.remove("active")
        );

        button.classList.add("active");

    }


    button.addEventListener(
    "click",
    ()=>{


        categoryButtons.forEach(
        btn=>

            btn.classList.remove(
                "active"
            )

        );


        button.classList.add(
            "active"
        );


        currentCategory =
        buttonCategory;


        const newUrl =
        currentCategory === "all"
        ?
        "index.html"
        :
        `index.html?category=${currentCategory}`;


        window.history.pushState(
            {},
            "",
            newUrl
        );


        renderProducts();


    });


});



    /*=========================================================
                SEARCH
    =========================================================*/

    if(searchInput){

        searchInput.addEventListener("input",()=>{

            renderProducts();

        });

    }



    /*=========================================================
                SORT
    =========================================================*/

    if(sortSelect){

        sortSelect.addEventListener("change",()=>{

            renderProducts();

        });

    }



    loadProducts();

});