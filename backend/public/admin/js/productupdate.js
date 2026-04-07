// Name: Thu Htet San
// Admin No: 2235022
// Date: 30.11.2023
// Description: fuctions to be called from productupdate.html

const token = localStorage.getItem('token');


function initializeProductUpdate(productid) {

    Promise.all([getCategoryOptions(), getProductByProductID(productid)])
        .then(([categoryResult, productResult]) => {
            console.log(productResult);
            renderProductUpdateUI(categoryResult, productResult.product);
        })
        .catch(error => {
            console.error(error);
            // Handle errors if any
        });
}

function renderProductUpdateUI(category, product) {
    console.log(product)
    const { productname, description, unitprice, categoryid, categoryname, urls } = product;
    const imageSize = 100; // Set your desired image size

    const imageHtml = `
        <div class="input-group">
            ${urls && urls.length > 0
            ? urls.map(imageUrl => `<img src="${imageUrl}" alt="Product Image" style="width: ${imageSize}px; height: ${imageSize}px; margin-right: 10px;">`).join('')
            : 'No images available'
        }
        </div>
    `;

    const appElement = document.getElementById('app');
    appElement.innerHTML = `
            
    <h2>Product Update</h2>
    ${imageHtml}
    <div>
    <div class="input-group">
        <label style="display: block;" for="productName">Name:</label>
        <input type="text" id="productName" value="${productname}">
    </div>

    <div class="input-group">
        <label style="display: block;" for="productDescription">Description:</label>
        <input type="text" id="productDescription" value="${description}">
    </div>

    <div class="input-group">
        <label style="display: block;" for="unitPrice">Unit Price:</label>
        <input type="number" id="unitPrice" min="0" value="${unitprice}">
    </div>

    <div class="input-group">
        <label style="display: block; " for="productCategory">Category:</label>
        <select id="productCategory" style="width: calc(40% - 16px); margin:7px; border-radius:6px">
            ${category.map(category => `<option value="${category.categoryid}" ${category.categoryid === categoryid ? 'selected' : ''}>${category.categoryname}</option>`).join('')}
        </select>
    </div>
    <button style="border-radius:6px" onclick="updateProduct(${product.productid})">Submit</button>
</div>

    `;
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
        })
}

function getProductByProductID(productid) {
    if (!productid && isNaN(productid)) {
        alert("Invalid ProductID");
        location = 'productlist.html';
        return;
    }
    else {
        return fetch(`/api/productAdmin/${productid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                return data;
            })
            .catch((error) => {
                console.error(error);
                alert(error);
            })
    }
}

function updateProduct(productid) {
    const newName = document.getElementById('productName').value;
    const newDescription = document.getElementById('productDescription').value;
    const newUnitPrice = document.getElementById('unitPrice').value;
    const newCategoryId = document.getElementById('productCategory').value;


    if (newName && newDescription && newUnitPrice && newCategoryId) {

        const product ={ product : {
            productName: newName,
            description: newDescription,
            unitPrice: parseFloat(newUnitPrice), // Convert to float if needed
            categoryId: parseInt(newCategoryId), // Convert to integer if needed
            // Add other properties as needed
        }};
        fetch(`/api/productAdmin/${productid}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(product)
            })
            .then((response) => response.json())
            .then((result) => {
                if (result && result.message === "Update Success") {
                    alert(`Product ${productid} Product is updated!`);
                    location.reload();
                }
            })
            .catch((error) => {
                console.error(error);
                alert("Error in updating quantity!");
            })
    }
    else {
        txtQty.style.border = "1px solid red";
        alert("Invalid Data");
    }
}