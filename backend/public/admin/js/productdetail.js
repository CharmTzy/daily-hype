// Name: Thu Htet San
// Admin No: 2235022
// Date: 30.11.2023
// Description: fuctions to be called from productdetail.html

const token = localStorage.getItem('token');


function getProductDetail(productid, tableClassName, headers, loadTable) {
    if (!productid && isNaN(productid)) {
        alert("Invalid ProductID");
        location = 'productlist.html';
        return;
    }
    else {
        fetch(`/api/productDetailAdmin/${productid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const productdetail = data.productdetail;
                const product = data.product;
                if (product) {
                    const values = ["productid", "productname", "categoryname", "unitprice"];
                    values.forEach((value, index) => {
                        let data = product[value];
                        if (index === 3) data = "$" + parseFloat(data).toFixed(2);
                        document.getElementById(value).textContent = data;
                    })
                    document.getElementById("button-group").innerHTML = `
                            <button id="confirmbutton" class="btn-confirm" onclick="location = 'productUpdate.html?id=${product.productid}';">Edit</button>
                            <button id="cancelbutton" class="btn-cancel" onclick="deleteProduct(${product.productid})">Delete</button>
                        `;
                }
                const newData = [];
                productdetail.forEach((item) => {
                    newData.push([item.productdetailid, item.colour, item.size, item.qty, item.productstatus, `<div id="editForm${item.productdetailid}"><button class="btn-confirm" onclick="openTextBox(${item.productdetailid}, ${product.productid})">Edit</button><button class="btn-cancel" onclick="deleteProductDetail(${item.productdetailid})">Delete</button></div>`]);
                })
                loadTable(tableClassName, headers, newData);
            })
            .catch((error) => {
                console.error(error);
                alert(error);
            })
    }
}

function deleteProduct(productid) {
    fetch(`/api/deleteProduct?id=${productid}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => response.json())
        .then((result) => {
            if (result && result.message === "Delete Success") {
                alert(`Product ${productid} is successfully deleted!`);
                location = 'productlist.html';
            }
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
        })
}

function deleteProductDetail(productdetailid) {
    fetch(`/api/deleteProductDetail?id=${productdetailid}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result && result.message === "Delete Success") {
                alert(`Product Detail ${productdetailid} is successfully deleted!`);
                location.reload();
            }
        })
}

function openTextBox(productdetailid, productid) {
    const editForm = document.getElementById('editForm' + productdetailid);
    editForm.innerHTML = `<input id="txtQty${productdetailid}" type="number" style="width: 80px; margin-right: 16px;" /><button class="btn-confirm" onclick='updateProductDetailQty(${productdetailid})'>Confirm</button><button class="btn-cancel" onclick="deleteProductDetail(${productdetailid})">Delete</button>`;
}

function updateProductDetailQty(productdetalid) {
    const txtQty = document.getElementById('txtQty' + productdetalid);
    if (txtQty.value && !isNaN(txtQty.value)) {
        fetch(`/api/productDetailAdmin/${productdetalid}/${txtQty.value}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => response.json())
            .then((result) => {
                if (result && result.message === "Update Success") {
                    alert(`Product Detail ${productdetalid} Qty is updated!`);
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
        alert("The quantity is invalid!");
    }
}