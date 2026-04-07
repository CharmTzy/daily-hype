// Name: Angie Toh Anqi
// Admin No: 2227915
// Class: DIT/FT/2B/02
// Date: 30.11.2023
// Description: To manage all frontend javascript functions related to review list (admin)

const token = localStorage.getItem('token');

function getReviewCount() {
    return fetch(`/api/reviewsCountAdmin`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.count) {
                return Math.ceil(result.count / 10);
            }
            else {
                throw new Error("Pagination Error");
            }
        })
        .catch((error) => {
            console.error(error);
            throw error;
        })
}

function getReviewData(offset) {
    return fetch(`/api/reviewsAdmin?offset=${offset}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            const newResult = [];
            if (result.review) {
                result.review.forEach((review) => {
                    const itemArr = [];

                    if (review.urls && review.urls.length > 0 && review.urls[0] !== null) {
                        itemArr.push(`<img width="50" height="70" style="border-radius: 8px;" src="${review.urls[0]}"/>`);
                    }
                    else {
                        itemArr.push("-");
                    }
                    itemArr.push(review.reviewid, review.name, review.productname, review.rating, review.reviewdescription);
                    itemArr.push(`<button class="btn-cancel" onclick="deleteReview(${review.reviewid})">Delete</button>`);
                    // itemArr.push(`<button class="btn-cancel" onclick="deleteReview(${review.reviewid})">Delete</button><button class="btn-view" onclick="location='reviewdetail.html?id=${review.reviewid}'">Detail</button>`);
                    newResult.push(itemArr);
                })
            }
            return newResult;
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            return [];
        })
}

function getNewReviewData(current) {
    if (isNaN(current)) {
        alert("Error in Pagination");
    }
    else {
        getReviewData((current - 1) * 10)
            .then((data) => {
                console.log(data);
                loadTable("reviewtable", headers, data);
            })
    }
}

function deleteReview(reviewid) {

    confirmation = confirm("Are you sure you want to delete this review?");

    if (confirmation) {
        fetch(`/api/deleteReview/${reviewid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to delete review: ${response.statusText}`);
                }
                location.reload();
            })
            .catch(error => {
                console.error('Error deleting review:', error);
                alert('Error deleting review. Please try again.');
            });
    }
}