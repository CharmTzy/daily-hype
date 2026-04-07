// Name: Thu Htet San
// Admin No: 2235022
// Date: 30.11.2023
// Description: fuctions to be called from productlist.html

const token = localStorage.getItem('token');

function getProductCount() {
    return fetch(`/api/productsCountAdmin`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.count) {
                return Math.ceil(result.count / 10);
            }
            else {
                throw new Error("Pagination Error");
            }
        })
        .catch((error) => {
            console.error(error);
            throw error;
        })
}

function getNewProductData(current) {
    if (isNaN(current)) {
        alert("Error in Pagination");
    }
    else {
        getProductData((current - 1) * 10)
            .then((data) => {
                console.log(data);
                loadTable("producttable", headers, data);
            })
    }
}

function getProductData(offset) {
    return fetch(`/api/productsAdmin?offset=${offset}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            const newResult = [];
            if (result.product) {
                result.product.forEach((product) => {
                    const itemArr = [];

                    if (product.urls && product.urls.length > 0 && product.urls[0] !== null) {
                        itemArr.push(`<img width="50" height="70" style="border-radius: 8px;" src="${product.urls[0]}"/>`);
                    }
                    else {
                        itemArr.push("-");
                    }
                    itemArr.push(product.productid, product.productname, '$' + parseFloat(product.unitprice).toFixed(2), product.description, product.categoryname);
                    itemArr.push(`<button class="btn-confirm" onclick="location = 'productupdate.html?id=${product.productid}';">Edit</button><button class="btn-cancel" onclick="deleteProduct(${product.productid})">Delete</button><button class="btn-view" onclick="location='productdetail.html?id=${product.productid}'">Detail</button>`);
                    newResult.push(itemArr);
                })
            }
            return newResult;
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            return [];
        })
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
                location.reload();
            }
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
        })
}