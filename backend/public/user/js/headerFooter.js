const token = localStorage.getItem('token');
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
    });
}
function validateToken() {
    if (token == undefined)
        return false;
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
    });
}
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
function checkNavItems(isLoggedIn) {
    const navItemListAfterLoggedIn = ["home", "product", "cart", "profile", "order", "delivery", "signout"];
    const navItemListBeforeLoggedIn = ["home", "product", "dropdown", "signin", "signup", "delivery"];
    const navItems = Array.from(document.getElementsByClassName('nav-item'));
    let cart = JSON.parse(localStorage.getItem('cart'));
    navItems.forEach(navItem => {
        if (isLoggedIn) {
            if (!navItemListAfterLoggedIn.includes(navItem.id)) {
                navItem.style.display = "none";
            }
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
            if (!navItemListBeforeLoggedIn.includes(navItem.id)) {
                navItem.style.display = "none";
            }
        }
    });
}
