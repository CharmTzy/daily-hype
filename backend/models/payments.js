// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 17.11.2023
// Description: Connect to database to manage payment information and stripe payment

const { query } = require("../database");
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require("../errors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ca2
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
  return stripe.paymentIntents.create({
    payment_method_types: ["card"],
    amount: amount,
    currency: "sgd",
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
  return stripe.paymentIntents.retrieve(paymentIntent);
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
  if (chargeID) {
    const refund = await stripe.refunds.create({
      payment_intent: chargeID,
    });
    if(refund.status === 'succeeded') {
      return true;
    }
    else {
      return false;
    }
  } else {
    return false;
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

// ca2
