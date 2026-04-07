// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 28.11.2023
// Description: To manage all frontend javascript functions related to sidebar (admin)

// toggle sidebar
// this function will only be called from loadSideBar
function toggleMenu() {
    const sidebarDiv = document.getElementById('sidebar');

    if (sidebarDiv.classList.contains('active')) {
        sidebarDiv.classList.remove('active');
        document.getElementsByClassName('main-content')[0].style.marginLeft = '5vw';
        document.getElementsByClassName('main-content')[0].style.width = '90vw';
        document.getElementsByClassName('toggle-menu')[0].style.right = '-48px';
        localStorage.setItem('sidebar', '');
    }
    else {
        sidebarDiv.classList.add('active');
        document.getElementsByClassName('main-content')[0].style.marginLeft = '25vw';
        document.getElementsByClassName('main-content')[0].style.width = '70vw';
        document.getElementsByClassName('toggle-menu')[0].style.right = '10px';
        localStorage.setItem('sidebar', 'active');
    }
}

// loading sidebar navigation and ui
// require => activeNav
// activeNav => provide your active navigation id written in sidebar.html
function loadSideBar(activeNav) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Invalid Token");
        location = '/user/login.html';
        return;
    }
    else {
        fetch("/api/validateAdminToken", {
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
                    location = "/user/login.html";
                    return;
                }

                fetch("sidebar.html")
                    .then((response) => response.text())
                    .then((data) => {
                        document.getElementById('sidebar').outerHTML = data;
                        const sidebar = localStorage.getItem('sidebar');
                        document.getElementById(activeNav).classList.add("active");
                        if (sidebar || sidebar === '') {
                            if (sidebar === 'active') {
                                document.getElementById('sidebar').classList.add("active");
                            }
                            else {
                                document.getElementsByClassName('main-content')[0].style.marginLeft = '5vw';
                                document.getElementsByClassName('main-content')[0].style.width = '90vw';
                                document.getElementsByClassName('toggle-menu')[0].style.right = '-48px';
                                localStorage.setItem('sidebar', '');
                            }
                        }
                        else {
                            document.getElementById('sidebar').classList.add("active");
                            localStorage.setItem('sidebar', 'active');
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        alert("Error in loading sidebar!");
                    })
            })
            .catch((error) => {
                console.error(error);
                alert("Error in validating your token!");
                localStorage.removeItem('token');
                localStorage.removeItem('deliveriesList');
                localStorage.removeItem('additionalDataPart2');
                localStorage.removeItem('additionalDataPart3');
                localStorage.removeItem('additionalDataPart2Title');
                localStorage.removeItem('additionalDataPart3Title');
                location = '/user/login.html';
            })
    }
}