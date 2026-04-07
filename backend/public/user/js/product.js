// Name: Thu Htet San
// Admin No: 2235022
// Date: 20.11.2023
// Description: fuctions to be called from product.html

let currentPage;
let totalPages;

function getProductsByLimit(page) {
  // Show the loading container while waiting for the data
  document.getElementById('loading-container').style.display = 'flex';
  fetch(`/api/products?page=${page}`, {
    method: "GET"
  }).
    // When the response is received, convert it to JSON
    then(function (response) {
      return response.json();
    })
    .then(function (result) {
      // Hide the loading container when data is received
      document.getElementById('loading-container').style.display = 'none';

      console.log(result);
      updateProductsInHTML(result.products);
      // Update pagination buttons
      updatePagination(result.totalPages, page);
      // Save the current page to session storage
      sessionStorage.setItem('currentPage', page);
      currentPage = page;
      totalPages = result.totalPages;
    })
    .catch(function (error) {
      // If there's an error during the process, catch it here
      console.error(error);
    })
}

function updateProductsInHTML(products) {
  //add shop title
  document.querySelector('.page-title').innerHTML = '<h1>SHOP</h1>';
  // Clear existing products
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


    //Add click event listener to the productItem
    productItem.addEventListener('click', function () {
      // Store the productid in session storage or perform any other action
      sessionStorage.setItem('selectedProductId', product.productid);

      // Redirect to the product detail page
      window.location.href = 'productDetail.html'; // Replace with your actual product detail page URL
    });


    productGrid.appendChild(productItem);

  });
}

// Function to handle button clicks
function handlePageButtonClick(page) {
  getProductsByLimit(page);
}

// Function to update the pagination section
function updatePagination(totalPages, currentPage) {

  // Update current page and total pages
  var currentPageParent = document.querySelector('.current-page');
  currentPageParent.innerHTML = 'Page <span id="currentPage">' + currentPage + '</span> of <span id="totalPages">' + totalPages + '</span>';
  // Clear existing pagination buttons
  var paginationContainer = document.querySelector('.sf-pagination.products-pagination');
  paginationContainer.innerHTML = '';
  var buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('pagination-buttons-container');

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.classList.add('sf-button', 'sf-pagination-item');
  previousButton.textContent = 'Previous';
  previousButton.addEventListener('click', handlePreviousButtonClick);

  buttonsContainer.appendChild(previousButton);

  // Create and append new pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    var button = document.createElement('button');
    button.classList.add('sf-button', 'sf-pagination-item');
    button.textContent = i;

    // Set the current page button differently
    if (i === currentPage) {
      button.classList.add('sf-pagination-item-current');
    } else {
      button.addEventListener('click', function () {
        handlePageButtonClick(i);
      });
    }

    buttonsContainer.appendChild(button);
  }

  // Next button
  var nextButton = document.createElement('button');
  nextButton.classList.add('sf-button', 'sf-pagination-item');
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', handleNextButtonClick);

  buttonsContainer.appendChild(nextButton);

  // Append the new buttons container to the pagination container
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