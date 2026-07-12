/*=========================================================
        TAQDEER FASHION
        ADMIN PRODUCT MANAGEMENT FINAL
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const productsList =
    document.querySelector("#admin-products-list");

    const addBtn =
    document.querySelector("#add-product-btn");

    const closeBtn =
    document.querySelector("#close-product-form");

    const formSection =
    document.querySelector("#product-form-section");

    const form =
    document.querySelector("#product-form");

    const formTitle =
    document.querySelector("#form-title");

    const saveBtn =
    document.querySelector("#save-product-btn");

    const searchInput =
    document.querySelector("#product-search");

    const categoryFilter =
    document.querySelector("#category-filter");

    const stockFilter =
    document.querySelector("#stock-filter");


    const nameInput =
    document.querySelector("#product-name");

    const priceInput =
    document.querySelector("#product-price");

    const categoryInput =
    document.querySelector("#product-category");

    const stockInput =
    document.querySelector("#product-stock");

    const ratingInput =
    document.querySelector("#product-rating");

    const badgeInput =
    document.querySelector("#product-badge");

    const imageInput =
    document.querySelector("#product-image");

    const featuredInput =
    document.querySelector("#product-featured");

    const descriptionInput =
    document.querySelector("#product-description");


    let allProducts = [];
    let editProductId = null;
    let currentEditImage = "";



    /*==============================
            HELPERS
    ==============================*/

    function money(value){

        return "৳" + Number(value || 0).toLocaleString();

    }


    function getImagePath(path){

        if(!path){
            return "../../assets/placeholders/product.jpg";
        }

        if(
            path.startsWith("http") ||
            path.startsWith("data:")
        ){
            return path;
        }

        if(path.startsWith("../../") || path.startsWith("../")){
            return path;
        }

        if(path.startsWith("assets/")){
            return "../../" + path;
        }

        return "../../assets/placeholders/product.jpg";

    }


    function getStockStatus(stock){

        const value =
        Number(stock || 0);

        if(value <= 0){
            return {
                label:"Out Of Stock",
                className:"out"
            };
        }

        if(value <= 5){
            return {
                label:"Low Stock",
                className:"low"
            };
        }

        return {
            label:"In Stock",
            className:"in"
        };

    }


    function resetForm(){

        if(form){
            form.reset();
        }

        editProductId = null;
        currentEditImage = "";

        if(formTitle){
            formTitle.innerText = "Add Product";
        }

        if(saveBtn){
            saveBtn.innerText = "Save Product";
        }

        if(imageInput){
            imageInput.required = false;
        }

    }


    function openForm(mode = "add"){

        if(!formSection){
            return;
        }

        formSection.classList.add("active");
        formSection.style.display = "block";

        if(mode === "add"){

            resetForm();

            if(formTitle){
                formTitle.innerText = "Add Product";
            }

            if(saveBtn){
                saveBtn.innerText = "Save Product";
            }

        }

    }


    function closeForm(){

        if(formSection){
            formSection.classList.remove("active");
            formSection.style.display = "none";
        }

        resetForm();

    }



    /*==============================
            FORM TOGGLE
    ==============================*/

    if(addBtn){

        addBtn.addEventListener("click", () => {

            openForm("add");

        });

    }


    if(closeBtn){

        closeBtn.addEventListener("click", () => {

            closeForm();

        });

    }



    /*==============================
            LOAD PRODUCTS
    ==============================*/

    async function loadProducts(){

        try{

            if(!window.db){

                console.error("Firebase DB not ready");

                return;

            }

            if(productsList){

                productsList.innerHTML = `
                    <div class="admin-loading">
                        Loading products...
                    </div>
                `;

            }


            const snapshot =
            await window.db
            .collection("products")
            .get();


            allProducts =
            snapshot.docs.map(doc => {

                return {
                    id: doc.id,
                    ...doc.data()
                };

            });


            allProducts.sort((a,b)=>{

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


            loadCategories();

            renderProducts(allProducts);

        }

        catch(error){

            console.error("Load Products Error:", error);

            if(productsList){

                productsList.innerHTML = `
                    <div class="admin-empty">
                        <h3>Could not load products</h3>
                        <p>Please check Firebase connection.</p>
                    </div>
                `;

            }

        }

    }



    /*==============================
            CATEGORY LOAD
    ==============================*/

    function loadCategories(){

        if(!categoryFilter){
            return;
        }

        categoryFilter.innerHTML = `
            <option value="all">All Categories</option>
        `;

        const categories =
        [
            ...new Set(
                allProducts
                .map(product => product.category)
                .filter(Boolean)
            )
        ];


        categories.forEach(category => {

            const option =
            document.createElement("option");

            option.value =
            category;

            option.textContent =
            category;

            categoryFilter.appendChild(option);

        });

    }



    /*==============================
            RENDER PRODUCTS
    ==============================*/

    function renderProducts(products){

        if(!productsList){
            return;
        }

        productsList.innerHTML = "";

        if(!products.length){

            productsList.innerHTML = `
                <div class="admin-empty">
                    <h3>No Products Found</h3>
                    <p>Add your first product from the button above.</p>
                </div>
            `;

            return;

        }


        products.forEach(product => {

            const card =
            document.createElement("div");

            card.className =
            "admin-product-card";

            const image =
            getImagePath(product.image);

            const stockStatus =
            getStockStatus(product.stock);

            card.innerHTML = `

                <div class="admin-product-image">

                    <img
                    src="${image}"
                    alt="${product.name || "Product"}"
                    onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';">

                    <span class="product-stock-badge ${stockStatus.className}">
                        ${stockStatus.label}
                    </span>

                </div>


                <div class="admin-product-info">

                    <div class="admin-product-top">

                        <div>

                            <span class="admin-product-category">
                                ${product.category || "Fashion"}
                            </span>

                            <h3>
                                ${product.name || "Untitled Product"}
                            </h3>

                        </div>


                        <strong>
                            ${money(product.price)}
                        </strong>

                    </div>


                    <p>
                        ${product.description || "No description added."}
                    </p>


                    <div class="admin-product-meta">

                        <span>
                            Stock: ${Number(product.stock || 0)}
                        </span>

                        <span>
                            Rating: ${product.rating || "4.8"}
                        </span>

                        <span>
                            ${product.featured ? "Featured" : "Normal"}
                        </span>

                    </div>


                    <div class="admin-product-actions">

                        <button
                        type="button"
                        class="edit-product-btn"
                        data-id="${product.id}">
                            Edit
                        </button>

                        <button
                        type="button"
                        class="delete-product-btn"
                        data-id="${product.id}">
                            Delete
                        </button>

                    </div>

                </div>

            `;

            productsList.appendChild(card);

        });

    }



    /*==============================
            SAVE PRODUCT
    ==============================*/

    if(form){

        form.addEventListener("submit", async(e) => {

            e.preventDefault();

            try{

                if(!window.db){

                    alert("Firebase DB missing");

                    return;

                }

                if(saveBtn){

                    saveBtn.disabled = true;
                    saveBtn.innerText = "Saving...";

                }


                const file =
                imageInput?.files[0];

                let imageURL =
                currentEditImage || "";


                if(file){

                    if(!window.ImageService){

                        alert("Image service missing");

                        if(saveBtn){
                            saveBtn.disabled = false;
                            saveBtn.innerText = "Save Product";
                        }

                        return;

                    }

                    imageURL =
                    await window.ImageService.uploadImage(file);

                }


                const productData = {

                    name: nameInput.value.trim(),

                    price: Number(priceInput.value),

                    category: categoryInput.value.trim().toLowerCase(),

                    stock: Number(stockInput.value || 0),

                    rating: ratingInput.value.trim() || "4.8",

                    badge: badgeInput.value.trim(),

                    featured: featuredInput.value === "true",

                    description: descriptionInput.value.trim(),

                    image: imageURL || "assets/placeholders/product.jpg",

                    updatedAt: new Date().toISOString()

                };


                if(!productData.name || !productData.price || !productData.category){

                    alert("Please fill product name, price and category.");

                    if(saveBtn){
                        saveBtn.disabled = false;
                        saveBtn.innerText = "Save Product";
                    }

                    return;

                }


                if(editProductId){

                    await window.db
                    .collection("products")
                    .doc(editProductId)
                    .update(productData);

                }

                else{

                    productData.createdAt =
                    new Date().toISOString();

                    await window.db
                    .collection("products")
                    .add(productData);

                }


                closeForm();

                await loadProducts();

            }

            catch(error){

                console.error("Save Product Error:", error);

                alert("Product Save Failed");

            }

            finally{

                if(saveBtn){
                    saveBtn.disabled = false;
                    saveBtn.innerText = "Save Product";
                }

            }

        });

    }



    /*==============================
            EDIT / DELETE
    ==============================*/

    document.addEventListener("click", async(e) => {

        const editBtn =
        e.target.closest(".edit-product-btn");

        if(editBtn){

            const id =
            editBtn.dataset.id;

            const product =
            allProducts.find(item => item.id === id);

            if(!product){
                return;
            }

            editProductId =
            id;

            currentEditImage =
            product.image || "";

            nameInput.value =
            product.name || "";

            priceInput.value =
            product.price || "";

            categoryInput.value =
            product.category || "";

            stockInput.value =
            product.stock || "";

            ratingInput.value =
            product.rating || "";

            badgeInput.value =
            product.badge || "";

            featuredInput.value =
            product.featured ? "true" : "false";

            descriptionInput.value =
            product.description || "";

            if(formTitle){
                formTitle.innerText = "Edit Product";
            }

            if(saveBtn){
                saveBtn.innerText = "Update Product";
            }

            if(formSection){
                formSection.classList.add("active");
                formSection.style.display = "block";
            }

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

            return;

        }


        const deleteBtn =
        e.target.closest(".delete-product-btn");

        if(deleteBtn){

            const id =
            deleteBtn.dataset.id;

            const confirmDelete =
            confirm("Delete this product?");

            if(!confirmDelete){
                return;
            }

            try{

                await window.db
                .collection("products")
                .doc(id)
                .delete();

                await loadProducts();

            }

            catch(error){

                console.error("Delete Product Error:", error);

                alert("Product delete failed");

            }

        }

    });



    /*==============================
            FILTER
    ==============================*/

    function filterProducts(){

        let filtered =
        [...allProducts];

        const search =
        searchInput?.value
        .toLowerCase()
        .trim()
        ||
        "";

        const category =
        categoryFilter?.value
        ||
        "all";

        const stock =
        stockFilter?.value
        ||
        "all";


        if(search){

            filtered =
            filtered.filter(product => {

                return (
                    product.name?.toLowerCase().includes(search) ||
                    product.category?.toLowerCase().includes(search)
                );

            });

        }


        if(category !== "all"){

            filtered =
            filtered.filter(product => product.category === category);

        }


        if(stock !== "all"){

            filtered =
            filtered.filter(product => {

                const qty =
                Number(product.stock || 0);

                if(stock === "in"){
                    return qty > 5;
                }

                if(stock === "low"){
                    return qty > 0 && qty <= 5;
                }

                if(stock === "out"){
                    return qty <= 0;
                }

                return true;

            });

        }


        renderProducts(filtered);

    }


    searchInput?.addEventListener("input", filterProducts);
    categoryFilter?.addEventListener("change", filterProducts);
    stockFilter?.addEventListener("change", filterProducts);



    /*==============================
            INIT
    ==============================*/

    if(formSection){
        formSection.style.display = "none";
    }

    loadProducts();

});