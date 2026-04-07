// Name: Angie Toh Anqi
// Admin No: 2227915
// Class: DIT/FT/2B/02
// Date: 20.11.2023
// Description: Functions for reviews

let allReviews = [];

function getReview() {
  // Retrieve the productid from session storage
  const productID = sessionStorage.getItem("selectedProductId");

  console.log("1. `/api/review/${productID}`", productID);

  // sequential processing
  fetch(`/api/review/${productID}`, {
    method: "GET",
  })
    // When the response is received, convert it to JSON
    .then(function (response) {
      console.log("2. function(response) = ", response);
      return response.json();
    })
    .then(function (result) {
      console.log("3. function(result) = ", result);
      allReviews = result.review; // Store all reviews in the global variable
      allReviews.forEach(function (review) {
        displayReview(review);
      });
      displayAverageRating();
    })
    .catch(function (error) {
      // If there's an error during the process, catch it here
      console.log("4. function(error) = ", error);
    });
}

// load the reviews in HTML page
function displayReview(review) {
  console.log("Review:", review);
  const reviewsContainer = document.querySelector(".reviews");
  const reviewDiv = document.createElement("div");
  reviewDiv.classList.add("review");

  const img = document.createElement("img");
  img.src = review.urls;
  // img.alt = "review image";

  const name = document.createElement("h4");
  name.classList.add("name");
  name.textContent = review.name;

  const rating = document.createElement("p");
  rating.classList.add("rating");
  rating.textContent = `Rating: ${review.rating} out of 5`;

  const reviewDescription = document.createElement("p");
  reviewDescription.classList.add("reviewdescription");
  reviewDescription.textContent = review.reviewdescription;

  const date = document.createElement("p");
  date.classList.add("date");

  // Check if 'createdat' exists in the 'review' object
  if (review.createdat) {
    const formattedDate = new Date(review.createdat).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    date.textContent = `Reviewed on: ${formattedDate}`;
  } else {
    date.textContent = "Review date not available";
  }

  const updatedDate = document.createElement("p");
  updatedDate.classList.add("updated-date");

  // Check if 'updatedat' exists in the 'review' object
  if (review.updatedat) {
    const formattedUpdatedDate = new Date(review.updatedat).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    updatedDate.textContent = `Updated on: ${formattedUpdatedDate}`;
  }

  reviewDiv.appendChild(img);
  reviewDiv.appendChild(name);
  reviewDiv.appendChild(rating);
  reviewDiv.appendChild(reviewDescription);
  reviewDiv.appendChild(date);
  reviewDiv.appendChild(updatedDate);

  reviewsContainer.appendChild(reviewDiv);
}

function displayReviewsByRating(selectedRating) {
  const reviewsContainer = document.querySelector(".reviews");
  reviewsContainer.innerHTML = ""; // Clear existing reviews

  let reviewsToShow = allReviews.filter((review) => {
    return selectedRating === "all" || review.rating.toString() === selectedRating;
  });

  if (reviewsToShow.length === 0) {
    const noReviewsMessage = document.createElement("p");
    noReviewsMessage.classList.add("noReviewsMessage"); // Add the class
    if (selectedRating === "all") {
      noReviewsMessage.textContent = "No reviews"; // Bug: only shows when dropdown is selected and refreshed
    } else {
      noReviewsMessage.textContent = `No ${selectedRating} star reviews`;
    }
    reviewsContainer.appendChild(noReviewsMessage); // Append the message when there are no reviews
  } else {
    reviewsToShow.forEach((review) => {
      displayReview(review);
    });
  }
}

function displayAverageRating() {
  const reviews = allReviews; // Assuming allReviews is populated with the reviews

  if (reviews.length === 0) {
    console.log("No reviews available to calculate average rating.");
    return;
  }

  // Calculate the total sum of ratings
  const totalRatings = reviews.reduce((acc, review) => acc + review.rating, 0);

  // Calculate the average rating
  const averageRating = totalRatings / reviews.length;

  // Display the average rating in the HTML
  const averageRatingContainer = document.querySelector(".average-rating");
  averageRatingContainer.innerHTML = ""; // Clear previous average rating if any

  const averageRatingParagraph = document.createElement("p");
  averageRatingParagraph.textContent = `Average Rating: ${averageRating.toFixed(1)} out of 5`; // Displaying the average rating with one decimal place

  averageRatingContainer.appendChild(averageRatingParagraph);
}

async function submitReview() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderID = urlParams.get("id");
  const rating = document.getElementById("rating").value;
  const reviewDescription = document.getElementById("reviewDescription").value;

  const review = {
    orderID: orderID,
    rating: rating,
    reviewDescription: reviewDescription,
  };

  // try {
  //     const exists = await reviewExists(orderID);

  //     if (exists) {
  //         const reviewData = await fetchReviewData(orderID);
  //         if (reviewData && reviewData.review && reviewData.review.length > 0) {
  //             const reviewID = reviewData.review[0].reviewid;
  //             const updateResult = await updateReviewForOrder(reviewID, review);
  //             if (updateResult) {
  //                 window.location.href = 'order.html'; // Redirect after successful update
  //             }
  //         } else {
  //             console.log('No review data found for the specified orderID.');
  //         }
  //     } else {
  // Create a new review
  const createResult = await sendReviewToBackend(review);
  if (createResult) {
    window.location.href = "order.html"; // Redirect after successful review creation
  }
  //     }
  // } catch (error) {
  //     console.error('Error submitting review:', error);
  //     alert('Error submitting review. Please try again.');
  // }
}

function sendReviewToBackend(review) {
  const token = localStorage.getItem("token");

  // Check for null or empty values in the review data
  if (!review.orderID || !review.rating || !review.reviewDescription) {
    alert("Please provide valid values for all fields.");
    return;
  }

  console.log("INSIDE REVIEW");
  console.log(review);

  return fetch("/api/createReview", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok. Status: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("data.reviewID", data);
      console.log("review successfully inserted");
      return data;
    })
    .catch((error) => {
      console.error("Error submitting review:", error);
      // alert('Error submitting review. Please try again.');
      // alert(error);
    });
}

async function reviewExists(orderID) {
  const response = await fetch(`/api/checkReviewExists/${orderID}`);
  const data = await response.json();
  return data.exists;
}

async function fillFormIfReviewExists(orderID) {
  try {
    const exists = await reviewExists(orderID);

    if (exists) {
      const reviewData = await fetchReviewData(orderID);

      if (reviewData && reviewData.review && reviewData.review.length > 0) {
        const oneReview = reviewData.review[0];
        console.log("Rating:", oneReview.rating);
        console.log("Review Description:", oneReview.reviewdescription);
        // Update form UI with the review data
        document.getElementById("rating").value = oneReview.rating;
        document.getElementById("reviewDescription").value = oneReview.reviewdescription;
        // Update other fields similarly
      } else {
        console.log("No review data found for the specified orderID.");
      }
    } else {
      console.log("Review does not exist for this order");
    }
  } catch (error) {
    console.error("Error while filling form:", error.message);
    // Handle error appropriately (e.g., show a message to the user)
  }
}

async function fetchReviewData(orderID) {
  try {
    const response = await fetch(`/api/getReviewData/${orderID}`);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await response.json();
    return data; // Assuming the data returned follows the expected structure
  } catch (error) {
    throw new Error("Error fetching review data: " + error.message);
  }
}

function updateReviewForOrder(reviewID, review) {
  const token = localStorage.getItem("token");

  // Check for null or empty values in the review data
  if (!review.rating || !review.reviewDescription) {
    alert("Please provide valid values for rating and review description.");
    return Promise.resolve(false); // Return a rejected promise indicating failure
  }

  return fetch(`/api/updateReview/${reviewID}`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok. Status: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Review successfully updated:", data);
      return true; // Indicate success
    })
    .catch((error) => {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
      return false; // Indicate failure
    });
}
