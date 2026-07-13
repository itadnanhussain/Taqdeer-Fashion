/*=========================================================
        TAQDEER FASHION
        SHOP PAGE FINAL FUNCTIONAL JS
=========================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const productContainer = document.getElementById("shopProductsGrid");
    const searchInput = document.getElementById("shopSearchInput");
    const sortSelect = document.getElementById("sortSelect");
    const categoryButtons = document.querySelectorAll(".shop-category-btn");
    const emptyBox = document.getElementById("shopEmpty");
    const productCount = document.getElementById("productCount");

    const priceRange = document.getElementById("priceRange");
    const priceRangeValue = document.getElementById("priceRangeValue");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const applyFilterBtn = document.getElementById("applyFilterBtn");
    const sizeFilters = document.querySelectorAll(".size-filter");
    const stockInFilter = document.getElementById("stockInFilter");
    const stockLowFilter = document.getElementById("stockLowFilter");

    const shopMenuBtn = document.getElementById("shopMenuBtn");
    const shopMobileNav = document.getElementById("shopMobileNav");
    const viewButtons = document.querySelectorAll(".view-buttons button");

    let allProducts = [];
    let currentCategory = "all";
    let visibleLimit = 12;
    let currentView = "grid";

    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get("category");

    if (urlCategory) {
        currentCategory = normalizeCategory(urlCategory);
    }

    function normalizeCategory(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");
    }

    function money(value) {
        return "৳" + Number(value || 0).toLocaleString();
    }

    function getPrice(product) {
        return Number(
            product.price ||
            product.salePrice ||
            product.finalPrice ||
            product.discountPrice ||
            product.currentPrice ||
            0
        );
    }

    function getOldPrice(product) {
        return Number(
            product.oldPrice ||
            product.regularPrice ||
            product.comparePrice ||
            0
        );
    }

    function getStock(product) {
        return Number(
            product.stock ||
            product.quantity ||
            product.availableStock ||
            product.pcs ||
            0
        );
    }

    function getImagePath(path) {
        const fallback = "../../assets/placeholders/product.jpg";

        if (!path) {
            return fallback;
        }

        if (
            path.startsWith("http") ||
            path.startsWith("data:") ||
            path.startsWith("../") ||
            path.startsWith("../../")
        ) {
            return path;
        }

        if (path.startsWith("assets/")) {
            return "../../" + path;
        }

        return fallback;
    }

    function getProductImage(product) {
        return getImagePath(
            product.image ||
            product.imageUrl ||
            product.thumbnail ||
            product.mainImage ||
            (Array.isArray(product.images) ? product.images[0] : "")
        );
    }

    function getDiscountPercent(product) {
        const price = getPrice(product);
        const oldPrice = getOldPrice(product);

        if (product.discount) {
            return Number(product.discount);
        }

        if (!price || !oldPrice || oldPrice <= price) {
            return 0;
        }

        return Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    function getWishlist() {
        return JSON.parse(localStorage.getItem("taqdeerWishlist")) || [];
    }

    function saveWishlist(wishlist) {
        localStorage.setItem("taqdeerWishlist", JSON.stringify(wishlist));
        updateWishlistCount();
    }

    function updateWishlistCount() {
        const wishlist = getWishlist();

        document.querySelectorAll(".wishlist-count").forEach(element => {
            element.textContent = wishlist.length;
        });
    }

    function isWishlisted(productId) {
        return getWishlist().some(item => String(item.id) === String(productId));
    }

    function toggleWishlist(product) {
        const wishlist = getWishlist();
        const exists = wishlist.some(item => String(item.id) === String(product.id));

        let updatedWishlist;

        if (exists) {
            updatedWishlist = wishlist.filter(item => String(item.id) !== String(product.id));
        } else {
            updatedWishlist = [
                ...wishlist,
                {
                    id: product.id,
                    name: product.name || "Product",
                    price: getPrice(product),
                    image: product.image || product.imageUrl || product.thumbnail || product.mainImage || "",
                    category: product.category || "Fashion"
                }
            ];
        }

        saveWishlist(updatedWishlist);
    }

    function updateCategoryCounts() {
        const counts = {
            all: allProducts.length,
            shirt: 0,
            "t-shirt": 0,
            panjabi: 0,
            trouser: 0,
            "drop-shoulder": 0
        };

        allProducts.forEach(product => {
            const category = normalizeCategory(product.category);

            if (Object.prototype.hasOwnProperty.call(counts, category)) {
                counts[category]++;
            }
        });

        Object.keys(counts).forEach(key => {
            const element = document.getElementById("count-" + key);

            if (element) {
                element.textContent = counts[key];
            }
        });
    }

    async function loadProducts() {
        try {
            if (productCount) {
                productCount.textContent = "Loading products...";
            }

            if (productContainer) {
                productContainer.innerHTML = `
                    <div class="shop-empty">
                        <h3>Loading products...</h3>
                        <p>Please wait a moment.</p>
                    </div>
                `;
            }

            if (!window.productService || typeof window.productService.getProducts !== "function") {
                throw new Error("Product service missing");
            }

            allProducts = await window.productService.getProducts();

            updateCategoryCounts();
            syncActiveCategory();
            updateWishlistCount();
            renderProducts();

        } catch (error) {
            console.error("Shop Load Error:", error);

            if (productContainer) {
                productContainer.innerHTML = "";
            }

            if (productCount) {
                productCount.textContent = "0 products found";
            }

            if (emptyBox) {
                emptyBox.classList.remove("hidden");
            }
        }
    }

    function getSelectedSizes() {
        return Array.from(sizeFilters)
            .filter(input => input.checked)
            .map(input => String(input.value).toLowerCase());
    }

    function productHasSelectedSize(product, selectedSizes) {
        if (!selectedSizes.length) {
            return true;
        }

        const productSizes = Array.isArray(product.sizes)
            ? product.sizes.map(size => String(size).toLowerCase())
            : String(product.size || "").toLowerCase().split(",").map(size => size.trim());

        return selectedSizes.some(size => productSizes.includes(size));
    }

    function getFilteredProducts() {
        let products = [...allProducts];

        if (currentCategory !== "all") {
            products = products.filter(product => {
                return normalizeCategory(product.category) === currentCategory;
            });
        }

        if (searchInput && searchInput.value.trim()) {
            const search = searchInput.value.toLowerCase().trim();

            products = products.filter(product => {
                const name = String(product.name || "").toLowerCase();
                const category = String(product.category || "").toLowerCase();
                const badge = String(product.badge || "").toLowerCase();
                const description = String(product.description || "").toLowerCase();

                return (
                    name.includes(search) ||
                    category.includes(search) ||
                    badge.includes(search) ||
                    description.includes(search)
                );
            });
        }

        if (priceRange) {
            const maxPrice = Number(priceRange.value || 5000);

            products = products.filter(product => {
                return getPrice(product) <= maxPrice;
            });
        }

        const selectedSizes = getSelectedSizes();

        products = products.filter(product => {
            return productHasSelectedSize(product, selectedSizes);
        });

        if (stockInFilter && stockInFilter.checked) {
            products = products.filter(product => getStock(product) > 0);
        }

        if (stockLowFilter && stockLowFilter.checked) {
            products = products.filter(product => {
                const stock = getStock(product);
                return stock > 0 && stock <= 10;
            });
        }

        return products;
    }

    function sortProducts(products) {
        if (!sortSelect) {
            return products;
        }

        const value = sortSelect.value;

        if (value === "low-high") {
            products.sort((a, b) => getPrice(a) - getPrice(b));
        }

        if (value === "high-low") {
            products.sort((a, b) => getPrice(b) - getPrice(a));
        }

        if (value === "rating") {
            products.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        }

        if (value === "newest") {
            products.sort((a, b) => {
                const dateA = a.createdAt?.toDate
                    ? a.createdAt.toDate()
                    : new Date(a.createdAt || 0);

                const dateB = b.createdAt?.toDate
                    ? b.createdAt.toDate()
                    : new Date(b.createdAt || 0);

                return dateB - dateA;
            });
        }

        return products;
    }

    function renderProducts() {
        if (!productContainer) {
            return;
        }

        let products = getFilteredProducts();
        products = sortProducts(products);

        const visibleProducts = products.slice(0, visibleLimit);

        productContainer.innerHTML = "";

        productContainer.classList.toggle("list-view", currentView === "list");

        if (productCount) {
            if (products.length) {
                productCount.textContent =
                    `Showing 1–${visibleProducts.length} of ${products.length} products`;
            } else {
                productCount.textContent = "0 products found";
            }
        }

        if (!products.length) {
            if (emptyBox) {
                emptyBox.classList.remove("hidden");
            }

            return;
        }

        if (emptyBox) {
            emptyBox.classList.add("hidden");
        }

        visibleProducts.forEach(product => {
            productContainer.appendChild(createProductCard(product));
        });

        const loadMoreBtn = document.getElementById("loadMoreBtn");

        if (loadMoreBtn) {
            loadMoreBtn.style.display =
                products.length > visibleLimit ? "flex" : "none";
        }

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function createProductCard(product) {
        const id = product.id || product.docId || "";
        const name = product.name || "Product";
        const price = getPrice(product);
        const oldPrice = getOldPrice(product);
        const rating = Number(product.rating || 4.8);
        const reviews = Number(product.reviews || product.reviewCount || 0);
        const image = getProductImage(product);
        const discount = getDiscountPercent(product);
        const wishlisted = isWishlisted(id);

        const card = document.createElement("article");
        card.className = "shop-product-card";

        card.innerHTML = `
            <div class="shop-product-image">
                ${discount ? `<span class="discount-badge">-${discount}%</span>` : ""}

                <button
                    type="button"
                    class="shop-wishlist-btn ${wishlisted ? "active" : ""}"
                    data-id="${id}"
                    aria-label="Add to wishlist"
                >
                    <i data-lucide="heart" ${wishlisted ? `fill="currentColor"` : ""}></i>
                </button>

                <a href="../product-details/index.html?id=${encodeURIComponent(id)}">
                    <img
                        src="${image}"
                        alt="${name}"
                        onerror="this.onerror=null;this.src='../../assets/placeholders/product.jpg';"
                    >
                </a>
            </div>

            <div class="shop-product-info">
                <h3>${name}</h3>

                <div class="shop-rating">
                    <strong>★</strong>
                    <span>${rating.toFixed(1)} ${reviews ? `(${reviews})` : ""}</span>
                </div>

                <div class="shop-price-row">
                    <strong>${money(price)}</strong>
                    ${oldPrice ? `<del>${money(oldPrice)}</del>` : ""}
                </div>

                <div class="shop-action-row">
                    <button type="button" class="shop-add-cart" data-id="${id}">
                        Add to Cart
                    </button>

                    <button type="button" class="shop-buy-now" data-id="${id}">
                        Buy Now
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    function syncActiveCategory() {
        categoryButtons.forEach(button => {
            const buttonCategory = normalizeCategory(button.dataset.category || "all");
            button.classList.toggle("active", buttonCategory === currentCategory);
        });
    }

    function addToCart(product) {
        const cartService = window.CartService || window.cartService;

        const cartItem = {
            id: product.id,
            name: product.name || "Product",
            price: getPrice(product),
            image: product.image || product.imageUrl || product.thumbnail || product.mainImage || "",
            category: product.category || "Fashion",
            size: Array.isArray(product.sizes) && product.sizes.length ? product.sizes[0] : product.size || "M",
            color: product.color || "",
            quantity: 1
        };

        if (cartService && typeof cartService.addToCart === "function") {
            cartService.addToCart(cartItem);
        } else {
            const cart = JSON.parse(localStorage.getItem("taqdeerCart")) || [];
            const existing = cart.find(item => String(item.id) === String(cartItem.id));

            if (existing) {
                existing.quantity = Number(existing.quantity || 1) + 1;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem("taqdeerCart", JSON.stringify(cart));
        }

        window.dispatchEvent(new Event("cartUpdated"));
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentCategory = normalizeCategory(button.dataset.category || "all");
            visibleLimit = 12;

            syncActiveCategory();

            const newUrl =
                currentCategory === "all"
                    ? "index.html"
                    : `index.html?category=${currentCategory}`;

            window.history.pushState({}, "", newUrl);

            renderProducts();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            visibleLimit = 12;
            renderProducts();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", renderProducts);
    }

    if (priceRange) {
        priceRange.addEventListener("input", () => {
            if (priceRangeValue) {
                priceRangeValue.textContent =
                    `৳${Number(priceRange.value).toLocaleString()}+`;
            }
        });
    }

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener("click", () => {
            visibleLimit = 12;
            renderProducts();
        });
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            if (priceRange) {
                priceRange.value = 5000;
            }

            if (priceRangeValue) {
                priceRangeValue.textContent = "৳5000+";
            }

            sizeFilters.forEach(input => {
                input.checked = false;
            });

            if (stockInFilter) {
                stockInFilter.checked = false;
            }

            if (stockLowFilter) {
                stockLowFilter.checked = false;
            }

            currentCategory = "all";
            syncActiveCategory();

            visibleLimit = 12;
            window.history.pushState({}, "", "index.html");

            renderProducts();
        });
    }

    document.querySelectorAll(".filter-accordion").forEach(button => {
        button.addEventListener("click", () => {
            const group = button.closest(".filter-group");

            if (!group) {
                return;
            }

            group.classList.toggle("open");

            const icon = button.querySelector("i");

            if (icon) {
                icon.setAttribute(
                    "data-lucide",
                    group.classList.contains("open") ? "minus" : "plus"
                );
            }

            if (window.lucide) {
                lucide.createIcons();
            }
        });
    });

    viewButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            viewButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            currentView = index === 1 ? "list" : "grid";

            renderProducts();
        });
    });

    document.addEventListener("click", event => {
        const addCartBtn = event.target.closest(".shop-add-cart");
        const buyNowBtn = event.target.closest(".shop-buy-now");
        const wishlistBtn = event.target.closest(".shop-wishlist-btn");

        if (addCartBtn) {
            const product = allProducts.find(item => String(item.id) === String(addCartBtn.dataset.id));

            if (product) {
                addToCart(product);
            }

            return;
        }

        if (buyNowBtn) {
            const product = allProducts.find(item => String(item.id) === String(buyNowBtn.dataset.id));

            if (product) {
                addToCart(product);
                window.location.href = "../checkout/index.html";
            }

            return;
        }

        if (wishlistBtn) {
            const product = allProducts.find(item => String(item.id) === String(wishlistBtn.dataset.id));

            if (product) {
                toggleWishlist(product);
                renderProducts();
            }

            return;
        }
    });

    const loadMoreBtn = document.getElementById("loadMoreBtn");

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
            visibleLimit += 12;
            renderProducts();
        });
    }

    if (shopMenuBtn && shopMobileNav) {
        shopMenuBtn.addEventListener("click", () => {
            shopMobileNav.classList.toggle("active");
        });
    }

    updateWishlistCount();
    loadProducts();

});