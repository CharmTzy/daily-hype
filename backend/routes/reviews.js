// Name: Angie Toh Anqi
// Admin No: 2227915
// Class: DIT/FT/2B/02
// Date: 20.11.2023
// Description: Router for reviews

const express = require("express");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR, TABLE_ALREADY_EXISTS_ERROR, errorMessages } = require("../errors");
const reviewsModel = require("../models/reviews");
const imageModel = require("../models/images");
const validationFn = require("../middlewares/validateToken");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const cloudinary = require("../cloudinary");
const refreshFn = require("../middlewares/refreshToken");

// ca2

// for admins
router.get("/reviews/count/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return reviewsModel
    .getTotalReviewCount()
    .then((count) => {
      return res.json({ data: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/reviews/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  const tempOffset = req.query.offset;
  const tempLimit = req.query.limit;
  const offset = tempOffset !== undefined && !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
  const limit = tempLimit !== undefined && !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return reviewsModel
    .getReviewsByLimit(offset, limit)
    .then(function (review) {
      return res.json({ data: review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

// ca2

// for users
// create review
router.post("/createReview", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "customer") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  const { orderID, rating, reviewDescription } = req.body;

  console.log("INSIDE ROUTER");
  console.log(orderID);
  console.log(rating);
  console.log(reviewDescription);

  return reviewsModel.getProductID(orderID).then(function (productID) {
    console.log(productID);
    // Call the model function to create the product
    return reviewsModel.getProductDetailID(orderID).then(function (productDetailID) {
      console.log(productDetailID);
      // Call the model function to create the product
      return reviewsModel
        .createReview(rating, reviewDescription, id, productID, productDetailID, orderID)
        .then(function (review) {
          console.log("createReview() called.");
          return res.json({ review });
        })
        .catch(function (error) {
          console.error(error);
          if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
          }
          return res.status(500).json({ error: "Unknown Error, create review" });
        });
    });
  });
});

// retrieve reviews for one product
router.get("/review/:productID", (req, res) => {
  const productID = req.params.productID;

  return reviewsModel
    .getReviewByProductId(productID)
    .then(function (review) {
      console.log("getReviewByProductId() called.");
      return res.json({ review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/review/:userID", (req, res) => {
  const userID = req.params.userID;

  return reviewsModel
    .getReviewByUserId(userID)
    .then(function (review) {
      console.log("getReviewByUserId() called.");
      return res.json({ review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// update review
router.put("/updateReview/:reviewID", (req, res) => {
  const reviewID = req.params.reviewID;
  const rating = req.body.rating;
  const reviewDescription = req.body.reviewDescription;
  console.log("rating: " + rating);
  console.log("reviewDescription: " + reviewDescription);

  return reviewsModel
    .updateReview(rating, reviewDescription, reviewID)
    .then(function (review) {
      console.log("updateReview() called.");
      return res.json({ review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error, update review" });
    });
});

// delete review
router.delete("/deleteReview/:reviewID", (req, res) => {
  const reviewID = req.params.reviewID;

  return reviewsModel
    .deleteReview(reviewID)
    .then(function (review) {
      console.log("deleteReview() called.");
      return res.json({ review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/checkReviewExists/:orderID", async (req, res) => {
  const orderID = req.params.orderID;

  try {
    const reviewExists = await reviewsModel.checkReviewExists(orderID);
    console.log("Review Exists:", reviewExists); // Log reviewExists
    res.json({ exists: reviewExists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while checking review existence" });
  }
});

// retrieve reviews for one product
router.get("/getReviewData/:orderID", (req, res) => {
  const orderID = req.params.orderID;

  return reviewsModel
    .getReviewByOrderId(orderID)
    .then(function (review) {
      console.log("getReviewByOrderId() called.");
      return res.json({ review });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});


router.get("/getAllReviews", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const userId = req.body.id;
  console.log(userId)
  return reviewsModel
    .getAllReviewsByUserId(userId)
    .then(function (reviews) {
      return res.status(200).json({ reviews });
    })
    .catch(function (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
});

router.get("/getReview/:reviewID", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const reviewId = req.params.reviewId;
  const userId = req.body.id;
  console.log("reviewid and userid: ", reviewId, userId);

  return reviewModel
    .getReviewDetails(reviewId, userId)
    .then((review) => {
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      return res.status(200).json({ review });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// router.put("/editReview", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
//   const reviewId = req.body.reviewid;
//   const userId = req.body.id;

//   const { rating, reviewDescription } = req.body;

//   console.log("review body: ", reviewId, userId, rating, reviewDescription);

//   return reviewModel
//     .checkExistingReview(fullname, phone, postal_code, street, building, unit_no, userId)
//     .then((existingAddress) => {
//       if (existingAddress && existingAddress.address_id !== addressId) {
//         return res.status(400).json({ error: "Address already exists" });
//       } else {
//         return userModel.editAddress(addressId, userId, fullname, phone, postal_code, street, building, unit_no, region, is_default).then((updatedAddress) => {
//           if (!updatedAddress) {
//             return res.status(404).json({ error: "Address not found" });
//           }

//           return res.status(200).json({ address: updatedAddress });
//         });
//       }
//     })

//     .catch((error) => {
//       console.error(error);
//       return res.status(500).json({ error: "Unknown Error" });
//     });
// });

module.exports = router;