const colorSelect = document.getElementById('color-select');
const uniqueColors = new Set();
let colorSizeMapping = {};
let productDetail = {};
let selectedImageIndex = 0;
function getProductDetail() {
    const productID = sessionStorage.getItem('selectedProductId');
    document.getElementById('loading-container').style.display = 'flex';
    fetch(`/api/productDetail/${productID}`, {
        method: "GET"
    }).
        then(function (response) {
        return response.json();
    })
        .then(function (result) {
        document.getElementById('loading-container').style.display = 'none';
        productDetail = result.productDetail;
        updateProductDetailsInHTML();
    })
        .catch(function (error) {
        console.error(error);
    });
}
function updateProductDetailsInHTML() {
    const productTitle = document.getElementById('product-title');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const mainProductImage = document.getElementById('main-product-image');
    const firstProduct = productDetail[0];
    productTitle.textContent = firstProduct.productname;
    productPrice.textContent = `$${firstProduct.unitprice}`;
    productDescription.textContent = firstProduct.description;
    colorSelect.innerHTML = '';
    productDetail.forEach(product => {
        const color = product.colour;
        if (!uniqueColors.has(color)) {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            colorSelect.appendChild(option);
            uniqueColors.add(color);
        }
    });
    productDetail.forEach(item => {
        const color = item.colour;
        const size = item.size;
        const status = item.productstatus;
        const quantity = item.qty;
        if (!colorSizeMapping[color]) {
            console.log('colour');
            colorSizeMapping[color] = { sizes: {} };
        }
        colorSizeMapping[color].sizes[size] = { status, quantity };
        console.log('sizes');
        console.log(colorSizeMapping);
    });
    updateProductImages(firstProduct.urls);
    updateImageButtons(firstProduct.urls);
    updateSizeAccordingToColour();
}
function updateSizeAccordingToColour() {
    const colorSelect = document.getElementById('color-select');
    const sizeContainer = document.getElementById('product__select-size-sizes');
    const selectedColor = colorSelect.value;
    console.log(selectedColor);
    sizeContainer.innerHTML = '';
    const sizes = colorSizeMapping[selectedColor].sizes;
    Object.keys(sizes).forEach(size => {
        const button = document.createElement('button');
        button.textContent = size;
        button.classList.add('sf-button', 'sf-size-button', 'sf-size-button--primary-outlined');
        if (sizes[size].status === 'out of stock') {
            button.disabled = true;
        }
        else {
            button.addEventListener('click', () => handleSizeButtonClick(size, sizes[size].status));
        }
        sizeContainer.appendChild(button);
    });
}
function handleSizeButtonClick(size, status) {
    if (status === 'in stock') {
        selectedSize = size;
        const sizeButtons = document.querySelectorAll('.sf-size-button');
        sizeButtons.forEach(button => {
            button.classList.remove('sf-size-button--selected');
            if (button.textContent === size) {
                button.classList.add('sf-size-button--selected');
            }
        });
    }
    else {
        alert(`This size is currently out of stock.`);
    }
}
let selectedSize = null;
function addToBag() {
    if (selectedSize !== null) {
        let redirectLocation = true;
        const selectedColor = document.getElementById('color-select').value;
        const selectedQuantity = document.querySelector('.quantity-select').value;
        const sizeStatus = colorSizeMapping[selectedColor].sizes[selectedSize].status;
        const availableQuantity = colorSizeMapping[selectedColor].sizes[selectedSize].quantity;
        if (sizeStatus === 'in stock' && availableQuantity >= selectedQuantity) {
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
        }
        else if (sizeStatus !== 'in stock') {
            alert(`This size is currently out of stock.`);
        }
        else {
            alert(`Not enough quantity available for the selected size.`);
        }
    }
    else {
        alert('Please select a size before adding to bag.');
    }
}
function updateProductImages(images) {
    const mainProductImage = document.getElementById('main-product-image');
    mainProductImage.src = images[selectedImageIndex];
}
function updateImageButtons(images) {
    const imageButtonsContainer = document.getElementById('image-buttons-container');
    imageButtonsContainer.innerHTML = '';
    images.forEach((imageUrl, index) => {
        const button = document.createElement('button');
        button.className = 'image-button';
        button.onclick = () => changeImage(index);
        imageButtonsContainer.appendChild(button);
        button.style.backgroundImage = `url('${imageUrl}')`;
    });
}
function changeImage(imageIndex) {
    selectedImageIndex = imageIndex;
    updateProductImages(productDetail[0].urls);
}
function goBack() {
    window.history.back();
}
