// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 1.12.2023

let orderData = [];
let totalOrder = 0;
let optionStatus = "all";
let month = "";
const orderResultDiv = document.getElementById('order-result');
const orderDiv = document.getElementById('order');
let cboYear = document.getElementById('cboYear');
let cboMonth = document.getElementById('cboMonth');
let txtSearch = document.getElementById('txtSearch');

txtSearch.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        changeOption(document.getElementById('cboStatus'));
    }
})

function generateFiveYears() {
    const date = new Date();
    let htmlStr = `<option value="">By Year</option>`;
    htmlStr += `<option value="${date.getFullYear()}">${date.getFullYear()}</option>`;
    for (let i = 1; i <= 4; i++) {
        date.setFullYear(date.getFullYear() - 1);
        htmlStr += `<option value="${date.getFullYear()}">${date.getFullYear()}</option>`;
    }
    cboYear.innerHTML = htmlStr;
}

function getInitialOrderData() {
    if (!token) {
        window.location = "login.html";
        alert("Please log in first!");
        return;
    }

    Promise.all([getOrderData(0), getOrderCount()])
        .then(([result1, result2]) => {
            if (!result2.error) {
                totalOrder = Math.ceil(result2.count / 5);
            }

            if (result1.error === "User Order Not Found") {
                changeUI([], "User Order Not Found");
                totalOrder = 0;
            }
            else {
                orderData = result1.order;

                if (orderData.length <= 0) {
                    changeUI([], "You have no order");
                    totalOrder = 0;
                }
                else {
                    changeUI(orderData, null);
                }
            }
            changePaginationButtonUI(1);
        })
        .catch((error) => {
            console.error(error);
            changeUI([], "Unknown Error");
            totalOrder = 0;
        })
}

function changeOption(element) {
    optionStatus = element.options[element.selectedIndex].value;

    Promise.all([getOrderData(0), getOrderCount()])
        .then(([result1, result2]) => {
            if (!result2.error) {
                totalOrder = Math.ceil(result2.count / 5);
            }

            if (result1.error === "User Order Not Found") {
                changeUI([], "User Order Not Found");
                totalOrder = 0;
            }
            else {
                orderData = result1.order;

                if (orderData.length <= 0) {
                    changeUI([], "You have no order");
                    totalOrder = 0;
                }
                else {
                    changeUI(orderData, null);
                }
            }
            changePaginationButtonUI(1);
        })
        .catch((error) => {
            console.error(error);
            changeUI([], "Unknown Error");
            totalOrder = 0;
        })
}

function capitaliseWord(str) {
    let splitStr = str.toLowerCase().split(' ');

    splitStr.forEach((word, index) => {
        splitStr[index] = splitStr[index].charAt(0).toUpperCase() + splitStr[index].slice(1);
    })
    return splitStr.join(' ');
}

function changeUI(result, message) {
    let htmlStr = '';
    if (message) {
        htmlStr += `<div class="order-item"><div class="order-detail" style="margin-bottom: 0;"><label style="width: 50vw; color: red; font-weight: bold;">${message}</label></div></div>`;
    }
    else {
        result.forEach((item) => {
            console.log(item);
            const productdetails = item.productdetails;
            const length = productdetails.length;

            const formattedDate = new Date(item.createdat).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            htmlStr += `
            <div class="order-item">
                <div class="order-detail">
                    <label>#${item.orderid}</label>
                    <label>${formattedDate}</label>
                    <label>${item.deliveryaddress}</label>
                    <label>${item.totalqty}</label>
                    <label>$${parseFloat(item.totalamount).toFixed(2)}</label>
                    <label>${capitaliseWord(item.orderstatus)}</label>
                    <div class="order-detail-button">`;
            if (item.orderstatus.toLowerCase() === "in progress") {
                htmlStr += `<button id="btn-cancel-${item.orderid}" onclick="updateOrder(${item.orderid}, 'cancelled')">Cancel</button>`;
            }
            else if (item.orderstatus.toLowerCase() === "delivered") {
                htmlStr += `<button id="btn-receive-${item.orderid}" onclick="updateOrder(${item.orderid}, 'received')">Received</button>`;
            }
            else if (item.orderstatus.toLowerCase() === "confirmed") {
                htmlStr += ``;
            }
            else if (item.orderstatus.toLowerCase() === "received") {
                htmlStr += `<button onclick="location='reviewForm.html?id=${item.orderid}';">Review</button>`;
            }
            htmlStr += `</div>
                </div>`;

            for (let i = 0; i < length; i++) {
                if (i % 2 === 0) {
                    htmlStr += `<div class="product-wrap">`;
                }
                htmlStr += `
                <div class="product-info">`;
                if (productdetails[i].image) {
                    htmlStr += `<img width="80" height="100" src="${productdetails[i].image}" />`;
                }
                else {
                    htmlStr += `<img width="80" height="100" src="img/sample.jpg" />`;
                }

                htmlStr += `<div class="column-wrap">
                        <a href="productDetail.html" onclick="sessionStorage.setItem('selectedProductId', ${productdetails[i].productid})">${productdetails[i].productname}</a>
                        <div class="row-wrap">
                            <div>
                                <label>colour: ${capitaliseWord(productdetails[i].colour)}</label>
                                <label>size: ${productdetails[i].size.toUpperCase()}</label>
                            </div>
                            <div>
                                <label>x${productdetails[i].qty}</label>
                                <label>$${(productdetails[i].unitprice * productdetails[i].qty).toFixed(2)}</label>
                            </div>
                        </div>
                    </div>
                </div>`;
                if (i % 2 === 1) {
                    htmlStr += `</div>`;
                }
            }

            if (length % 2 === 1) {
                htmlStr += `</div>`;
            }

            htmlStr += `</div>`;
        });
    }
    orderResultDiv.innerHTML = htmlStr;
    orderDiv.scrollIntoView();
}

function updateOrder(orderid, status) {
    if (status === "cancelled") {
        document.getElementById("btn-cancel-" + orderid).textContent = "Loading...";
    }
    else if (status === "received") {
        document.getElementById("btn-receive-" + orderid).textContent = "Loading...";
    }
    else {
        alert("Invalid Status!");
        location.reload();
        return;
    }

    fetch(`/api/orders/${orderid}/${status}/updateOrderByUser`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token} `
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result) {
                if (result.message && result.message === "Update Success") {
                    if (status === "cancelled")
                        alert(`Your order #${orderid} is successfully cancelled!`);
                    else if (status === "received")
                        alert(`Your order #${orderid} status is updated!`);
                }
                if (result.error) {
                    if (result.error === "Unknown Error") {
                        alert(`Unknown Error`);
                    }
                }
            }
            else {
                alert("Server Error");
            }
            location.reload();
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            location.reload();
        })
}

function getOrderData(offset) {
    let month = cboMonth.value;
    let year = cboYear.value;
    let search = txtSearch.value;

    if (!month || isNaN(month)) {
        month = 0;
    }

    if (!year || isNaN(year)) {
        year = 0;
    }

    if (!search) {
        search = "";
    }
    else {
        search = search.trim();
    }

    return fetch(`/api/orders?offset=${offset}&status=${optionStatus}&month=${month}&year=${year}&search=${search}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        .then((response) => response.json())
        .then((result) => {
            return result;
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            throw error;
        })
}

function getOrderCount() {
    let month = cboMonth.value;
    let year = cboYear.value;
    let search = txtSearch.value;

    if (!month || isNaN(month)) {
        month = 0;
    }

    if (!year || isNaN(year)) {
        year = 0;
    }

    if (!search) {
        search = "";
    }
    else {
        search = search.trim();
    }

    return fetch(`/api/orderCount?status=${optionStatus}&month=${month}&year=${year}&search=${search}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        .then((response) => response.json())
        .then((result) => {
            return result;
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            throw error;
        })
}

function changePage(current) {
    getOrderData((current - 1) * 5)
        .then((result) => {
            if (result.error === "User Order Not Found") {
                changeUI([], "User Order Not Found");
            }
            else {
                orderData = result.order;

                if (orderData.length <= 0) {
                    changeUI([], "You have no order");
                }
                else {
                    changeUI(orderData, null);
                }
            }
        })
        .catch((error) => {
            console.error(error);
            changeUI([], "Unknown Error");
        })
    changePaginationButtonUI(current);
}

function changePaginationButtonUI(current) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const maxButtons = 4;

    if (totalOrder <= 0) {
        pagination.style.display = "none";
    }
    else {
        pagination.style.display = "flex";
    }

    let buttons = [];

    if (totalOrder > maxButtons) {
        let start = Math.max(1, current - 2);
        let end = Math.min(totalOrder, start + maxButtons);
        let diff = maxButtons - (end - start);

        if (diff !== 0) {
            start -= diff;
        }

        for (let i = start; i <= end; i++) {
            buttons.push(i);
        }

        if (start > 1) {
            buttons.splice(0, -1, "...");
        }

        if (end < totalOrder) {
            buttons.splice(buttons.length, 1, "...");
        }
    }
    else {
        for (let i = 1; i <= totalOrder; i++) {
            buttons.push(i);
        }
    }

    buttons.forEach((page) => {
        const button = document.createElement('button');
        button.textContent = page;

        if (page === '...') {
            button.classList.add('dot');
        } else if (page === current) {
            button.classList.add('active');
        }
        else {
            button.onclick = () => changePage(page);
        }

        pagination.appendChild(button);
    });
}