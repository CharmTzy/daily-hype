// Name: Angie Toh Anqi
// Admin No: 2227915
// Class: DIT/FT/2B/02
// Date: 16.11.2023
// Description: Connect to database to manage review information

const { query } = require('../database');
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require('../errors');

// create review
// make sure order is completed (concurrent: 2 sql statements)
// also ensure order belongs to the user
module.exports.createReview = function createReview(rating, reviewDescription, userID, productID, productDetailID, orderID) {
    const sql = `INSERT INTO review (rating, reviewDescription, userID, productID, updatedAt, productDetailID, orderID) 
    VALUES ($1, $2, $3, $4, NOW(), $5, $6);`;
    return query(sql, [rating, reviewDescription, userID, productID, productDetailID, orderID])
        .catch(function (error) {
            throw error;
        });
}

// retrieve reviews for one product
// module.exports.getReviewByProductId = function getReviewByProductId(productID) {
//     console.log('module.exports.getReviewByProductId', productID);
//     // const sql = `SELECT * FROM review WHERE productID = $1`;
//     const sql = `SELECT AU.name, R.rating, R.reviewDescription, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, R.createdAt, R.updatedAt
//     FROM
//         review R
//         LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
//         LEFT JOIN image I ON RI.imageID = I.imageID
//         LEFT JOIN appuser AU ON R.userid = AU.userid
//     WHERE R.productID = $1
//     GROUP BY R.reviewid, R.rating, R.reviewDescription, AU.name
//     ORDER BY R.reviewid DESC`;

//     return query(sql, [productID])
//         .then(function (result) {
//             const rows = result.rows;
//             // if (rows.length === 0) {
//             //     throw new EMPTY_RESULT_ERROR(`Review not found!`);
//             // }
//             return rows;
//         });
// }

// retrieve reviews for one product
module.exports.getReviewByProductId = function getReviewByProductId(productID) {
    console.log('module.exports.getReviewByProductId', productID);
    // const sql = `SELECT * FROM review WHERE productID = $1`;
    const sql = `SELECT AU.name, R.rating, R.reviewDescription, ARRAY_AGG(DISTINCT I.url) AS urls, R.createdAt, R.updatedAt,
    (ARRAY_AGG(C.colourname ORDER BY RANDOM()))[1] AS colorname,
    (ARRAY_AGG(S.sizename ORDER BY RANDOM()))[1] AS sizename
    FROM
        review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN productdetail PD ON R.productID = PD.productID
        LEFT JOIN colour C ON PD.colourid = C.colourid
        LEFT JOIN size S ON PD.sizeid = S.sizeid
    WHERE R.productID = $1
    GROUP BY R.reviewid, R.rating, R.reviewDescription, AU.name
    ORDER BY R.reviewid DESC;`;

    return query(sql, [productID])
        .then(function (result) {
            console.log('Result:', result);
            const rows = result.rows;
            // if (rows.length === 0) {
            //     throw new EMPTY_RESULT_ERROR(`Review not found!`);
            // }
            return rows;
        });
}

// retrieve reviews for one user

module.exports.getAllReviewsByUserId = function getAllReviewsByUserId(userID) {
    console.log('module.exports.getAllReviewsByUserId', userID);
    // const sql = `SELECT * FROM review WHERE userID = $1`;
    const sql = `SELECT AU.name, R.reviewid, R.rating, R.reviewDescription, R.createdAt, R.updatedAt, P.productName, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls
    FROM
        review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN productorderitem POI ON R.productDetailID = POI.productDetailID
        LEFT JOIN productdetail PD ON R.productDetailID = PD.productDetailID
        LEFT JOIN product P ON PD.productID = P.productID
    WHERE R.userid = $1
    GROUP BY R.reviewid, R.rating, R.reviewDescription, AU.name, P.productName
    ORDER BY R.reviewid DESC;
    `;

    return query(sql, [userID])
        .then(function (result) {
            const rows = result.rows;
            // if (rows.length === 0) {
            //     throw new EMPTY_RESULT_ERROR(`Review not found!`);
            // }
            return rows;
        });
}

// update review
module.exports.updateReview = function updateReview(rating, reviewDescription, reviewID) {
    const sql = `UPDATE review SET rating = $1, reviewDescription = $2, updatedAt = NOW() 
    WHERE reviewID = $3;`;
    // const sql = `UPDATE review SET rating = $1, reviewDescription = $2, updatedAt = NOW() 
    // WHERE reviewID = 4;`;
    return query(sql, [rating, reviewDescription, reviewID])
        .catch(function (error) {
            throw error;
        });
}

// delete review
// change to soft delete in ca2
module.exports.deleteReview = function deleteReview(reviewID) {
    const sql = `DELETE FROM review WHERE reviewID = $1`;
    return query(sql, [reviewID])
        .then((result) => {
            const rows = result.rowCount;
            if (rows.length === 0) {
                throw new EMPTY_RESULT_ERROR(`Review Not Found`);
            }
            return rows;
        })
}

module.exports.getTotalReviewCount = function getTotalReviewCount() {
    const sql = `SELECT COUNT(*) AS total FROM review;`;

    return query(sql)
        .then(result => {
            //console.log(result.rows[0].total);
            return result.rows[0].total;
        })
        .catch(error => {
            throw new Error(`Error retrieving total review count: ${error.message}`);
        });
};

module.exports.getReviewsByLimit = function getReviewsByLimit(offset, limit) {

    const sql = `SELECT R.reviewid, AU.name, P.productname, R.rating, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, R.reviewdescription
    FROM
        review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN product P ON R.productid = P.productid
    GROUP BY R.reviewid, R.rating, R.reviewdescription, AU.name, P.productname
    ORDER BY R.reviewid DESC
    LIMIT $1 OFFSET $2;`;

    return query(sql, [limit, offset])
        .then(result => {
            return result.rows;
        })
        .catch(error => {
            throw new Error(`Error retrieving reviews: ${error.message}`);
        });
};

module.exports.getProductID = function getProductID(orderID) {
    const sql = `SELECT pd.productID
    FROM productorderitem poi
    JOIN productdetail pd ON poi.productDetailID = pd.productDetailID
    WHERE poi.orderID = $1`;

    return query(sql, [orderID])
        .then(result => {
            // console.log(result);
            return result.rows.length > 0 ? result.rows[0].productid : null
        })
        .catch(error => {
            console.error('Error getting product ID:', error.message);
            throw new Error(`Error getting product ID: ${error.message}`);
        });
};

module.exports.getProductDetailID = function getProductDetailID(orderID) {
    const sql = `SELECT poi.productDetailID
    FROM productorderitem poi
    JOIN productdetail pd ON poi.productDetailID = pd.productDetailID
    WHERE poi.orderID = $1`;

    return query(sql, [orderID])
        .then(result => {
            // console.log(result);
            return result.rows.length > 0 ? result.rows[0].productdetailid : null
        })
        .catch(error => {
            console.error('Error getting product detail ID:', error.message);
            throw new Error(`Error getting product detail ID: ${error.message}`);
        });
};

module.exports.checkReviewExists = async function checkReviewExists(orderID) {
    const sql = 'SELECT COUNT(*) AS count FROM review WHERE orderID = $1';
    const result = await query(sql, [orderID]);
    const count = result.rows[0].count;
    console.log("Count is " + count)
    return count > 0;
}

// retrieve review data for existing order
module.exports.getReviewByOrderId = function getReviewByOrderId(orderID) {
    console.log('module.exports.getReviewByOrderId', orderID);
    const sql = `SELECT * FROM review WHERE orderID = $1`;
    // const sql = `SELECT AU.name, R.rating, R.reviewDescription, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, R.createdAt, R.updatedAt
    // FROM
    //     review R
    //     LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
    //     LEFT JOIN image I ON RI.imageID = I.imageID
    //     LEFT JOIN appuser AU ON R.userid = AU.userid
    // WHERE R.productID = $1
    // GROUP BY R.reviewid, R.rating, R.reviewDescription, AU.name
    // ORDER BY R.reviewid DESC`;

    return query(sql, [orderID])
        .then(function (result) {
            // console.log(result)
            const rows = result.rows;
            // if (rows.length === 0) {
            //     throw new EMPTY_RESULT_ERROR(`Review not found!`);
            // }
            return rows;
        });
}

module.exports.getReviewDetails = function getReviewDetails(reviewId, userId) {
    const reviewSql = `
      SELECT *
      FROM review
      WHERE userid = $1 AND reviewid = $2 `;
  
    return query(reviewSql, [userId, reviewId])
      .then((reviewResult) => {
        const review = reviewResult.rows[0];
        return review;
      })
      .catch((error) => {
        console.error("Error fetching review details:", error);
        throw error;
      });
  };