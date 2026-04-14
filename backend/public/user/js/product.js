let currentPage;
let totalPages;
function getProductsByLimit(page) {
    document.getElementById('loading-container').style.display = 'flex';
    fetch(`/api/products?page=${page}`, {
        method: "GET"
    }).
        then(function (response) {
        return response.json();
    })
        .then(function (result) {
        document.getElementById('loading-container').style.display = 'none';
        console.log(result);
        updateProductsInHTML(result.products);
        updatePagination(result.totalPages, page);
        sessionStorage.setItem('currentPage', page);
        currentPage = page;
        totalPages = result.totalPages;
    })
        .catch(function (error) {
        console.error(error);
    });
}
function updateProductsInHTML(products) {
    document.querySelector('.page-title').innerHTML = '<h1>SHOP</h1>';
    var productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';
    products.forEach(function (product) {
        var productItem = document.createElement('div');
        productItem.classList.add('product-item');
        var productImage = document.createElement('div');
        productImage.classList.add('product-image');
        var img = document.createElement('img');
        img.src = product.urls[0];
        img.alt = product.productname;
        productImage.appendChild(img);
        var productDetails = document.createElement('div');
        productDetails.classList.add('product-details');
        var category = document.createElement('p');
        category.classList.add('category');
        category.textContent = product.categoryname;
        productDetails.appendChild(category);
        var title = document.createElement('h4');
        title.textContent = product.productname;
        productDetails.appendChild(title);
        var ratingSection = document.createElement('div');
        ratingSection.classList.add('rating-section');
        var numericRating = document.createElement('span');
        numericRating.classList.add('numeric-rating');
        numericRating.textContent = product.rating;
        var ratingIcon = document.createElement('span');
        ratingIcon.classList.add('rating-icon');
        ratingIcon.textContent = '★';
        ratingSection.appendChild(numericRating);
        ratingSection.appendChild(ratingIcon);
        productDetails.appendChild(ratingSection);
        var price = document.createElement('span');
        price.classList.add('price');
        price.textContent = '$' + product.unitprice;
        productDetails.appendChild(price);
        productItem.appendChild(productImage);
        productItem.appendChild(productDetails);
        var productGrid = document.querySelector('.product-grid');
        productItem.addEventListener('click', function () {
            sessionStorage.setItem('selectedProductId', product.productid);
            window.location.href = 'productDetail.html';
        });
        productGrid.appendChild(productItem);
    });
}
function handlePageButtonClick(page) {
    getProductsByLimit(page);
}
function updatePagination(totalPages, currentPage) {
    var currentPageParent = document.querySelector('.current-page');
    currentPageParent.innerHTML = 'Page <span id="currentPage">' + currentPage + '</span> of <span id="totalPages">' + totalPages + '</span>';
    var paginationContainer = document.querySelector('.sf-pagination.products-pagination');
    paginationContainer.innerHTML = '';
    var buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pagination-buttons-container');
    var previousButton = document.createElement('button');
    previousButton.classList.add('sf-button', 'sf-pagination-item');
    previousButton.textContent = 'Previous';
    previousButton.addEventListener('click', handlePreviousButtonClick);
    buttonsContainer.appendChild(previousButton);
    for (let i = 1; i <= totalPages; i++) {
        var button = document.createElement('button');
        button.classList.add('sf-button', 'sf-pagination-item');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('sf-pagination-item-current');
        }
        else {
            button.addEventListener('click', function () {
                handlePageButtonClick(i);
            });
        }
        buttonsContainer.appendChild(button);
    }
    var nextButton = document.createElement('button');
    nextButton.classList.add('sf-button', 'sf-pagination-item');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', handleNextButtonClick);
    buttonsContainer.appendChild(nextButton);
    paginationContainer.appendChild(buttonsContainer);
}
function handlePageButtonClick(page) {
    getProductsByLimit(page);
}
function handlePreviousButtonClick() {
    if (currentPage > 1) {
        currentPage--;
        getProductsByLimit(currentPage);
        updatePagination(totalPages, currentPage);
    }
}
function handleNextButtonClick() {
    if (currentPage < totalPages) {
        currentPage++;
        getProductsByLimit(currentPage);
        updatePagination(totalPages, currentPage);
    }
}
