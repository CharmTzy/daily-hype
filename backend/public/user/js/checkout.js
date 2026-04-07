// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 1.12.2023

const stripe = Stripe("pk_test_51OP59GDoGYotiWHLoyrEnu2W4W6XYmPk94V4iJw66c3h5YSZktk4JqLJEp59PVDbwOomBqDcfuiZ0PrZpWK8Oo4f00g0ioukHS");

let data = {};
let elements;
let email;

function initialisePayment() {

    const cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart || cart.length <= 0) {
        alert("Cart is empty!");
        location = "cart.html";
        return;
    }
    const cartData = cart.map(({ unitprice, maxqty, ...rest }) => rest);

    data.order = cartData;

    // creating payment intent when the user is ready to checkout
    fetch("/api/payment-intent", {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: cartData })
    })
        .then((response) => {
            console.log(response);

            return response.json();
        })
        .then((result) => {
            console.log(result);
            if (result.error === "Unauthorized Access") {
                alert("Invalid Token!");
                localStorage.removeItem('token');
                location = "login.html";
            }
            else if (result.error === "Unknown Error") {
                alert("Server Error");
                location = 'cart.html';
            }
            else if (result.error === "Insufficient Product Quantity") {
                alert("There is not enough stock for some of your orders!");
                location = 'cart.html';
            }
            else if (result.error === "Payment Error") {
                alert("Stripe payment error!");
                location = 'cart.html';
            }
            else if (result.error === "User Not Found") {
                alert("User Not Found");
                localStorage.removeItem('token');
                location = 'login.html';
            }
            else {
                // creating stripe elements with client secret key returned from backend
                elements = stripe.elements({
                    theme: 'stripe',
                    clientSecret: result.clientSecret
                });

                const paymentElement = elements.create("payment", { layout: "tabs" });
                paymentElement.mount("#payment-element");

                loadProductUI(result.product, result.address, cart);
                data.address = result.address;
                email = result.email;

                document.getElementById("payment-form").addEventListener("submit", async function (e) {
                    e.preventDefault();
                    // need to do stripe submit before further processing
                    elements.submit();
                    changeStep(1, 2);
                });
            }
        })
        .catch((error) => {
            console.error(error);
        })
}

// loading product ui design based on the product, cart
function loadProductUI(product, address, cart) {

    let htmlStr = '';

    product.forEach((productItem) => {

        const cartProduct = cart.find((item) => item.productdetailid === productItem.productdetailid);
        if (cartProduct) {

            htmlStr += `<div class="step-item-product">`;

            if (productItem.image) {
                htmlStr += `<img src="${productItem.image}" width="120" height="150" />`;
            }
            else {
                htmlStr += `<img src="img/sample.jpg" width="120" height="150" />`;
            }
            htmlStr += `<div class="step-item-product-description">
                    <label>${productItem.productname}</label>
                    <div class="product-detail">
                        <div class="colour-size-price">
                            <label>Colour: ${capitaliseFirstLetter(productItem.colour)}, Size: ${productItem.size.toUpperCase()}</label>
                            <label>$${productItem.unitprice}</label>
                        </div>
                        <div class="qty-price">
                            <label>x ${cartProduct.qty}</label>
                            <label>$${(cartProduct.qty * productItem.unitprice).toFixed(2)}</label>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    })

    htmlStr += `<p style="margin-top: 16px; font-size: 18px; font-weight: 500;">Shipping Address</p>
    <input type="text" id="address" oninput="checkAddress('${address}', this)" value="${address}" /><br>
    <input type="checkbox" id="chkaddress" onclick="changeAddress('${address}', this)" checked/> <label for="chkaddress">Use default address</label>`;
    document.getElementById('cart-product').innerHTML = htmlStr;
}

function changeAddress(address, element) {
    if (element.checked) {
        document.getElementById('address').value = address;
    }
}

function checkAddress(address, element) {
    if (element.value != address) {
        document.getElementById('chkaddress').checked = false;
    }
}

function capitaliseFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// animate fade out and fade in after duration delay
// duration delay is added not to make ui seem like it appears suddenly
function animateFade(outElement, outDisplayStyle, inElement, inDisplayStyle, duration) {
    outElement.classList.add('hidden');

    outElement.addEventListener('transitionend', function handleTransition() {
        outElement.removeEventListener('transitionend', handleTransition);

        setTimeout(() => {
            outElement.style.display = outDisplayStyle;
            inElement.style.display = inDisplayStyle;
            inElement.classList.remove('hidden');
            inElement.scrollIntoView();
        }, duration);
    })
}

// updating step label based on the current step
function changeStepLabel(currentStep) {
    for (let i = 1; i <= 3; i++) {
        const stepLabel = document.getElementById(`step${i}`);
        const labels = stepLabel.getElementsByTagName('label');

        if (i == currentStep) {
            for (let j = 0; j < labels.length; j++) {
                labels[j].classList.add('active');
                if (j === 0) {
                    labels[j].innerHTML = currentStep;
                }
            }
        }
        else {
            for (let j = 0; j < labels.length; j++) {
                if (i < currentStep && j == 0) {
                    labels[j].innerHTML = `<i class="fa-solid fa-check"></i>`;
                }
                labels[j].classList.remove('active');
            }
        }
    }
}

// preparing to update step label ui for each step
// requires previous step and next step
// preparing to go to another step
function changeStep(prevStep, nextStep) {

    const step1Div = document.getElementById('step-1');
    const step2Div = document.getElementById('step-2');
    const step3Div = document.getElementById('step-3');

    if (prevStep === 1 && nextStep === 2) {
        animateFade(step1Div, 'none', step2Div, 'flex', 500);
        changeStepLabel(nextStep);
    }
    else if (prevStep === 2 && nextStep === 1) {

        animateFade(step2Div, 'none', step1Div, 'flex', 500);
        changeStepLabel(nextStep);
    }
    else if (prevStep === 2 && nextStep === 3) {
        const addressInput = document.getElementById('address');
        if (!addressInput.value.trim()) {
            alert("Address cannot be empty!");
            addressInput.style.border = "1.5px solid red";
        }
        else {
            data.address = addressInput.value.trim();
            animateFade(step2Div, 'none', step3Div, 'flex', 500);
            changeStepLabel(nextStep);
            finalisePayment();
        }
    }
}

function finalisePayment() {

    const processing = document.getElementById('processing');
    const success = document.getElementById('success');
    const token = localStorage.getItem('token');

    // confirming payment with stripe
    // transactionid, amount, method and status are stored in the database
    // if the customer email is valid, he will receive the receipt email from stripe
    stripe.confirmPayment({
        elements,
        confirmParams: {
            receipt_email: email
        },
        redirect: 'if_required'
    })
        .then((result) => {
            // necessary data for inserting into payment table
            console.log(result);
            result = result.paymentIntent;
            data.payment = {
                transactionid: result.id,
                amount: result.amount,
                method: result.payment_method_types[0],
                status: result.status
            }

            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((result) => {
                    console.log(result);
                    // checking whether there is error during order processing
                    if (result.error) {
                        // because of incomplete information to insert into database, the transaction becomes invalid
                        if (result.error === "Invalid Transaction")
                            result.error = "Unable to process the order due to incomplete information. Please ensure all required data is provided before placing the order.";
                        // because of insufficient quantity during order processing
                        else if (result.error === "Insufficient Product Quantity")
                            result.error = "Apologies, there's not enough stock for some items in your order. Please adjust the quantity or choose alternative products.";

                        // show the order failure ui with error message
                        displayResult(processing, fail, true, result.error);
                    }
                    else {
                        // show the order success ui
                        localStorage.removeItem('cart');
                        displayResult(processing, success, false, '');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    // show the order failure ui with error message
                    displayResult(processing, fail, true, error);
                })
        })
        .catch((error) => {
            console.error(error);
            // show the order failure ui with payment error message
            if (error.type === "card_error" || error.type === "validation_error") {
                displayResult(processing, fail, true, error.message);
            }
        })
}

function displayResult(element1, element2, isFail, errMessage) {
    animateFade(element1, 'none', element2, 'flex', 500);

    // updating the step label for the final step (step 3)
    for (let i = 1; i <= 3; i++) {
        const stepLabel = document.getElementById(`step${i}`);
        const labels = stepLabel.getElementsByTagName('label');

        if (i === 3 && isFail) {
            labels[0].innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        }
        else {
            labels[0].innerHTML = `<i class="fa-solid fa-check"></i>`;
        }
        for (let j = 0; j < labels.length; j++) {
            labels[j].classList.remove('active');
        }
    }

    document.getElementById('error-message').textContent = errMessage;
}



