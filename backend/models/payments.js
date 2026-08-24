const { query } = require("../database");
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require("../errors");
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Stripe is not configured");
    }
    return require("stripe")(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-02-25.clover",
    });
};
module.exports.insertPayment = function insertPayment(orderid, paymentid, paymentmethod, paymentamount, paymentstatus, transactionid) {
    const sql = `
        INSERT INTO Payment (paymentid, orderid, paymentmethod, amount, paymentstatus, transactionid)
        VALUES ($1, $2, $3, $4, $5, $6);
    `;
    return query(sql, [paymentid, orderid, paymentmethod, paymentamount, paymentstatus, transactionid])
        .then((result) => result.rowCount)
        .catch(function (error) {
        console.error(error);
        throw error;
    });
};
module.exports.getPaymentIntent = (amount) => {
    return getStripe().paymentIntents.create({
        amount: amount,
        currency: "sgd",
        automatic_payment_methods: {
            enabled: true,
        },
    });
};
module.exports.checkPaymentSuccess = (orderID) => {
    const sql = `
      SELECT * FROM payment WHERE orderid = $1 AND paymentstatus = 'succeeded';
  `;
    return query(sql, [orderID])
        .then((result) => result.rows[0])
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.retrievePaymentIntent = (paymentIntent) => {
    return getStripe().paymentIntents.retrieve(paymentIntent);
};
module.exports.getPaymentByTransactionID = (transactionID) => {
    const sql = `
        SELECT orderid, paymentstatus, transactionid
        FROM payment
        WHERE transactionid = $1
        ORDER BY createdat DESC
        LIMIT 1
    `;
    return query(sql, [transactionID])
        .then((result) => result.rows[0] || null)
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.getPaymentTransactionID = (userID, orderID) => {
    const sql = `
        SELECT p.*, po.* FROM payment p, productorder po
        WHERE p.orderid = po.orderid
        AND p.orderid = $1
        AND po.userid = $2
        AND p.paymentstatus = 'succeeded'
        AND po.orderstatus = 'received'
    `;
    return query(sql, [orderID, userID])
        .then((result) => result.rows[0])
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.refundPayment = async (chargeID) => {
    if (!chargeID) {
        return false;
    }
    try {
        const refund = await getStripe().refunds.create({
            payment_intent: chargeID,
        });
        return refund.status === 'succeeded' || refund.status === 'pending';
    } catch (error) {
        if (error?.code === 'charge_already_refunded') {
            return true;
        }
        throw error;
    }
};
module.exports.getPaymentByOrderID = (orderIDArr) => {
    if (!orderIDArr || orderIDArr.length === 0) {
        return Promise.resolve([]);
    }
    const sql = `
      SELECT * FROM 
      productorder po
      JOIN payment p ON po.orderid = p.orderid
      WHERE p.orderid IN (
  `;
    const queryValues = orderIDArr.map((o, index) => `$${index + 1}`).join(", ");
    return query(sql + queryValues + ")", [...orderIDArr])
        .then((result) => result.rows)
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
