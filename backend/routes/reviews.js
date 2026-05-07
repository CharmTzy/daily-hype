const express = require("express");
const { EMPTY_RESULT_ERROR, errorMessages, successMessages } = require("../errors");
const reviewsModel = require("../models/reviews");
const ordersModel = require("../models/orders");
const productsModel = require("../models/products");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");

const router = express.Router();

function isAdminRole(role) {
    return role === "admin" || role === "manager";
}

function isCustomerRole(role) {
    return role === "customer";
}

function getRequestUser(req) {
    return {
        id: req.body.id,
        email: req.body.email,
        role: req.body.role,
    };
}

function validateUser(user) {
    return user.id && !isNaN(user.id) && user.email && user.role;
}

function parseReviewPayload(body) {
    const orderID = Number(body.orderID);
    const productDetailID = Number(body.productDetailID);
    const rating = Number(body.rating);
    const reviewDescription = typeof body.reviewDescription === "string" ? body.reviewDescription.trim() : "";

    return { orderID, productDetailID, rating, reviewDescription };
}

async function handleReviewDelete(req, res) {
    const user = getRequestUser(req);
    const reviewID = Number(req.params.reviewID);

    if (!validateUser(user) || isNaN(reviewID) || (!isCustomerRole(user.role) && !isAdminRole(user.role))) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    try {
        const review = isCustomerRole(user.role)
            ? await reviewsModel.getReviewDetails(reviewID, user.id)
            : await reviewsModel.getReviewById(reviewID);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const deletedReview = await reviewsModel.deleteReview(reviewID);
        await productsModel.syncProductRating(review.productid);

        return res.status(200).json({
            message: successMessages.DELETE_SUCCESS,
            review: deletedReview,
        });
    } catch (error) {
        console.error(error);

        if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
        }

        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
}

router.get("/reviews/count/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);

    if (!validateUser(user) || !isAdminRole(user.role)) {
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
    const user = getRequestUser(req);
    const tempOffset = Number(req.query.offset);
    const tempLimit = Number(req.query.limit);
    const offset = !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
    const limit = !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

    if (!validateUser(user) || !isAdminRole(user.role)) {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getReviewsByLimit(offset, limit)
        .then((review) => {
        return res.json({ data: review });
    })
        .catch((error) => {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.post("/createReview", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    const user = getRequestUser(req);
    const { orderID, productDetailID, rating, reviewDescription } = parseReviewPayload(req.body);

    if (!validateUser(user) || !isCustomerRole(user.role)) {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }

    if (
        isNaN(orderID) ||
        isNaN(productDetailID) ||
        isNaN(rating) ||
        rating < 1 ||
        rating > 5 ||
        reviewDescription.length === 0 ||
        reviewDescription.length > 1000
    ) {
        return res.status(400).json({ error: errorMessages.INVALID_INPUT });
    }

    try {
        const [receivedOrder, orderItems, existingReview] = await Promise.all([
            ordersModel.checkOrderStatus(orderID, "received", user.id),
            ordersModel.getOrderItemByOrderIdForRefund(orderID, user.id),
            reviewsModel.getReviewByOrderItem(orderID, productDetailID, user.id),
        ]);

        if (!receivedOrder) {
            return res.status(400).json({ error: "Review is only available after the order is received" });
        }

        const orderItem = orderItems.find((item) => item.productdetailid === productDetailID);

        if (!orderItem) {
            return res.status(404).json({ error: "Order item not found" });
        }

        if (existingReview) {
            return res.status(409).json({ error: "Review already exists" });
        }

        const review = await reviewsModel.createReview(
            rating,
            reviewDescription,
            user.id,
            orderItem.productid,
            productDetailID,
            orderID,
        );

        await productsModel.syncProductRating(orderItem.productid);

        return res.status(201).json({
            message: successMessages.CREATE_SUCCESS,
            review,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

router.get("/review/:productID/stats", (req, res) => {
    const productID = Number(req.params.productID);
    if (isNaN(productID)) {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    return reviewsModel
        .getReviewStatsByProductId(productID)
        .then((stats) => res.json({ stats }))
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
        });
});
router.get("/review/:productID", (req, res) => {
    const productID = Number(req.params.productID);
    if (isNaN(productID)) {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
    }
    const rating = req.query.rating !== undefined ? Number(req.query.rating) : null;
    const limit = Number(req.query.limit) || null;
    const offset = Number(req.query.offset) || 0;
    if (limit !== null) {
        const ratingFilter = rating !== null && !isNaN(rating) ? rating : null;
        return reviewsModel
            .getReviewByProductIdFiltered(productID, ratingFilter, limit, offset)
            .then((review) => res.json({ review }))
            .catch((error) => {
                console.error(error);
                return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
            });
    }
    return reviewsModel
        .getReviewByProductId(productID)
        .then((review) => res.json({ review }))
        .catch((error) => {
            console.error(error);
            if (error instanceof EMPTY_RESULT_ERROR) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
        });
});

router.get("/reviews/product/:productID", (req, res) => {
    const productID = Number(req.params.productID);

    if (isNaN(productID)) {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
    }

    return reviewsModel
        .getReviewByProductId(productID)
        .then((review) => {
        return res.json({ data: review });
    })
        .catch((error) => {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.put("/updateReview/:reviewID", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    const user = getRequestUser(req);
    const reviewID = Number(req.params.reviewID);
    const rating = Number(req.body.rating);
    const reviewDescription =
        typeof req.body.reviewDescription === "string" ? req.body.reviewDescription.trim() : "";

    if (!validateUser(user) || !isCustomerRole(user.role)) {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }

    if (isNaN(reviewID) || isNaN(rating) || rating < 1 || rating > 5 || reviewDescription.length === 0 || reviewDescription.length > 1000) {
        return res.status(400).json({ error: errorMessages.INVALID_INPUT });
    }

    try {
        const review = await reviewsModel.getReviewDetails(reviewID, user.id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const updatedReview = await reviewsModel.updateReview(rating, reviewDescription, reviewID);
        await productsModel.syncProductRating(review.productid);

        return res.status(200).json({
            message: successMessages.UPDATE_SUCCESS,
            review: updatedReview,
        });
    } catch (error) {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

router.delete("/deleteReview/:reviewID", validationFn.validateToken, refreshFn.refreshToken, handleReviewDelete);
router.put("/deleteReview/:reviewID", validationFn.validateToken, refreshFn.refreshToken, handleReviewDelete);

router.get("/checkReviewExists/:orderID", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    const user = getRequestUser(req);
    const orderID = Number(req.params.orderID);
    const productDetailID = Number(req.query.productDetailID || 0);

    if (!validateUser(user) || !isCustomerRole(user.role) || isNaN(orderID)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    try {
        const reviewExists = await reviewsModel.checkReviewExists(orderID, productDetailID, user.id);
        return res.json({ exists: reviewExists });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});

router.get("/getReviewData/:orderID", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);
    const orderID = Number(req.params.orderID);

    if (!validateUser(user) || !isCustomerRole(user.role) || isNaN(orderID)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getReviewByOrderId(orderID)
        .then((review) => {
        return res.json({ review });
    })
        .catch((error) => {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/getAllReviews", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);

    if (!validateUser(user) || !isCustomerRole(user.role)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getAllReviewsByUserId(user.id)
        .then((reviews) => {
        return res.status(200).json({ reviews });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/reviews/me", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);

    if (!validateUser(user) || !isCustomerRole(user.role)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getAllReviewsByUserId(user.id)
        .then((reviews) => {
        return res.status(200).json({ data: reviews });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/getReview/:reviewID", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);
    const reviewID = Number(req.params.reviewID);

    if (!validateUser(user) || !isCustomerRole(user.role) || isNaN(reviewID)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getReviewDetails(reviewID, user.id)
        .then((review) => {
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        return res.status(200).json({ review });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/reviews/order/:orderID/:productDetailID", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const user = getRequestUser(req);
    const orderID = Number(req.params.orderID);
    const productDetailID = Number(req.params.productDetailID);

    if (!validateUser(user) || !isCustomerRole(user.role) || isNaN(orderID) || isNaN(productDetailID)) {
        return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
    }

    return reviewsModel
        .getReviewByOrderItem(orderID, productDetailID, user.id)
        .then((review) => {
        return res.status(200).json({ review });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

module.exports = router;
