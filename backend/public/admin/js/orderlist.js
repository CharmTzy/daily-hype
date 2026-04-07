// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 28.11.2023
// Description: To manage all frontend javascript functions related to order list (admin)

const token = localStorage.getItem('token');

function getOrderCount() {
    return fetch(`/api/ordersCountAdmin`, {
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

function getNewOrderData(current) {
    if (isNaN(current)) {
        alert("Error in Pagination");
    }
    else {
        getOrderData((current - 1) * 10)
            .then((data) => {
                loadTable("ordertable", headers, data);
            })
    }
}

function getOrderData(offset) {
    return fetch(`/api/ordersAdmin?offset=${offset}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            const newResult = [];
            if (result.order) {
                result.order.forEach((order) => {
                    const formattedDate = new Date(order.createdat).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const itemArr = ['#' + order.orderid, formattedDate, order.name, order.totalqty, '$' + parseFloat(order.totalamount).toFixed(2), order.deliveryaddress, capitaliseWord(order.paymentmethod)];
                    if (order.orderstatus === "in progress") {
                        itemArr.push(`<label class="status-in-progress">${capitaliseWord(order.orderstatus)}</label>`);
                        itemArr.push(`<button class="btn-confirm" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="openModal(${order.orderid}, 'confirmed', ${order.userid})">Confirm</button><button class="btn-cancel" id="btn-cancel" onclick="processUpdate(${order.orderid}, 'cancelled', '', 0)">Cancel</button><button class="btn-view" onclick="location='orderdetail.html?id=${order.orderid}'">Detail</button>`);
                    }
                    else if (order.orderstatus === "confirmed") {
                        itemArr.push(`<label class="status-confirmed">${capitaliseWord(order.orderstatus)}</label>`);
                        itemArr.push(`<button class="btn-view" onclick="location='orderdetail.html?id=${order.orderid}'">Detail</button>`);
                    }
                    else if (order.orderstatus === "delivered") {
                        itemArr.push(`<label class="status-delivered">${capitaliseWord(order.orderstatus)}</label>`);
                        itemArr.push(`<button class="btn-view" onclick="location='orderdetail.html?id=${order.orderid}'">Detail</button>`);
                    }
                    else if (order.orderstatus === "received") {
                        itemArr.push(`<label class="status-received">${capitaliseWord(order.orderstatus)}</label>`);
                        itemArr.push(`<button class="btn-view" onclick="location='orderdetail.html?id=${order.orderid}'">Detail</button>`);
                    }
                    else {
                        itemArr.push(`<label class="status-cancelled">${capitaliseWord(order.orderstatus)}</label>`);
                        itemArr.push(`<button class="btn-view" onclick="location='orderdetail.html?id=${order.orderid}'">Detail</button>`);
                    }
                    newResult.push(itemArr);
                })
            }
            return newResult;
        })
        .catch((error) => {
            console.error(error);
            return [];
        })
}

function openModal(orderid, status, userid) {
    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    myModal.show();
    document.getElementById('continueButton').onclick = function () {
        checkDeliveryDate(orderid, status, userid);
    }

    // Close the modal when the "Cancel" button is clicked
    document.getElementById('cancelButton').addEventListener('click', function () {
        myModal.hide();
        document.querySelector('.modal-backdrop').remove();
        document.getElementById('deliverydate').value = "";
        document.getElementsByTagName('body')[0].style.overflowY = "auto";
    });

    // Close the modal when it's closed
    myModal._element.addEventListener('hidden.bs.modal', function () {
        myModal.hide();
        document.querySelector('.modal-backdrop').remove();
        document.getElementById('deliverydate').value = "";
        document.getElementsByTagName('body')[0].style.overflowY = "auto";
    });
}

function checkDeliveryDate(orderid, status, userid) {
    const deliveryDate = document.getElementById('deliverydate');
    if (deliveryDate.value.trim() === "") {
        deliveryDate.style.border = "2px solid red";
    }
    else {
        document.getElementById('continueButton').textContent = "Loading...";
        processUpdate(orderid, status, deliveryDate.value, userid);
    }
}

// 
function processUpdate(orderid, status, deliverydate, userid) {

    console.log(orderid);
    console.log(status);
    console.log(deliverydate);

    if (status === 'confirmed') {
        Promise.all([updateOrderStatus(orderid, status), createDelivery(deliverydate, orderid, userid)])
            .then(([result1, result2]) => {
                alert(`Order #${orderid} is confirmed!`);
                location.reload();
            })
            .catch((error) => {
                console.error(error);
                alert(error);
            })
    }
    else if (status === 'cancelled') {
        document.getElementById('btn-cancel').textContent = "Loading...";
        updateOrderStatus(orderid, status)
            .then((result) => {
                alert(`Order #${orderid} is cancelled!`);
                location.reload();
            })
            .catch((error) => {
                console.error(error);
                alert(error);
            })
    }
    else {
        alert("Invalid status!");
        location.reload();
    }
}


// updating order status by admin
// require => orderid: integer, status: string
// return => Promise<boolean> if there is no error, otherwise throw error
function updateOrderStatus(orderid, status) {
    return fetch(`/api/orders/${orderid}/${status}/updateOrderByAdmin`, {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        .then((response) => {
            if (response.status !== 201) return response.json();
            return null;
        })
        .then((result) => {
            if (!result) {
                return true;
            }
            alert(result.error);
            throw new Error(result.error);
        })
        .catch((error) => {
            console.error(error);
            alert(error);
            throw error;
        })
}

// capitalise each word
function capitaliseWord(str) {
    let splitStr = str.toLowerCase().split(' ');

    splitStr.forEach((word, index) => {
        splitStr[index] = splitStr[index].charAt(0).toUpperCase() + splitStr[index].slice(1);
    })
    return splitStr.join(' ');
}

// Name: Ang Wei Liang
function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    // Generate a random alphabet letter for the first character
    const randomAlphabetIndex = Math.floor(Math.random() * 26);
    result += characters.charAt(randomAlphabetIndex);

    // Generate the rest of the characters randomly
    for (let i = 1; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function createDelivery(deliverydate, orderid, userid) {

    const randomCode = generateRandomCode(15);
    return fetch('/api/deliveries', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            deliverydate: deliverydate,
            deliverystatus: 'UnDelivered',
            deliverystatusdetail: 'Order confirmed',
            trackingnumber: randomCode,
            shipperid: '1',
            orderID: orderid,
            userID: userid
        })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((deliveryId) => {
            return deliveryId;
        })
        .catch((error) => {
            console.error('Error creating delviery:', error);
            throw error;
        })
}
// Name: Ang Wei Liang