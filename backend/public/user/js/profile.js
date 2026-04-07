// Name: Zay Yar Tun
function getOrderCount() {
  fetch(`/api/orderCount?status=all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.count) {
        document.getElementById('ordercount').textContent = data.count;
      }
    })
}
// Name: Zay Yar Tun

//Name : Wai Yan Aung
function fetchProfile() {
  return fetch("/api/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error(error);
      window.href.location = '/user/login.html';
      throw error;
    });
}

function fetchPhoto() {
  return fetch("/api/getPhoto", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch profile data

  const fetchProfileData = () => {
    return Promise.all([fetchProfile(), fetchPhoto()])
      .then(([profileData, photoData]) => {
        var pf = profileData.image;
        if (photoData.url != null) {
          pf = photoData.url;
        } else {
          pf = "https://ssl.gstatic.com/accounts/ui/avatar_2x.png";
        }
        document.getElementById("name").value = profileData.name;
        document.getElementById("email").value = profileData.email;

        document.getElementById("currentPhoto").src = pf;

        if (profileData && profileData.gender !== undefined) {
          const genderRadio = document.querySelector(
            `input[name="gender"][value="${profileData.gender}"]`
          );
          if (genderRadio) {
            genderRadio.checked = true;
          }
        }

        document.getElementById("phone").value = profileData.phone;
        document.getElementById("address").value = profileData.address;
        document.getElementById("password").value = "";
      })
      .catch((error) => {
        console.error("Error loading user profile:", error);
      });
  };

  // Function to update profile
  const updateProfile = (profileData) => {
    return fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(profileData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Profile updated successfully:", responseData);
        alert("Profile updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        throw error;
      });
  };

  // Function to upload photo
  const uploadPhoto = (file, email) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("email", email);
    console.log("FOrm Data" + formData);
    if (formData) {
      fetch("/api/upload-photo", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
      })
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log("Photo uploaded successfully:", data);
          alert("Photo uploaded successfully!");
        })
        .catch((error) => {
          console.error("Error uploading photo:", error);
          throw error;
        });
    } else {
      console.log("No photo updated");
    }
  };
  // Function to update password
  const updatePassword = (profileData) => {
    if (profileData["password2"] && profileData["password3"]) {
      // Updating password
      const newPassword = profileData["password2"];

      if (newPassword.length < 8) {
        alert("New password must be at least 8 characters long.");
        return;
      }

      // Check if the new password contains at least one special character
      const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharacterRegex.test(newPassword)) {
        alert("New password must contain at least one special character.");
        return;
      }

      // Check if the new password contains at least one number
      const numberRegex = /\d/;
      if (!numberRegex.test(newPassword)) {
        alert("New password must contain at least one number.");
        return;
      }

      if (profileData["password2"] !== profileData["password3"]) {
        alert("New password and confirm new password must match!");
        return;
      }
      if (!profileData["password"]) {
        alert("Please provide the old password.");
        return;
      }

      // Proceed with updating password
      fetch("/api/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          email: profileData["email"],
          oldPassword: profileData["password"],
          newPassword: profileData["password2"],
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to update password");
          }
        })
        .then((responseData) => {
          console.log("Password updated successfully:", responseData);
          alert("Password updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating password:", error);
          alert("Error updating password. Please check your old password.");
        });
    }
  };

  // Function to handle the save button click
  const handleSaveButtonClick = (event) => {
    event.preventDefault();
    const form = document.getElementById("profileForm");
    const formData = new FormData(form);
    const profileData = {};
    formData.forEach((value, key) => {
      profileData[key] = value;
    });
    console.log(profileData);
    const photoInput = document.getElementById("photoInput");
    const file = photoInput.files[0];
    const email = profileData.email;

    uploadPhoto(file, email);
    updatePassword(profileData);
    updateProfile(profileData);
  };

  fetchProfileData();
  const saveButton = document.getElementById("saveProfile");
  saveButton.addEventListener("click", handleSaveButtonClick);

  const deleteAccount = () => {
    const deletePassword = document.getElementById("deletePassword").value;
    return fetch("/api/deleteAccount", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ password: deletePassword }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Account deleted successfully", data);
        alert('Account deleted successfully');
        document.getElementById("deletePassword").value = "";
        window.location.href = '/user/login.html';
      })
      .catch((error) => {
        console.error("Error deleting account:", error.message);
        alert("Error deleting account. Please check your password and try again.");
      });
  };
  const confirmDelete = document.getElementById("confirmDelete");
  confirmDelete.addEventListener("click", deleteAccount);
});
