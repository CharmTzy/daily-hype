// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const { query } = require("../database");

// ca2

module.exports.checkRefundExists = (orderID, productDetailID) => {
  const sql = `
        SELECT * FROM orderrefund WHERE orderid = $1 AND productdetailid = $2
    `;

  return query(sql, [orderID, productDetailID])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.createRefund = (refundID, refundAmount, orderID, productDetailID, category, reason, qty) => {
  const sql = `
      INSERT INTO orderrefund (refundid, refundamount, refundreason, refundcategory, refundstatus, createdat, updatedat, orderid, productdetailid, refundqty)
      VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW(), $5, $6, $7)
  `;

  return query(sql, [refundID, refundAmount, reason, category, orderID, productDetailID, qty])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.deleteRefund = (refundID) => {
  const sql = `
      DELETE FROM orderrefund WHERE refundid = $1
  `;

  return query(sql, [refundID])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.createRefundImage = (refundID, imageIDArr) => {
  const sql = `
      INSERT INTO refundimage (refundid, imageid) VALUES
  `;

  const queryValues = imageIDArr.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(", ");

  const queryParams = imageIDArr.map((imageID) => [refundID, imageID]).flat();

  return query(sql + queryValues, [...queryParams])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.deleteRefundImages = (refundID) => {
  const sql = `
      DELETE FROM refundimage WHERE refundid = $1
  `;

  return query(sql, [refundID])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// admin

module.exports.getRefundCountByAdmin = () => {
  const sql = `
      SELECT COUNT(*) AS count FROM orderrefund
  `;

  return query(sql)
    .then((result) => result.rows[0].count)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getRefundByAdmin = (offset, limit) => {
  const sql = `
      SELECT r.*, u.name
      FROM orderrefund r
      JOIN productorder o ON r.orderid = o.orderid
      JOIN appuser u ON o.userid = u.userid
      LIMIT $1 OFFSET $2
  `;

  return query(sql, [limit, offset])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// admin

// ca2
