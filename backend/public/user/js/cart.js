// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 1.12.2023

function getCartItems() {
    const token = localStorage.getItem('token');
    const cartData = JSON.parse(localStorage.getItem('cart'));

    if (cartData && cartData.length > 0) {
        // getting all productdetailid from cart for retrieval of product data
        let productDetailID = cartData.map(item => item.productdetailid);
        console.log(productDetailID);

        // all product detail id are joined by ','
        productDetailID = productDetailID.join(',');

        // image fetch with concurrent request
        fetch(`/api/productDetailForCart?productDetailID=${productDetailID}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                checkCartItem(result.productDetail);
                changeCartItemUI(result.productDetail);
            })
            .catch(function (error) {
                console.error(error);
            })
    }
    else {
        changeCartItemUI([]);
    }
}

// check and modify the invalid cart items in case the user changes himself
function checkCartItem(productDetail) {

    const cart = JSON.parse(localStorage.getItem('cart'));
    const newCart = [];                     // to add checked product into new cart
    const checkedProductDetailID = [];      // to check whether this product is already checked

    productDetail.forEach((product) => {
        cart.forEach((item) => {

            // check whether this product is already checked
            if (!checkedProductDetailID.includes(product.productdetailid)) {
                if (product.productdetailid == item.productdetailid) {

                    if (product.qty > 0) {
                        // check whether there is qty in cart (checking undefined case)
                        if (!item.qty) {
                            item.qty = 1;   // set qty to default 1
                        }

                        // check whether the qty in cart is more than available product qty
                        if (item.qty > product.qty) {
                            item.qty = 1;
                        }

                        newCart.push({ productdetailid: item.productdetailid, unitprice: product.unitprice, qty: item.qty, maxqty: product.qty });
                        checkedProductDetailID.push(product.productdetailid);
                    }
                }
            }
        })
    })

    localStorage.setItem("cart", JSON.stringify(newCart));
}

// update
function changeCartItemUI(product) {

    const cart = JSON.parse(localStorage.getItem('cart'));
    let totalqty = 0, totalprice = 0;

    if (product && product.length > 0 && cart && cart.length > 0) {

        let htmlString = '';
        product.forEach((item, index) => {
            totalqty += cart[index].qty;
            totalprice += item.unitprice * cart[index].qty;
            htmlString += `<div class="row cart-item">
            <div class="col-lg-2 cart-item-image-div">`;

            if (item.image) {
                htmlString += `<img width="100%" height="100%" src="${item.image}" title="${item.productname}" />`;
            }
            else {
                htmlString += `<img width="100%" height="100%" src="./img/sample.jpg" title="${item.productname}" />`;
            }

            htmlString += `<span>${(item.qty == 1) ? item.qty + " item left" : item.qty + " items left"}</span>
            </div>
            <div class="col-lg-1"></div>
            <div class="col-lg-4">
                <a href="productdetail.html">${item.productname}</a><br>
                <label class="color-text">colour: ${item.colour}, </label>
                <label class="size-text">size: ${item.size}</label><br>
                <label class="price-text">$<span id="unitprice${index}">${item.unitprice}</span></label>
            </div>
            <div class="col-lg-2">
                <label onclick="changeQty(-1, ${index}, false)">-</label>
                <input id="qty${index}" onchange="changeQty(this.value, ${index}, true)" type="number" min="1" value="${cart[index].qty}"
                    title="Enter between 1 and ${item.qty}" />
                <label onclick="changeQty(1, ${index}, false)">+</label>
            </div>
            <div class="col-lg-2">
                <div>
                    <label class="total-price">$<span id="totalprice${index}">${(item.unitprice * cart[index].qty).toFixed(2)}</span></label>
                    <i class="fa-solid fa-trash delete-icon" onclick="removeFromCart(${index})" title="Remove item"></i>
                </div>
            </div>
        </div>`;
        })

        document.getElementById('total-qty').textContent = totalqty;
        document.getElementById('total-price').textContent = "$" + totalprice.toFixed(2);

        document.getElementById('cart-item-div').innerHTML = htmlString;

        document.getElementsByClassName('no-cart')[0].style.display = "none";
        document.getElementsByClassName('cart')[0].style.display = "block";
    }
    else {
        document.getElementsByClassName('cart')[0].style.display = "none";
        document.getElementsByClassName('no-cart')[0].style.display = "block";
    }
}

// update the quantity in UI
function changeQty(num, index, isInputChanged) {

    const cart = JSON.parse(localStorage.getItem('cart'));
    const input = document.getElementById(`qty${index}`);
    const unitprice = document.getElementById(`unitprice${index}`).textContent;
    let totalprice = document.getElementById(`totalprice${index}`);
    const currentQty = parseInt(input.value);
    let newQty = 1;
    if (isInputChanged)
        newQty = currentQty;
    else
        newQty = currentQty + num;
    if (newQty > 0 && newQty <= cart[index].maxqty) {
        input.value = newQty;
        updateLocalStorageQty(newQty, index);
        // check whether price is a number
        if (!isNaN(unitprice))
            totalprice.textContent = (newQty * parseFloat(unitprice)).toFixed(2);
        else {
            // call fetch to get product data and check if there is data loss in localStorage
            alert("Price conversion error!");
        }
    }
    else {
        if (isInputChanged) {
            input.value = 1;
            updateLocalStorageQty(1, index);
            totalprice.textContent = (1 * parseFloat(unitprice)).toFixed(2);
        }
        if (newQty <= 0)
            alert("Your quantity cannot be 0 and less than 0!");
        if (newQty > cart[index].maxqty)
            alert("You have reached maximum quantity!");
    }
}

// when the quantity is changed, the quantity in localstorage is also updated
function updateLocalStorageQty(qty, index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart.length >= index) {
        cart[index].qty = qty;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updatePaymentUI();
}

// remove the item from the cart and localstorage
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart.length >= index) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload(true);
}

function updatePaymentUI() {
    const cart = JSON.parse(localStorage.getItem('cart'));

    let totalqty = 0, totalprice = 0;
    for (let i = 0; i < cart.length; i++) {
        totalqty += cart[i].qty;
        totalprice += cart[i].qty * cart[i].unitprice;
    }
    if (!isNaN(totalqty) && !isNaN(totalprice)) {
        document.getElementById('total-qty').textContent = totalqty;
        document.getElementById('total-price').textContent = "$" + totalprice.toFixed(2);
        let showQty = 0;
        if (cart) {
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].qty && !isNaN(cart[i].qty)) {
                    showQty += cart[i].qty;
                }
            }
        }
        document.getElementById('cart').innerHTML = `<a class="nav-link text-white" href="cart.html">Your Cart (${showQty})</a>`;
    }
    else {
        location.reload(true);
    }
}