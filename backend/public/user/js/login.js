/* Name: Wai Yan Aung
Admin No: 2234993
Date: 2.11.2023
Description: Login Page  */

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginButton").addEventListener("click", function (event) {
        event.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        
        if (email.trim() === "" || password.trim() === "") {
          document.getElementById("emailWarning").innerText = "Please enter both email and password.";
        } else if (!isValidEmail(email)) {
          document.getElementById("emailWarning").innerText = "Please enter a valid email address.";
        } else {
          document.getElementById("emailWarning").innerText = "";
   
          // Perform the login process by sending the credentials to the server
          fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })
            .then(function(response) {
                return response.json();
           
            })
            .then(data => {
               if(data.error) {
              
                document.getElementById("emailWarning").innerText = "Invalid email or password";
               }
               else {
                // success
                localStorage.setItem('token', data.token);

                if (data.user.role === 'customer') {
                  window.location.href = "index.html";
              } else if (data.user.role === 'admin') {
                  window.location.href = "../admin/index.html";
              } else {
                  console.error('Unknown user role:', data.user.role);
              }
               }
               
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
      });
});