// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 1.12.2023
// Description: This is the collection of frontend functions for orderdetail

const token = localStorage.getItem('token');


// capitalise each word
function capitaliseWord(str) {
    let splitStr = str.toLowerCase().split(' ');

    splitStr.forEach((word, index) => {
        splitStr[index] = splitStr[index].charAt(0).toUpperCase() + splitStr[index].slice(1);
    })
    return splitStr.join(' ');
}

function getOrderDetail(orderid, tableClassName, headers, loadTable) {
    if (!orderid && isNaN(orderid)) {
        alert("Invalid OrderID");
        location = 'orderlist.html';
        return;
    }
    else {
        fetch(`/api/orderDetailAdmin/${orderid}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const orderdetail = data.orderdetail;
                const order = data.order;
                if (order) {
                    const values = ["orderid", "createdat", "deliveryaddress", "name", "orderstatus", "paymentmethod", "totalamount", "totalqty"];
                    values.forEach((value, index) => {
                        let data = order[value];

                        if (index === 1) {
                            data = new Date(order[value]).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        }

                        if (index === 4 || index === 5) data = capitaliseWord(data);
                        if (index === 6) data = "$" + parseFloat(data).toFixed(2);

                        document.getElementById(value).textContent = data;
                    })
                    if (order.orderstatus === "in progress") {
                        let nextmonth = new Date();
                        nextmonth.setDate(new Date().getDate() + 31);
                        document.getElementById("button-group").innerHTML = `
                            <label>Choose Delivery Date:</label>
                            <input onchange="this.style.border = '1px solid #000';" style="margin-left: 8px; margin-right: 24px; outline: none;" type="date" id="deliverydateinput" min="${new Date().toISOString().split('T')[0]}" max="${nextmonth.toISOString().split('T')[0]}">
                            <button id="confirmbutton" class="btn-confirm" onclick="processUpdate(${order.orderid}, 'confirmed', ${order.userid})">Confirm</button>
                            <button id="cancelbutton" class="btn-cancel" onclick="processUpdate(${order.orderid}, 'cancelled', ${order.userid})">Cancel</button>
                        `;
                    }
                }
                const newData = [];
                orderdetail.forEach((item) => {
                    newData.push([`<img width="50" height="70" style="border-radius: 8px;" src="${item.image}"/>`, item.productid, item.productname, item.qty, `$${item.unitprice}`, capitaliseWord(item.colour), item.size]);
                })
                loadTable(tableClassName, headers, newData);
            })
            .catch((error) => {
                console.error(error);
                alert(error);
            })
    }
}

function processUpdate(orderid, status, userid) {

    if (status === "confirmed") {
        const deliveryDate = document.getElementById('deliverydateinput');
        if (deliveryDate.value.trim() === "") {
            alert("Please select delivery date!");
            deliveryDate.style.border = "2px solid red";
            return;
        }
        document.getElementById('confirmbutton').textContent = "Loading...";
        Promise.all([updateOrderStatus(orderid, status), createDelivery(deliveryDate.value, orderid, userid)])
            .then(([result1, result2]) => {
                alert(`Order ${orderid} is confirmed!`);
                location.reload();
            })
            .catch((error) => {
                console.error(error);
                alert(error);
                location.reload();
            });
    }
    else if (status === "cancelled") {
        document.getElementById('cancelbutton').textContent = "Loading...";
        updateOrderStatus(orderid, status)
            .then((result) => {
                // if (result && result.message === "Update Success") {
                alert(`Order ${orderid} is cancelled!`);
                location.reload();
                // }
                // else {
                // throw new Error(result.error);
                // }
            })
            .catch((error) => {
                console.error(error);
                alert(error);
                location.reload();
            })
    }
    else {
        alert("Invalid Status!");
        location.reload();
    }
}

function updateOrderStatus(orderid, status) {
    return fetch(`/api/orders/${orderid}/${status}/updateOrderByAdmin`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
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

// Use this for random getRandomShipperID();

async function fetchShipperIDs() {
    try {
        const response = await fetch('/shipperIdForDelivery', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',  // You can include other headers if needed
            },
        });
        const shipperIdList = await response.json();

        console.log('Shipper IDs:', shipperIdList);

    } catch (error) {
        console.error('Error fetching shipper IDs:', error);

    }
}

async function getRandomShipperID() {
    try {
        const shipperIdList = await fetchShipperIDs();

        if (shipperIdList.length > 0) {
            const randomIndex = Math.floor(Math.random() * shipperIdList.length);
            const randomShipperID = shipperIdList[randomIndex].shipId;

            console.log('Random Shipper ID:', randomShipperID);

            return randomShipperID;
        } else {
            console.error('Shipper ID list is empty.');

        }
    } catch (error) {
        console.error('Error fetching or processing shipper IDs:', error);

    }
}

function createDelivery(deliverydate, orderid, userid) {

    console.log(deliverydate);
    console.log(orderid);
    console.log(userid);
    const randomCode = generateRandomCode(15);
    const randomShipperID = getRandomShipperID();
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
            shipperid: randomShipperID,
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