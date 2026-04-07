// Name: Thu Htet San
// Admin No: 2235022
// Date: 17.11.2023
// Description: fuctions to be called from productDetail.html

const colorSelect = document.getElementById('color-select');
const uniqueColors = new Set();
let colorSizeMapping = {};
let productDetail = {};
let selectedImageIndex = 0; //new
function getProductDetail() {

  // Retrieve the productid from session storage
  const productID = sessionStorage.getItem('selectedProductId');

  // Show the loading container while waiting for the data
  document.getElementById('loading-container').style.display = 'flex';

  fetch(`/api/productDetail/${productID}`, {
    method: "GET"
  }).
    then(function (response) {
      return response.json();//convert it to JSON
    })
    .then(function (result) {
      // Hide the loading container when data is received
      document.getElementById('loading-container').style.display = 'none';
      productDetail = result.productDetail;
      updateProductDetailsInHTML();
    })
    .catch(function (error) {
      // If there's an error during the process, catch it here
      console.error(error);
    })
}

function updateProductDetailsInHTML() {
  // Update product information in the HTML here
  const productTitle = document.getElementById('product-title');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  const mainProductImage = document.getElementById('main-product-image');//new
  // Assuming productDetail is an array and you want to display details of the first product
  const firstProduct = productDetail[0];

  // Update HTML elements with product details
  productTitle.textContent = firstProduct.productname;
  productPrice.textContent = `$${firstProduct.unitprice}`;
  productDescription.textContent = firstProduct.description;

  colorSelect.innerHTML = '';

  // Iterate through each product in the array and add colors to the dropdown
  productDetail.forEach(product => {
    const color = product.colour;

    // Check if the color is not already in the set
    if (!uniqueColors.has(color)) {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      colorSelect.appendChild(option);

      // Add the color to the set to mark it as added
      uniqueColors.add(color);
    }
  });
  //let productDetails={};
  productDetail.forEach(item => {

    const color = item.colour;
    const size = item.size;
    const status = item.productstatus;
    const quantity = item.qty;

    // Check if the color exists in productDetails, if not, create a new entry
    if (!colorSizeMapping[color]) {
      console.log('colour');
      colorSizeMapping[color] = { sizes: {} };
    }
    // Add or update the size information for the current color
    colorSizeMapping[color].sizes[size] = { status, quantity }; console.log('sizes');
    console.log(colorSizeMapping);
  })

  // Update product images and generate image buttons
  updateProductImages(firstProduct.urls);//new
  updateImageButtons(firstProduct.urls);//new
  // Call the function to update size buttons and other details
  updateSizeAccordingToColour();
}

// Function to update size buttons and product status based on color selection
function updateSizeAccordingToColour() {
  //console.log(colorSizeMapping);
  const colorSelect = document.getElementById('color-select');
  const sizeContainer = document.getElementById('product__select-size-sizes');

  const selectedColor = colorSelect.value;
  console.log(selectedColor);
  // Clear existing size buttons
  sizeContainer.innerHTML = '';

  // Populate size buttons based on the productDetail received from the server
  const sizes = colorSizeMapping[selectedColor].sizes;

  Object.keys(sizes).forEach(size => {
    const button = document.createElement('button');
    button.textContent = size;
    button.classList.add('sf-button', 'sf-size-button', 'sf-size-button--primary-outlined');

    // Disable the button if the size status is "Out of Stock"
    if (sizes[size].status === 'out of stock') {
      button.disabled = true;
    } else {
      // Add a click event listener to handle button clicks
      button.addEventListener('click', () => handleSizeButtonClick(size, sizes[size].status));
    }

    sizeContainer.appendChild(button);
  });
}

// Function to handle size button clicks
function handleSizeButtonClick(size, status) {
  if (status === 'in stock') {
    // Update the selected size in a variable or any other desired way
    selectedSize = size;
    // Add visual indication for the selected size
    const sizeButtons = document.querySelectorAll('.sf-size-button');
    sizeButtons.forEach(button => {
      button.classList.remove('sf-size-button--selected');
      if (button.textContent === size) {
        button.classList.add('sf-size-button--selected');
      }
    });
  } else {
    alert(`This size is currently out of stock.`);
  }
}

let selectedSize = null; // Variable to store the selected size

function addToBag() {
  if (selectedSize !== null) {
    let redirectLocation = true;
    const selectedColor = document.getElementById('color-select').value;
    const selectedQuantity = document.querySelector('.quantity-select').value;

    // Check the status and qty of the selected size
    const sizeStatus = colorSizeMapping[selectedColor].sizes[selectedSize].status;
    const availableQuantity = colorSizeMapping[selectedColor].sizes[selectedSize].quantity;
    if (sizeStatus === 'in stock' && availableQuantity >= selectedQuantity) {
      // Update the database or perform any other actions to reflect the purchase
      let cart = localStorage.getItem('cart');
      if (!cart) {
        cart = [];
      }
      else {
        cart = JSON.parse(cart);
      }
      for (let i = 0; i < productDetail.length; i++) {
        if (productDetail[i].size === selectedSize && productDetail[i].colour === selectedColor) {
          let condition = false;
          for (let j = 0; j < cart.length; j++) {
            if (cart[j].productdetailid === productDetail[i].productdetailid) {
              if ((cart[j].qty + parseInt(selectedQuantity)) <= availableQuantity) {
                condition = true;
                cart[j].qty += parseInt(selectedQuantity);
                alert(`Added to bag: Color - ${selectedColor}, Size - ${selectedSize}, Quantity - ${selectedQuantity}`);
                break;
              }
              else {
                alert(`You have reached the maximum quantity for the selected size.`);
                redirectLocation = false;
                condition = true;
                break;
              }
            }
          }
          if (!condition) {
            cart.push({ "productdetailid": productDetail[i].productdetailid, "qty": parseInt(selectedQuantity) });
            alert(`Added to bag: Color - ${selectedColor}, Size - ${selectedSize}, Quantity - ${selectedQuantity}`);
          }
          break;
        }
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      if (redirectLocation) {
        location.reload();
      }
    } else if (sizeStatus !== 'in stock') {
      alert(`This size is currently out of stock.`);
    } else {
      alert(`Not enough quantity available for the selected size.`);
    }
  } else {
    alert('Please select a size before adding to bag.');
  }
}

function updateProductImages(images) {
  const mainProductImage = document.getElementById('main-product-image');
  // Display the default image (first image in the array)
  mainProductImage.src = images[selectedImageIndex];
}

function updateImageButtons(images) {
  const imageButtonsContainer = document.getElementById('image-buttons-container');
  imageButtonsContainer.innerHTML = '';

  images.forEach((imageUrl, index) => {
    const button = document.createElement('button');
    button.className = 'image-button';
    //button.textContent = `Image ${index + 1}`;
    button.onclick = () => changeImage(index);
    imageButtonsContainer.appendChild(button);

    // Set the background image of the button
    button.style.backgroundImage = `url('${imageUrl}')`;
  });
}

function changeImage(imageIndex) {

  selectedImageIndex = imageIndex;
  updateProductImages(productDetail[0].urls); // Assuming productDetails[0] is the first product
}

// Function to go back to the previous page
function goBack() {
  // Navigate back to the previous page
  window.history.back();
}