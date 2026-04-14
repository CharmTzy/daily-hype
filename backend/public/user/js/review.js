let allReviews = [];
function getReview() {
    const productID = sessionStorage.getItem("selectedProductId");
    console.log("1. `/api/review/${productID}`", productID);
    fetch(`/api/review/${productID}`, {
        method: "GET",
    })
        .then(function (response) {
        console.log("2. function(response) = ", response);
        return response.json();
    })
        .then(function (result) {
        console.log("3. function(result) = ", result);
        allReviews = result.review;
        allReviews.forEach(function (review) {
            displayReview(review);
        });
        displayAverageRating();
    })
        .catch(function (error) {
        console.log("4. function(error) = ", error);
    });
}
function displayReview(review) {
    console.log("Review:", review);
    const reviewsContainer = document.querySelector(".reviews");
    const reviewDiv = document.createElement("div");
    reviewDiv.classList.add("review");
    const img = document.createElement("img");
    img.src = review.urls;
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
    if (review.createdat) {
        const formattedDate = new Date(review.createdat).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        date.textContent = `Reviewed on: ${formattedDate}`;
    }
    else {
        date.textContent = "Review date not available";
    }
    const updatedDate = document.createElement("p");
    updatedDate.classList.add("updated-date");
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
    reviewsContainer.innerHTML = "";
    let reviewsToShow = allReviews.filter((review) => {
        return selectedRating === "all" || review.rating.toString() === selectedRating;
    });
    if (reviewsToShow.length === 0) {
        const noReviewsMessage = document.createElement("p");
        noReviewsMessage.classList.add("noReviewsMessage");
        if (selectedRating === "all") {
            noReviewsMessage.textContent = "No reviews";
        }
        else {
            noReviewsMessage.textContent = `No ${selectedRating} star reviews`;
        }
        reviewsContainer.appendChild(noReviewsMessage);
    }
    else {
        reviewsToShow.forEach((review) => {
            displayReview(review);
        });
    }
}
function displayAverageRating() {
    const reviews = allReviews;
    if (reviews.length === 0) {
        console.log("No reviews available to calculate average rating.");
        return;
    }
    const totalRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRatings / reviews.length;
    const averageRatingContainer = document.querySelector(".average-rating");
    averageRatingContainer.innerHTML = "";
    const averageRatingParagraph = document.createElement("p");
    averageRatingParagraph.textContent = `Average Rating: ${averageRating.toFixed(1)} out of 5`;
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
    const createResult = await sendReviewToBackend(review);
    if (createResult) {
        window.location.href = "order.html";
    }
}
function sendReviewToBackend(review) {
    const token = localStorage.getItem("token");
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
                document.getElementById("rating").value = oneReview.rating;
                document.getElementById("reviewDescription").value = oneReview.reviewdescription;
            }
            else {
                console.log("No review data found for the specified orderID.");
            }
        }
        else {
            console.log("Review does not exist for this order");
        }
    }
    catch (error) {
        console.error("Error while filling form:", error.message);
    }
}
async function fetchReviewData(orderID) {
    try {
        const response = await fetch(`/api/getReviewData/${orderID}`);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        throw new Error("Error fetching review data: " + error.message);
    }
}
function updateReviewForOrder(reviewID, review) {
    const token = localStorage.getItem("token");
    if (!review.rating || !review.reviewDescription) {
        alert("Please provide valid values for rating and review description.");
        return Promise.resolve(false);
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
        return true;
    })
        .catch((error) => {
        console.error("Error updating review:", error);
        alert("Error updating review. Please try again.");
        return false;
    });
}

