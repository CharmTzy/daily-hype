const express = require("express");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR, TABLE_ALREADY_EXISTS_ERROR, errorMessages, successMessages } = require("../errors");
const paymentsModel = require("../models/payments");
const productsModel = require("../models/products");
const usersModel = require("../models/users");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const { convertDollarToCent } = require("../functions/money-formatter");
const { formatDecimalNumber } = require("../functions/number-formatter");
const router = express.Router();
router.post("/checkout/payment/success", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const id = req.body.id;
    const role = req.body.role;
    const email = req.body.email;
    if (!id || isNaN(id) || !role || !email || role != "customer") {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }
    let paymentintent = req.body.paymentintent;
    let orderid = req.body.orderid;
    return paymentsModel
        .retrievePaymentIntent(paymentintent)
        .then((result) => {
        if (result.status === "succeeded") {
            const paymentID = Date.now().toString() + Math.floor(Math.random() * 1000);
            return paymentsModel.insertPayment(orderid, paymentID, "card", result.amount / 100, result.status, paymentintent).then((result) => {
                if (result === 1) {
                    return res.status(201).json({ message: successMessages.CREATE_SUCCESS });
                }
                else {
                    return res.status(400).json({ error: errorMessages.PAYMENT_ERROR });
                }
            });
        }
        else {
            return res.status(400).json({ error: errorMessages.PAYMENT_ERROR });
        }
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});
router.post("/checkout/payment/start", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const id = req.body.id;
    const role = req.body.role;
    const email = req.body.email;
    if (!id || isNaN(id) || !role || !email || role != "customer") {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }
    let cart = req.body.cart;
    const isValid = cart.every((item) => {
        return item.productdetailid !== undefined && item.qty !== undefined && !isNaN(item.productdetailid) && !isNaN(item.qty);
    });
    if (!isValid) {
        return res.status(400).json({ error: errorMessages.INVALID_CART });
    }
    cart = cart.filter((item, index) => cart.findIndex((i) => i.productdetailid === item.productdetailid) === index);
    const productDetailIDArr = cart.map((item) => item.productdetailid);
    return productsModel
        .getProductDetailByIds(productDetailIDArr)
        .then(function (product) {
        const productIDArr = product.map((p) => p.productid);
        let totalAmount = 0;
        const condition = cart.every((item) => {
            const matchedProduct = product.find((item2) => item2.productdetailid === item.productdetailid);
            totalAmount += item.qty * matchedProduct.unitprice;
            return !matchedProduct || item.qty <= matchedProduct.qty;
        });
        if (!condition) {
            return res.status(400).json({ error: errorMessages.INSUFFICIENT_QTY });
        }
        totalAmount = convertDollarToCent(formatDecimalNumber(totalAmount, 2));
        return Promise.all([paymentsModel.getPaymentIntent(totalAmount), usersModel.getAllAddressesByUserId(id), productsModel.getProductImageByProductIDArr(productIDArr)])
            .then(([payment, address, image]) => {
            product.forEach((p) => {
                for (let j = 0; j < image.length; j++) {
                    if (p.productid === image[j].productid) {
                        p.image = image[j].url;
                        break;
                    }
                }
            });
            if (payment && payment.client_secret) {
                return res.status(201).json({ clientsecret: payment.client_secret, address: address, product: product, cart: cart });
            }
        })
            .catch((error) => {
            console.error(error);
            throw error;
        });
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});
router.put("/order/refund/request/:orderid", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const id = req.body.id;
    const email = req.body.email;
    const role = req.body.role;
    if (!id || isNaN(id) || !role || !email || role !== "customer") {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }
    const tempOrderID = req.params.orderid;
    const orderID = tempOrderID;
    return paymentsModel.refundPayment(orderID);
    return paymentsModel
        .getPaymentTransactionID(id, orderID)
        .then((result) => {
        if (result) {
            console.log(result);
        }
        else {
            return res.status(400).json({ error: errorMessages.INVALID_INPUT });
        }
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});
module.exports = router;

