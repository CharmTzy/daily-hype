// Name: Zay Yar Tun
// Admin No: 2235035
// Date: 5.11.2023
// Description: to control header and footer navigation

const token = localStorage.getItem('token');

// load both header and footer concurrently
// require => set condition to true if the public can access your page (default false)
// condition true will not validate your token if there is no token
async function loadHeaderFooter(condition = false) {
    await Promise.all([loadHeader(), loadFooter()])
        .then(([value1, value2]) => {
            if (value1 && value2) {
                if (condition) {
                    if (token) {
                        if (validateToken()) {
                            checkNavItems(true);
                        }
                        else {
                            checkNavItems(false);
                        }
                    }
                    else {
                        checkNavItems(false);
                    }
                }
                else {
                    if (validateToken()) {
                        checkNavItems(true);
                    }
                    else {
                        checkNavItems(false);
                    }
                }
            }
        })
        .catch(error => {
            console.error(error);
            alert("Error in Header and Footer Navigation");
        })
}

function validateToken() {

    if (token == undefined) return false;

    return fetch("/api/validateToken", {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token
        }
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error === "Unauthorized Access") {
                alert("Token Expired!");
                localStorage.removeItem('token');
                location = "login.html";
                return false;
            }
            else {
                return true;
            }
        })
        .catch((error) => {
            console.error(error);
            alert("Error in validating token");
            return false;
        })
}

// loading header from header.html file
async function loadHeader() {
    return fetch("header.html")
        .then((response) => response.text())
        .then((data) => {
            document.querySelector("nav").outerHTML = data;
            return true;
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
}

// loading footer from footer.html file
async function loadFooter() {
    return fetch("footer.html")
        .then((response) => response.text())
        .then((data) => {
            document.querySelector("footer").outerHTML = data;
            return true;
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
}

// changing navItems according to loggedIn state
function checkNavItems(isLoggedIn) {

    // setting nav links for after login and before login
    const navItemListAfterLoggedIn = ["home", "product", "cart", "profile", "order", "delivery", "signout"];
    const navItemListBeforeLoggedIn = ["home", "product", "dropdown", "signin", "signup", "delivery"];

    // getting all nav items and changing them to array
    const navItems = Array.from(document.getElementsByClassName('nav-item'));
    let cart = JSON.parse(localStorage.getItem('cart'));

    navItems.forEach(navItem => {
        if (isLoggedIn) {
            // showing only related nav links after login
            if (!navItemListAfterLoggedIn.includes(navItem.id)) {
                navItem.style.display = "none";
            }

            // displaying number of shopping cart items
            if (navItem.id === "cart") {
                if (!cart) {
                    cart = [];
                }
                let totalqty = 0;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].qty && !isNaN(cart[i].qty)) {
                        totalqty += cart[i].qty;
                    }
                }
                navItem.innerHTML = `<a class="nav-link text-white" href="cart.html">Your Cart (${totalqty})</a>`;
            }
        }
        else {
            // showing only related nav links before login
            if (!navItemListBeforeLoggedIn.includes(navItem.id)) {
                navItem.style.display = "none";
            }
        }
    })
}