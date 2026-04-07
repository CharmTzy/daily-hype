/* Name: Wai Yan Aung
Admin No: 2234993
Date: 2.11.2023
Description: Login Page  */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("nextButton").addEventListener("click", function (event) {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      document.getElementById("emailWarning").innerText = "Please fill in all fields.";
      event.preventDefault();
      return;
    } else if (!isValidEmail(email)) {
      document.getElementById("emailWarning").innerText = "Please enter a valid email address.";
      event.preventDefault();
      return;
    } else if (password != confirmPassword) {
      document.getElementById("emailWarning").innerText = "Passwords do not match.";
      event.preventDefault();
      return;
    } else {
      document.getElementById("emailWarning").innerText = "";

      const additionalFields = document.getElementById("additionalFields");
      const initialFields = document.getElementById("initialFields");
      initialFields.style.display = "none";
      additionalFields.style.display = "block";
    }
  });

  document.getElementById("signupButton").addEventListener("click", function (event) {
    event.preventDefault();

    // Gather all input values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const gender = document.querySelector('input[name="gender"]:checked')
      ? document.querySelector('input[name="gender"]:checked').value
      : null;
    const address = document.getElementById("address").value;
    const region = document.getElementById("region").value;
    const role = "customer";
    // Create an object with all input values
    const userData = {
      name,
      email,
      password,
      phone,
      gender,
      address,
      region,
      role
    };

    const requests = [
      fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }),
    ];


    Promise.all(requests)
      .then(function (responses) {
        const successResponses = responses.filter(response => response.status === 201);
        const errorResponses = responses.filter(response => response.status !== 201);

        if (successResponses.length > 0) {
          alert("Accounts created successfully");
          window.location.href = "login.html";
        }

        if (errorResponses.length > 0) {
          errorResponses.forEach(errorResponse => {
            errorResponse.json().then(errorData => {
              console.error("Error:", errorData.error);
              document.getElementById("emailWarning").innerText = errorData.error;
            });
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("emailWarning").innerText = "An unexpected error occurred.";
      });
  });
});