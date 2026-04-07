// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 15.11.2023
// Description: Connect to database to manage order information

const { query } = require("../database");
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, INVALID_INPUT_ERROR, UNEXPECTED_ERROR } = require("../errors");

module.exports.getOrderByMonth = function getOrderByMonth(month, gender) {
  const sql = `
        SELECT po.orderid, u.name, u.gender, po.totalqty, po.totalamount
        FROM ProductOrder po, AppUser u
        WHERE po.userid = u.userid
        AND ($2 = '' OR u.gender = $2)
        AND EXTRACT(MONTH FROM po.createdat) = $1
    `;

  return query(sql, [month, gender]).then((result) => {
    return result.rows;
  });
};

module.exports.getOrderByIDAdmin = function getOrderByIDAdmin(orderid) {
  const sql = `
        SELECT o.orderid, o.totalqty, o.totalamount, o.deliveryaddress, o.orderstatus, o.shippingfee, o.gst, u.name, o.createdat, p.paymentMethod, u.userid
        FROM ProductOrder o, Payment p, AppUser u
        WHERE o.orderid = p.orderid
        AND o.userid = u.userid
        AND o.orderid = $1
    `;

  return query(sql, [orderid]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`Order Not Found`);
    }
    return rows[0];
  });
};

// get order detail by admin
module.exports.getOrderDetailByAdmin = function getOrderDetailByAdmin(orderid) {
  const sql = `
        SELECT pd.productdetailid, poi.qty, poi.unitprice, p.productname, s.sizename AS size, c.colourname AS colour, p.productid
        FROM ProductDetail pd, Product p, ProductOrderItem poi, Size s, Colour c
        WHERE poi.productdetailid = pd.productdetailid
        AND poi.orderid = $1
        AND pd.productid = p.productid
        AND pd.sizeid = s.sizeid
        AND pd.colourid = c.colourid
    `;

  return query(sql, [orderid]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`Order Not Found`);
    }
    return rows;
  });
};

// get order status by order id for checking update order status
module.exports.getOrderStatusById = function getOrderStatusById(orderid) {
  const sql = `
        SELECT orderstatus FROM ProductOrder WHERE orderid = $1
    `;

  return query(sql, [orderid]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`Order Not Found`);
    }
    return rows[0].orderstatus;
  });
};

// module.exports.updateOrder = function updateOrder(orderstatus, orderid) {

//     const status = ["in progress", "confirmed", "delivered", "cancelled", "order received"];
//     if (!status.includes(orderstatus)) {
//         throw new INVALID_INPUT_ERROR(`Invalid Order Status`);
//     }

//     const sql = `
//         UPDATE ProductOrder SET orderstatus = $1 WHERE orderid = $2
//     `;

//     return query(sql, [orderstatus, orderid])
//         .then(function (result) {
//             const rows = result.rowCount;
//             if (rows === 0) {
//                 throw new EMPTY_RESULT_ERROR(`Order Not Found`);
//             }
//             else if (rows !== 1) {
//                 throw new UNEXPECTED_ERROR(`Server Error`);
//             }
//             return rows;
//         })
// }

module.exports.updateOrderStatusByUser = function updateOrderStatusByUser(orderid, status, userid) {
  const sql = `
        UPDATE ProductOrder SET orderstatus = $1 WHERE orderid = $2 AND userid = $3
    `;

  return query(sql, [status, orderid, userid]).then((result) => {
    const rows = result.rowCount;
    if (rows === 0) {
      throw new EMPTY_RESULT_ERROR(`Order Not Found`);
    }
    return rows;
  });
};

module.exports.generateStats = function generateStats(startdate, enddate, region, gender, categoryid, productid) {
  const sql = `
        SELECT EXTRACT(MONTH FROM po.createdat) AS month, COUNT(DISTINCT po.*) AS count, u.gender
        FROM ProductOrder po
        JOIN AppUser u ON u.userid = po.userid
        JOIN ProductOrderItem poi ON poi.orderid = po.orderid
        JOIN ProductDetail pd ON pd.productdetailid = poi.productdetailid
        JOIN Product p ON p.productid = pd.productid
        JOIN Category c ON c.categoryid = p.categoryid
        WHERE ($1 = '' OR po.createdat >= $1::timestamp)
        AND ($2 = '' OR po.createdat <= $2::timestamp)
        AND ($3 = '' OR u.region = $3)
        AND ($4 = '' OR u.gender = $4)
        AND ($5 = 0 OR c.categoryid = $5)
        AND ($6 = 0 OR p.productid = $6)
        GROUP BY u.gender, EXTRACT(MONTH FROM po.createdat)
        ORDER BY 1
    `;

  return query(sql, [startdate, enddate, region, gender, categoryid, productid]).then((result) => {
    const rows = result.rows;
    return rows;
  });
};

// ca2

// update order status from admin (confirmed, delivered, cancelled)
module.exports.updateOrderStatusByAdmin = (orderID, status) => {
  const sql = `
        UPDATE productorder SET orderstatus = $1 WHERE orderid = $2
    `;

  return query(sql, [status, orderID])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getOrderItemQtyByOrderId = (orderid) => {
  const sql = `
        SELECT qty, productdetailid
        FROM productorderitem
        WHERE orderid = $1
    `;

  return query(sql, [orderid])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getOrderItemProductIDByOrderId = (orderID) => {
  const sql = `
      SELECT poi.qty, pd.productid FROM productorderitem poi
      JOIN productdetail pd ON poi.productdetailid = pd.productdetailid
      WHERE poi.orderid = $1
  `;

  return query(sql, [orderID])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.checkOrderExists = (orderID, status = "", userID = 0) => {
  let sql = `
    SELECT * FROM productorder WHERE orderid = $1
  `;
  let count = 2;

  if (status !== "") {
    sql += " AND orderstatus = $" + count;
    count++;
  }

  if (userID !== 0) {
    sql += " AND userid = $" + count;
    count++;
  }

  let params = [orderID];

  if (status !== "") {
    params.push(status);
  }

  if (userID !== 0) {
    params.push(userID);
  }

  return query(sql, [...params])
    .then((result) => result.rows[0].orderid)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.deleteOrder = (orderID) => {
  const sql = `DELETE FROM productorder WHERE orderid = $1`;

  return query(sql, [orderID])
    .then((result) => result.rowCount)
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

module.exports.createOrder = function createOrder(orderID, qty, amount, deliveryAddress, userid, shippingFee, gst) {
  const sql = `INSERT INTO productorder (orderid, updatedat, totalqty, totalamount, deliveryaddress, orderstatus, userid, shippingfee, gst) VALUES ($1, NOW(), $2, $3, $4, 'in progress', $5, $6, $7)`;

  return query(sql, [orderID, qty, amount, deliveryAddress, userid, shippingFee, gst])
    .then((result) => result.rowCount)
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

module.exports.createOrderItems = function createOrderItems(orderitems, orderid) {
  const sql = `INSERT INTO productorderitem (productdetailid, orderid, qty, unitprice) VALUES `;
  const queryValues = orderitems.map((item, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(", ");

  // combining all arrarys into a single array
  const params = orderitems.flatMap((item) => [item.productdetailid, orderid, item.qty, item.unitprice]);

  return query(sql + queryValues, params)
    .then((result) => result.rowCount)
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

// user

module.exports.getOrderByIdStatusDate = (userid, offset, limit, status, month, year, search) => {
  let sql = `
      SELECT DISTINCT po.orderid, po.totalqty, po.totalamount, po.deliveryaddress, po.orderstatus, po.createdat
      FROM productorder po
      JOIN productorderitem poi ON po.orderid = poi.orderid
      JOIN productdetail pd ON poi.productdetailid = pd.productdetailid
      JOIN product p ON pd.productid = p.productid
      WHERE po.userid = $1
  `;

  let currentIndex = 2;
  let queryParams = [userid];

  if (status !== "") {
    sql += ` AND po.orderstatus = $${currentIndex++}`;
    queryParams.push(status);
  }

  if (month !== 0) {
    sql += ` AND EXTRACT(MONTH FROM po.createdat) = $${currentIndex++}`;
    queryParams.push(month);
  }

  if (year !== 0) {
    sql += ` AND EXTRACT(YEAR FROM po.createdat) = $${currentIndex++}`;
    queryParams.push(year);
  }

  if (search !== "") {
    sql += ` AND p.productname ILIKE $${currentIndex++}`;
    queryParams.push("%" + search + "%");
  }

  sql += ` ORDER BY po.createdat DESC LIMIT $${currentIndex++} OFFSET $${currentIndex++}`;

  queryParams.push(limit, offset);

  return query(sql, [...queryParams])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getOrderItemByOrderId = (orderIDArr) => {
  if (!orderIDArr || orderIDArr.length === 0) return Promise.resolve([]);

  const sql = `
        SELECT poi.productdetailid, poi.qty, poi.unitprice, p.productname, p.rating, c.colourname, s.sizename, poi.orderid, p.productid
        FROM productorderitem poi
        JOIN productdetail pd ON poi.productdetailid = pd.productdetailid
        JOIN product p ON pd.productid = p.productid
        JOIN colour c ON pd.colourid = c.colourid
        JOIN size s ON pd.sizeid = s.sizeid
        WHERE poi.orderid IN (
    `;

  const queryValues = orderIDArr.map((o, index) => `$${index + 1}`).join(", ") + ")";

  return query(sql + queryValues, [...orderIDArr])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getOrderItemByOrderIdForRefund = (orderID, userID) => {
  const sql = `
        SELECT poi.productdetailid, poi.qty, poi.unitprice, p.productname, p.rating, c.colourname, s.sizename, poi.orderid, p.productid
        FROM productorderitem poi
        JOIN productorder po ON poi.orderid = po.orderid
        JOIN productdetail pd ON poi.productdetailid = pd.productdetailid
        JOIN product p ON pd.productid = p.productid
        JOIN colour c ON pd.colourid = c.colourid
        JOIN size s ON pd.sizeid = s.sizeid
        WHERE po.userid = $1
        AND poi.orderid = $2
    `;

  return query(sql, [userID, orderID])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getTotalOrderCount = (userid, status, month, year, search) => {
  let sql = `
      SELECT COUNT(DISTINCT po.*) AS count
      FROM productorder po
      JOIN productorderitem poi ON po.orderid = poi.orderid
      JOIN productdetail pd ON poi.productdetailid = pd.productdetailid
      JOIN product p ON pd.productid = p.productid
      WHERE po.userid = $1
  `;

  let currentIndex = 2;
  let queryParams = [userid];

  if (status !== "") {
    sql += ` AND po.orderstatus = $${currentIndex++}`;
    queryParams.push(status);
  }

  if (month !== 0) {
    sql += ` AND EXTRACT(MONTH FROM po.createdat) = $${currentIndex++}`;
    queryParams.push(month);
  }

  if (year !== 0) {
    sql += ` AND EXTRACT(YEAR FROM po.createdat) = $${currentIndex++}`;
    queryParams.push(year);
  }

  if (search !== "") {
    sql += ` AND p.productname ILIKE $${currentIndex++}`;
    queryParams.push("%" + search + "%");
  }

  return query(sql, [...queryParams])
    .then((result) => result.rows[0].count)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// user

/**
 * get order list count by admin
 * @returns order count - (number)
 */
module.exports.getOrderCountByAdmin = () => {
  const sql = `
        SELECT COUNT(*) AS count FROM ProductOrder 
    `;

  return query(sql, [])
    .then((result) => result.rows[0].count)
    .catch((error) => {
      throw error;
    });
};

/**
 * get order by offset and limit by admin
 * @param {*} offset number of rows you want to skip - (number)
 * @param {*} limit number of rows you want to show - (number)
 * @returns Promise(array of objects) - ([{orderid, totalqty, totalamount, deliveryaddress, orderstatus, name, createdat, paymentmethod, userid}])
 */
module.exports.getOrderByAdmin = (offset, limit) => {
  const sql = `
        SELECT o.orderid, o.totalqty, o.totalamount, o.deliveryaddress, o.orderstatus, u.name, o.createdat, p.paymentmethod, u.userid
        FROM productorder o, payment p, appuser u
        WHERE o.orderid = p.orderid
        AND o.userid = u.userid
        ORDER BY o.orderid DESC
        LIMIT $1 OFFSET $2
    `;

  return query(sql, [limit, offset])
    .then((result) => result.rows)
    .catch((error) => {
      throw error;
    });
};

/**
 * retrieves order revenue statistics grouped by quarter, year, and gender.
 * @param {number} year - the specific year for which you want to generate the report
 * @param {number} gender - the gender filter for the report
 * @returns {Object[]} - returns order revenue reports for each quarter, year and gender
 */
module.exports.getOrderRevenueStatByQuarter = (year) => {
  const sql = `
    SELECT
      EXTRACT(QUARTER FROM o.createdat) AS quarter,
      EXTRACT(YEAR FROM o.createdat) AS year,
      SUM(o.totalamount) AS revenue,
      u.gender
    FROM productorder o, appuser u
    WHERE o.userid = u.userid
    AND EXTRACT(YEAR FROM o.createdat) = $1
    GROUP BY quarter, year, u.gender ORDER BY year, quarter
  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getUserOrderRevenueQuarterDetail = (quarter, gender, year) => {
  const sql = `
    SELECT u.name, u.gender, u.userid, COUNT(DISTINCT o.orderid) AS totalorder, SUM(o.totalqty) AS totalqty, SUM(o.totalamount) AS totalamount
    FROM productorder o
    JOIN appuser u ON o.userid = u.userid
    WHERE EXTRACT(QUARTER FROM o.createdat) = $1
    AND u.gender = $2
    AND EXTRACT(YEAR FROM o.createdat) = $3
    GROUP BY u.userid, u.name, u.gender
    ORDER BY totalamount DESC
  `;

  return query(sql, [quarter, gender, year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getProductOrderRevenueQuarterDetail = (quarter, gender, year) => {
  const sql = `
        SELECT p.productid, p.productname, c.categoryname, co.colourname, s.sizename, SUM(poi.qty) AS totalqty, SUM(poi.unitprice * poi.qty) AS totalamount, COUNT(DISTINCT po.orderid) AS totalorder
        FROM product p
        JOIN productdetail pd ON p.productid = pd.productid
        JOIN category c ON p.categoryid = c.categoryid
        JOIN colour co ON pd.colourid = co.colourid
        JOIN size s ON pd.sizeid = s.sizeid
        JOIN productorderitem poi ON pd.productdetailid = poi.productdetailid
        JOIN productorder po ON poi.orderid = po.orderid
        JOIN appuser u ON po.userid = u.userid
        WHERE EXTRACT(QUARTER FROM po.createdat) = $1
        AND u.gender = $2
        AND EXTRACT(YEAR FROM po.createdat) = $3    
        GROUP BY p.productid, p.productname, c.categoryname, co.colourname, s.sizename
        ORDER BY totalamount DESC    
    `;

  return query(sql, [quarter, gender, year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getOrderRevenueStatByMonth = (year) => {
  const sql = `
    SELECT
      EXTRACT(MONTH FROM o.createdat) AS month,
      EXTRACT(YEAR FROM o.createdat) AS year,
      SUM(o.totalamount) AS revenue,
      u.gender
    FROM productorder o, appuser u
    WHERE o.userid = u.userid
    AND EXTRACT(YEAR FROM o.createdat) = $1
    GROUP BY month, year, u.gender ORDER BY year, month
  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getUserOrderRevenueMonthDetail = (month, gender, year) => {
  const sql = `
    SELECT u.name, u.gender, u.userid, COUNT(DISTINCT o.orderid) AS totalorder, SUM(o.totalqty) AS totalqty, SUM(o.totalamount) AS totalamount
    FROM productorder o
    JOIN appuser u ON o.userid = u.userid
    WHERE EXTRACT(MONTH FROM o.createdat) = $1
    AND u.gender = $2
    AND EXTRACT(YEAR FROM o.createdat) = $3
    GROUP BY u.userid, u.name, u.gender
    ORDER BY totalamount DESC
  `;

  return query(sql, [month, gender, year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getProductOrderRevenueMonthDetail = (month, gender, year) => {
  const sql = `
        SELECT p.productid, p.productname, c.categoryname, co.colourname, s.sizename, SUM(poi.qty) AS totalqty, SUM(poi.unitprice * poi.qty) AS totalamount, COUNT(DISTINCT po.orderid) AS totalorder
        FROM product p
        JOIN productdetail pd ON p.productid = pd.productid
        JOIN category c ON p.categoryid = c.categoryid
        JOIN colour co ON pd.colourid = co.colourid
        JOIN size s ON pd.sizeid = s.sizeid
        JOIN productorderitem poi ON pd.productdetailid = poi.productdetailid
        JOIN productorder po ON poi.orderid = po.orderid
        JOIN appuser u ON po.userid = u.userid
        WHERE EXTRACT(MONTH FROM po.createdat) = $1
        AND u.gender = $2
        AND EXTRACT(YEAR FROM po.createdat) = $3    
        GROUP BY p.productid, p.productname, c.categoryname, co.colourname, s.sizename
        ORDER BY totalamount DESC    
    `;

  return query(sql, [month, gender, year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.checkOrderItemExists = (orderID, productDetailID) => {
  const sql = `
      SELECT * FROM productorderitem WHERE orderid = $1 AND productdetailid = $2
  `;

  return query(sql, [orderID, productDetailID])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.checkOrderStatus = (orderID, status) => {
  const sql = `
      SELECT * FROM productorder WHERE orderid = $1 AND orderstatus = $2
  `;

  return query(sql, [orderID, status])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// ca2
