const token = localStorage.getItem('token');
var colourOptions;
var categoryOptions;
var sizeOptions;
let selectedSizes = {};
function initializeProductRegistration() {
    showLoadingContainer();
    Promise.all([getCategoryOptions(), getColourOptions(), getSizeOptions()])
        .then(([categoryResult, colourResult, sizeResult]) => {
        hideLoadingContainer();
        colourOptions = colourResult.map(colour => colour.name);
        categoryOptions = categoryResult.map(category => category.categoryname);
        sizeOptions = sizeResult.map(size => size.name);
        renderProductRegistrationUI();
    }).catch((error) => {
        console.error(error);
    });
}
function renderProductRegistrationUI() {
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
            
    <h2>Product Registration</h2>
    
    <div>
    <div class="input-group">
        <label style="display: block;" for="productName">Name:</label>
        <input type="text" id="productName">
    </div>

    <div class="input-group">
        <label style="display: block;" for="productDescription">Description:</label>
        <input type="text" id="productDescription">
    </div>

    <div class="input-group">
        <label style="display: block;" for="unitPrice">Unit Price:</label>
        <input type="number" id="unitPrice" min="0">
    </div>

    <div class="input-group">
        <label style="display: block; " for="productCategory">Category:</label>
        <select id="productCategory" style="width: calc(40% - 16px); margin:7px; border-radius:6px">
            ${categoryOptions.map(category => `<option value="${category}">${category}</option>`).join('')}
        </select>
    </div>

    <div class="input-group">
        <label for="colorName">Color:</label>
        <select style="width: calc(25%); margin:0px 10px; border-radius:6px" id="colorName">
            ${colourOptions.map(color => `<option value="${color}">${color}</option>`).join('')}
        </select>
        <button style="border-radius:6px" onclick="addColor()">Add Color</button>
    </div>

    <div id="colorSection"></div>
    <div class="input-group">
        <label style="display: block;" for="productImages">Product Images:</label>
        <input type="file" id="productImages" accept="image/*" multiple>
    </div>

    <button style="border-radius:6px" onclick="submitProduct()">Submit</button>
</div>

    `;
}
function addColor() {
    const colorSection = document.getElementById('colorSection');
    const colorNameSelect = document.getElementById('colorName');
    const selectedColor = colorNameSelect.value;
    selectedSizes[selectedColor] = {
        sizes: [],
    };
    const existingColors = colorSection.getElementsByClassName('colorBox');
    for (const colorBox of existingColors) {
        const colorLabel = colorBox.getAttribute('data-color');
        if (colorLabel === selectedColor) {
            alert("Color already added.");
            return;
        }
    }
    const colorBox = document.createElement('div');
    colorBox.className = 'colorBox';
    colorBox.setAttribute('data-color', selectedColor);
    colorBox.innerHTML = `
        
    <label class="sizeLabel" for="size">Colour:</label>
        <label>${selectedColor}</label>
        <select style="width: calc(15%); margin:0px 10px" class="sizeSelect" data-color="${selectedColor}">
            ${sizeOptions.map(size => `<option value="${size}">${size}</option>`).join('')}
        </select>
        <button style="border-radius:6px" onclick="addSize(${colorSection.children.length})">Add Size</button>
        <button onclick="removeColor(${colorSection.children.length})" class="deleteBtn">Delete</button>
    `;
    colorSection.appendChild(colorBox);
}
function addSize(colorIndex) {
    const colorBox = document.getElementsByClassName('colorBox')[colorIndex];
    const sizeSelect = colorBox.querySelector('.sizeSelect');
    const selectedSize = sizeSelect.value;
    const selectedColor = colorBox.getAttribute('data-color');
    selectedSizes[selectedColor].sizes.push(selectedSize);
    const existingSizes = colorBox.querySelectorAll('.sizeBox');
    for (const sizeBox of existingSizes) {
        const existingSize = sizeBox.getAttribute('data-size');
        if (existingSize === selectedSize) {
            alert("Size already added for this color.");
            return;
        }
    }
    const sizeBox = document.createElement('div');
    sizeBox.className = 'sizeBox';
    sizeBox.setAttribute('data-size', selectedSize);
    sizeBox.innerHTML = `
        <label class="sizeLabel" for="size">Size:</label>
        <label style="margin-right:15px">${selectedSize}</label>
        <label class="qtyLabel" for="quantity">Quantity:</label>
        <input style="width: calc(15%); margin:0px 10px" type="number" class="qtyInput" id="quantity" min="0">
        <button onclick="removeSize(${colorIndex}, ${colorBox.children.length})" class="deleteBtn">Delete</button>
    `;
    colorBox.appendChild(sizeBox);
}
function removeColor(colorIndex) {
    const colorSection = document.getElementById('colorSection');
    const colorBox = colorSection.children[colorIndex];
    const colorLabel = colorBox.getAttribute('data-color');
    delete selectedSizes[colorLabel];
    colorSection.removeChild(colorBox);
}
function removeSize(colorIndex, sizeIndex) {
    const colorBox = document.getElementsByClassName('colorBox')[colorIndex];
    const sizeElements = colorBox.querySelectorAll('.sizeBox');
    if (sizeIndex >= 0 && sizeIndex < sizeElements.length) {
        const sizeToRemove = sizeElements[sizeIndex];
        const selectedColor = colorBox.getAttribute('data-color');
        const selectedSize = sizeToRemove.getAttribute('data-size');
        const sizeIndexToRemove = selectedSizes[selectedColor].sizes.indexOf(selectedSize);
        if (sizeIndexToRemove !== -1) {
            selectedSizes[selectedColor].sizes.splice(sizeIndexToRemove, 1);
        }
        colorBox.removeChild(sizeToRemove);
    }
}
function submitProduct() {
    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value;
    const unitPrice = document.getElementById('unitPrice').value;
    const productCategory = document.getElementById('productCategory').value;
    const colorSection = document.getElementById('colorSection');
    const productColors = {};
    for (const colorBox of colorSection.getElementsByClassName('colorBox')) {
        const colorLabel = colorBox.getAttribute('data-color');
        const selectedSizesData = selectedSizes[colorLabel];
        const qtyInputs = colorBox.querySelectorAll('.qtyInput');
        const qtyValues = Array.from(qtyInputs).map(input => parseInt(input.value) || 0);
        if (!productColors[colorLabel]) {
            productColors[colorLabel] = {};
        }
        selectedSizesData.sizes.forEach((size, index) => {
            const qty = qtyValues[index];
            if (qty > 0) {
                if (!productColors[colorLabel][size]) {
                    productColors[colorLabel][size] = {};
                }
                productColors[colorLabel][size] = qty;
            }
        });
    }
    const product = {
        Name: productName,
        Description: productDescription,
        unitPrice: unitPrice,
        Category: productCategory,
        Color: productColors,
    };
    console.log(product);
    const promiseResult = Promise.all([sendProductToBackend(product), uploadProductImages()])
        .then(([productResult, imageId]) => {
        createProductImage(productResult.productID, imageId.public_id)
            .then((result) => {
            console.log("FINAL");
            console.log(result);
            console.log(`Product image created for ${imageId.public_id}`);
            if (result.message === 'Insert Success') {
                alert("Product is inserted!");
                location.reload();
            }
        })
            .catch((error) => {
            console.error(`Error creating product image for ${imageId.public_id}:`, error);
        });
        return { result: 1 };
    })
        .catch(error => {
        console.error('Error in sending product to backend:', error);
    });
    if (promiseResult.result == 1) {
        alert("Product added successfully");
    }
}
function getColourOptions() {
    return fetch(`/api/colours`, {
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/json"
        }
    }).
        then(function (response) {
        return response.json();
    })
        .then(function (result) {
        return result.colours;
    })
        .catch(function (error) {
        console.error(error);
    });
}
function getCategoryOptions() {
    return fetch(`/api/categories`, {
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/json"
        }
    }).
        then(function (response) {
        return response.json();
    })
        .then(function (result) {
        return result.categories;
    })
        .catch(function (error) {
        console.error(error);
    });
}
function getSizeOptions() {
    return fetch(`/api/sizes`, {
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/json"
        }
    }).
        then(function (response) {
        return response.json();
    })
        .then(function (result) {
        return result.sizes;
    })
        .catch(function (error) {
        console.error(error);
    });
}
function sendProductToBackend(product) {
    const token = localStorage.getItem('token');
    if (!product.Name ||
        !product.Description ||
        !product.unitPrice ||
        !product.Category ||
        !Object.keys(product.Color).length ||
        Object.values(product.Color).some(colorData => !Object.keys(colorData).some(size => colorData[size]))) {
        alert('Please provide valid values for all fields, including sizes and quantities for each color.');
        return;
    }
    console.log("INSIDE PRODUCT");
    console.log(product);
    return fetch('/api/productAdmin', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
    })
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        console.log("data.productID", data);
        console.log("product successfully inserted");
        return data;
    })
        .catch(error => {
        console.error('Error submitting product:', error);
        alert('Error submitting product. Please try again.');
    });
}
function showLoadingContainer() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.style.display = 'flex';
}
function hideLoadingContainer() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.style.display = 'none';
}
function uploadProductImages() {
    const productImagesInput = document.getElementById('productImages');
    console.log(productImagesInput);
    const formData = new FormData();
    if (productImagesInput.files.length > 0) {
        const files = productImagesInput.files;
        for (const file of files) {
            console.log(file);
            formData.append("photo", file);
        }
    }
    console.log(formData);
    return fetch("/api/uploadProductPhoto", {
        method: "POST",
        headers: {
            Authorization: 'Bearer ' + token,
        },
        body: formData
    }).then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(result => {
        console.log(result);
        var inputString = result.public_id;
        console.log(result.public_id);
        return result;
    })
        .catch(error => {
        console.error('Error:', error);
        throw error;
    });
}
;
function createProductImage(productId, imageId) {
    console.log("INSIDE Product Image");
    console.log(productId);
    console.log(imageId);
    return fetch("/api/createProductImage", {
        method: "POST",
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            imageId: imageId
        }),
    }).then((result) => {
        console.log(result);
        return result.json();
    })
        .then((result) => {
        return result;
    });
}
