// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const { query } = require("../database");

module.exports.getCartByProductDetailID = (userID, productDetailID) => {
  const sql = `
    SELECT COUNT(*) AS count FROM cart WHERE userid = $1 AND productdetailid = $2
  `;

  return query(sql, [userID, productDetailID])
    .then((result) => result.rows[0].count)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

/**
 * get cart data by user id
 * @param {*} userID userid (int)
 * @returns Promise(array of objects) - ([{cartid, productdetailid, qty, userid, createdat}])
 * @example
 * getCart(userid).then((data) => {
 *      data.forEach((item) => {
 *        console.log(item.qty)   // this is the quantity from cart
 *      })
 * })
 */
module.exports.getCart = (userID) => {
  const sql = `
    SELECT * FROM cart WHERE userid = $1
  `;

  return query(sql, [userID]).then((result) => result.rows);
};

module.exports.updateCartByProductDetailID = (userID, productDetailID, cart) => {
  const sql = `
    UPDATE cart SET qty = $1, productdetailid = $2 WHERE userid = $3 AND productdetailid = $4
  `;

  return query(sql, [cart.qty, productDetailID, userID, cart.productdetailid]).then((result) => result.rowCount);
};

module.exports.deleteCartByProductDetailID = (userID, productDetailID) => {
  const sql = `
    DELETE FROM cart WHERE userid = $1 AND productdetailid = $2
  `;

  return query(sql, [userID, productDetailID]).then((result) => result.rowCount);
};

module.exports.deleteCartByProductDetailIDArr = (userID, productDetailIDArr) => {
  const sql = `
    DELETE FROM cart WHERE userid = $1 AND productdetailid IN (
  `;

  const queryValues = productDetailIDArr.map((p, index) => `$${index + 2}`).join(", ");

  return query(sql + queryValues + ")", [userID, ...productDetailIDArr])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.insertCart = (userID, cart) => {
  const sql = `
    INSERT INTO cart VALUES 
  `;

  const values = cart.map((c, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}, NOW())`);
  const queryValues = values.join(", ");
  const queryParams = [];
  cart.forEach((item) => {
    queryParams.push(item.cartid, item.productdetailid, item.qty, userID);
  });

  return query(sql + queryValues, [...queryParams]).then((result) => result.rowCount);
};

module.exports.updateCartQty = (userID, cartIDArr) => {
  const sql = `
    UPDATE cart SET qty = 1 WHERE userid = $1 AND cartid IN (
  `;

  const values = cartIDArr.map((c, index) => `$${index + 2}`);
  const queryValues = values.join(", ") + ")";

  return query(sql + queryValues, [userID, ...cartIDArr])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// admin

module.exports.getCartByAdmin = (offset, limit) => {
  const sql = `
      SELECT c.*, u.name FROM cart c
      JOIN appuser u ON c.userid = u.userid
      LIMIT $1 OFFSET $2
  `;

  return query(sql, [limit, offset])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getCartWithProductImage = (offset, limit) => {
  const sql = `
      SELECT c.*, i.url, u.name, p.productname, co.colourname, s.sizename
      FROM cart c
      JOIN productdetail pd ON c.productdetailid = pd.productdetailid
      JOIN product p ON pd.productid = p.productid
      JOIN colour co ON pd.colourid = co.colourid
      JOIN size s ON pd.sizeid = s.sizeid
      JOIN productimage pi ON p.productid = pi.productid
      LEFT JOIN image i ON pi.imageid = i.imageid
      JOIN appuser u ON c.userid = u.userid
      LIMIT $1 OFFSET $2
  `;

  return query(sql, [limit, offset])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getCartCount = () => {
  const sql = `
      SELECT COUNT(*) AS count FROM cart
  `;

  return query(sql, [])
    .then((result) => result.rows[0].count)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.deleteCartByCartID = (cartID) => {
  const sql = `
      DELETE FROM cart WHERE cartid = $1
  `;

  return query(sql, [cartID])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// admin
