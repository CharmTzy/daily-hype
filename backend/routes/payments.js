const express = require("express");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR, TABLE_ALREADY_EXISTS_ERROR, errorMessages, successMessages } = require("../errors");
const paymentsModel = require("../models/payments");
const productsModel = require("../models/products");
const usersModel = require("../models/users");
const { connect } = require("../database");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const { convertDollarToCent } = require("../functions/money-formatter");
const { formatDecimalNumber } = require("../functions/number-formatter");
const router = express.Router();
const SHIPPING_FEE = 1.5;
const GST_PERCENT = 9;
const GST_RATE = GST_PERCENT / 100;
function hasValidCheckoutContext(id, role, email) {
    return !!id && !isNaN(id) && !!role && !!email && role === "customer";
}
function hasValidCart(cart) {
    return Array.isArray(cart) && cart.length > 0 && cart.every((item) => item.productdetailid !== undefined && item.qty !== undefined && !isNaN(item.productdetailid) && !isNaN(item.qty));
}
function buildDeliveryAddress(addressResult) {
    let deliveryAddress = "Blk " + addressResult.block_no;
    if (addressResult.street) {
        deliveryAddress += ", " + addressResult.street;
    }
    if (addressResult.unit_no) {
        deliveryAddress += ", " + addressResult.unit_no;
    }
    if (addressResult.building) {
        deliveryAddress += ", " + addressResult.building;
    }
    deliveryAddress += ", Singapore " + addressResult.postal_code;
    return deliveryAddress;
}
function calculateCheckoutAmounts(cart, productRows) {
    let subtotal = 0;
    let totalQty = 0;
    const lineItems = cart.map((item) => {
        const matchedProduct = productRows.find((productRow) => productRow.productdetailid === item.productdetailid);
        if (!matchedProduct) {
            throw new Error(errorMessages.INVALID_INPUT);
        }
        const unitprice = parseFloat(matchedProduct.unitprice);
        subtotal += item.qty * unitprice;
        totalQty += item.qty;
        return {
            productdetailid: item.productdetailid,
            qty: item.qty,
            unitprice,
            productid: matchedProduct.productid,
            availableqty: matchedProduct.qty,
        };
    });
    const formattedSubtotal = formatDecimalNumber(subtotal, 2);
    const gstAmount = formatDecimalNumber(formattedSubtotal * GST_RATE, 2);
    const total = formatDecimalNumber(formattedSubtotal + SHIPPING_FEE + gstAmount, 2);
    return {
        subtotal: formattedSubtotal,
        gstAmount,
        shippingFee: SHIPPING_FEE,
        total,
        totalQty,
        lineItems,
    };
}
function buildOrderID() {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}
async function finaliseSuccessfulCheckout(userID, addressID, cart, paymentIntent) {
    const client = await connect();
    try {
        await client.query("BEGIN");
        const existingPayment = await client.query("SELECT orderid FROM payment WHERE transactionid = $1 LIMIT 1", [paymentIntent.id]);
        if (existingPayment.rows[0]) {
            await client.query("COMMIT");
            return { orderid: existingPayment.rows[0].orderid, alreadyProcessed: true };
        }
        const productDetailIDArr = cart.map((item) => item.productdetailid);
        const productResult = await client.query(`
            SELECT pd.productdetailid, pd.qty, p.productid, p.unitprice
            FROM productdetail pd
            JOIN product p ON pd.productid = p.productid
            WHERE pd.productdetailid = ANY($1::int[])
            FOR UPDATE
        `, [productDetailIDArr]);
        const addressResult = await client.query("SELECT * FROM address WHERE address_id = $1 AND userid = $2", [addressID, userID]);
        if (addressResult.rows.length === 0 || productResult.rows.length !== productDetailIDArr.length) {
            throw new Error(errorMessages.INVALID_INPUT);
        }
        const checkoutAmounts = calculateCheckoutAmounts(cart, productResult.rows);
        const hasInsufficientQty = checkoutAmounts.lineItems.some((item) => item.qty > item.availableqty);
        if (hasInsufficientQty) {
            throw new Error(errorMessages.INSUFFICIENT_QTY);
        }
        const expectedAmount = convertDollarToCent(checkoutAmounts.total);
        const actualAmount = paymentIntent.amount_received || paymentIntent.amount;
        if (expectedAmount !== actualAmount) {
            throw new Error(errorMessages.PAYMENT_ERROR);
        }
        const orderID = buildOrderID();
        await client.query(`
            INSERT INTO productorder (orderid, updatedat, totalqty, totalamount, deliveryaddress, orderstatus, userid, shippingfee, gst)
            VALUES ($1, NOW(), $2, $3, $4, 'in progress', $5, $6, $7)
        `, [orderID, checkoutAmounts.totalQty, checkoutAmounts.total, buildDeliveryAddress(addressResult.rows[0]), userID, checkoutAmounts.shippingFee, GST_PERCENT]);
        const itemPlaceholders = checkoutAmounts.lineItems.map((item, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(", ");
        const itemValues = checkoutAmounts.lineItems.flatMap((item) => [item.productdetailid, orderID, item.qty, item.unitprice]);
        await client.query(`INSERT INTO productorderitem (productdetailid, orderid, qty, unitprice) VALUES ${itemPlaceholders}`, itemValues);
        await Promise.all(checkoutAmounts.lineItems.map((item) => client.query("UPDATE productdetail SET qty = qty - $1 WHERE productdetailid = $2", [item.qty, item.productdetailid])));
        await Promise.all(checkoutAmounts.lineItems.map((item) => client.query("UPDATE product SET soldqty = soldqty + $1 WHERE productid = $2", [item.qty, item.productid])));
        await client.query(`
            UPDATE productdetail
            SET productstatus = CASE
                WHEN qty > 0 THEN 'in stock'
                ELSE 'out of stock'
            END
            WHERE productdetailid = ANY($1::int[])
        `, [productDetailIDArr]);
        await client.query("DELETE FROM cart WHERE userid = $1 AND productdetailid = ANY($2::int[])", [userID, productDetailIDArr]);
        const paymentID = Date.now().toString() + Math.floor(Math.random() * 1000);
        await client.query(`
            INSERT INTO payment (paymentid, orderid, paymentmethod, amount, paymentstatus, transactionid)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [paymentID, orderID, "card", checkoutAmounts.total, paymentIntent.status, paymentIntent.id]);
        await client.query("COMMIT");
        return { orderid: orderID, alreadyProcessed: false };
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
router.post("/checkout/payment/success", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    const id = req.body.id;
    const role = req.body.role;
    const email = req.body.email;
    if (!hasValidCheckoutContext(id, role, email)) {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }
    const paymentintent = req.body.paymentintent;
    const addressID = req.body.addressID;
    let cart = req.body.cart;
    if (!paymentintent || isNaN(addressID) || !hasValidCart(cart)) {
        return res.status(400).json({ error: errorMessages.INVALID_INPUT });
    }
    cart = cart.filter((item, index) => cart.findIndex((currentItem) => currentItem.productdetailid === item.productdetailid) === index);
    try {
        const existingPayment = await paymentsModel.getPaymentByTransactionID(paymentintent);
        if (existingPayment) {
            return res.status(200).json({ message: successMessages.CREATE_SUCCESS, orderid: existingPayment.orderid });
        }
        const paymentIntentResult = await paymentsModel.retrievePaymentIntent(paymentintent);
        if (paymentIntentResult.status !== "succeeded") {
            return res.status(400).json({ error: errorMessages.PAYMENT_ERROR });
        }
        const finalisedOrder = await finaliseSuccessfulCheckout(id, parseInt(addressID, 10), cart, paymentIntentResult);
        return res.status(finalisedOrder.alreadyProcessed ? 200 : 201).json({ message: successMessages.CREATE_SUCCESS, orderid: finalisedOrder.orderid });
    }
    catch (error) {
        if (error.message === errorMessages.INSUFFICIENT_QTY) {
            await paymentsModel.refundPayment(paymentintent).catch(() => null);
            return res.status(409).json({ error: errorMessages.INSUFFICIENT_QTY });
        }
        console.error(error);
        await paymentsModel.refundPayment(paymentintent).catch(() => null);
        return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
});
router.post("/checkout/payment/start", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
    const id = req.body.id;
    const role = req.body.role;
    const email = req.body.email;
    if (!hasValidCheckoutContext(id, role, email)) {
        return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
    }
    let cart = req.body.cart;
    if (!hasValidCart(cart)) {
        return res.status(400).json({ error: errorMessages.INVALID_CART });
    }
    cart = cart.filter((item, index) => cart.findIndex((i) => i.productdetailid === item.productdetailid) === index);
    const productDetailIDArr = cart.map((item) => item.productdetailid);
    return productsModel
        .getProductDetailByIds(productDetailIDArr)
        .then(function (product) {
        const productIDArr = product.map((p) => p.productid);
        let subtotal = 0;
        const condition = cart.every((item) => {
            const matchedProduct = product.find((item2) => item2.productdetailid === item.productdetailid);
            if (!matchedProduct) {
                return false;
            }
            subtotal += item.qty * matchedProduct.unitprice;
            return item.qty <= matchedProduct.qty;
        });
        if (!condition) {
            return res.status(400).json({ error: errorMessages.INSUFFICIENT_QTY });
        }
        const formattedSubtotal = formatDecimalNumber(subtotal, 2);
        const gstAmount = formatDecimalNumber(formattedSubtotal * GST_RATE, 2);
        const totalAmount = formatDecimalNumber(formattedSubtotal + SHIPPING_FEE + gstAmount, 2);
        const totalAmountInCents = convertDollarToCent(totalAmount);
        return Promise.all([paymentsModel.getPaymentIntent(totalAmountInCents), usersModel.getAllAddressesByUserId(id), productsModel.getProductImageByProductIDArr(productIDArr)])
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
                return res.status(201).json({
                    clientsecret: payment.client_secret,
                    address: address,
                    product: product,
                    cart: cart,
                    totals: {
                        subtotal: formattedSubtotal,
                        shippingFee: SHIPPING_FEE,
                        gstAmount: gstAmount,
                        total: totalAmount,
                    },
                });
            }
            return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
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
