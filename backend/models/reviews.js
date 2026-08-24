const { query } = require("../database");
const { EMPTY_RESULT_ERROR } = require("../errors");

module.exports.createReview = function createReview(
    rating,
    reviewDescription,
    userID,
    productID,
    productDetailID,
    orderID,
) {
    const sql = `
        INSERT INTO review (
            rating,
            reviewDescription,
            userID,
            productID,
            updatedAt,
            productDetailID,
            orderID
        )
        VALUES ($1, $2, $3, $4, NOW(), $5, $6)
        RETURNING *;
    `;

    return query(sql, [rating, reviewDescription, userID, productID, productDetailID, orderID]).then((result) => {
        return result.rows[0];
    });
};

module.exports.getReviewStatsByProductId = function getReviewStatsByProductId(productID) {
    const sql = `
        SELECT
            COUNT(*) AS total,
            COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average,
            COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star,
            COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
            COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
            COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
            COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star
        FROM review
        WHERE productID = $1
    `;
    return query(sql, [productID]).then((result) => {
        const row = result.rows[0];
        const names = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };
        return {
            total: Number(row.total),
            average: Number(row.average),
            countsByRating: [5, 4, 3, 2, 1].map((star) => ({
                star,
                count: Number(row[`${names[star]}_star`]),
            })),
        };
    });
};
module.exports.getReviewByProductIdFiltered = function getReviewByProductIdFiltered(productID, rating, limit, offset) {
    const params = [productID];
    let ratingClause = '';
    if (rating !== null && rating !== undefined) {
        params.push(Number(rating));
        ratingClause = `AND R.rating = $${params.length}`;
    }
    params.push(Math.min(Number(limit) || 10, 50));
    const limitIdx = params.length;
    params.push(Number(offset) || 0);
    const offsetIdx = params.length;
    const sql = `
        SELECT
            R.reviewid,
            AU.name,
            COALESCE(UI.url, '/icons/avatar-placeholder.svg') AS profileurl,
            R.rating,
            R.reviewDescription,
            ARRAY_REMOVE(ARRAY_AGG(I.url ORDER BY I.imageID), NULL) AS urls,
            R.createdAt,
            R.updatedAt,
            C.colourname AS colorname,
            S.sizename AS sizename
        FROM review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN image UI ON AU.imageid = UI.imageid
        LEFT JOIN productdetail PD ON R.productDetailID = PD.productDetailID
        LEFT JOIN colour C ON PD.colourid = C.colourid
        LEFT JOIN size S ON PD.sizeid = S.sizeid
        WHERE R.productID = $1 ${ratingClause}
        GROUP BY
            R.reviewid, R.rating, R.reviewDescription, AU.name, UI.url,
            R.createdAt, R.updatedAt, C.colourname, S.sizename
        ORDER BY R.createdAt DESC, R.reviewid DESC
        LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    return query(sql, params).then((result) => result.rows);
};
module.exports.getReviewByProductId = function getReviewByProductId(productID) {
    const sql = `
        SELECT
            R.reviewid,
            AU.name,
            COALESCE(UI.url, '/icons/avatar-placeholder.svg') AS profileurl,
            R.rating,
            R.reviewDescription,
            ARRAY_REMOVE(ARRAY_AGG(I.url ORDER BY I.imageID), NULL) AS urls,
            R.createdAt,
            R.updatedAt,
            C.colourname AS colorname,
            S.sizename AS sizename
        FROM review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN image UI ON AU.imageid = UI.imageid
        LEFT JOIN productdetail PD ON R.productDetailID = PD.productDetailID
        LEFT JOIN colour C ON PD.colourid = C.colourid
        LEFT JOIN size S ON PD.sizeid = S.sizeid
        WHERE R.productID = $1
        GROUP BY
            R.reviewid,
            R.rating,
            R.reviewDescription,
            AU.name,
            UI.url,
            R.createdAt,
            R.updatedAt,
            C.colourname,
            S.sizename
        ORDER BY R.createdAt DESC, R.reviewid DESC;
    `;

    return query(sql, [productID]).then((result) => {
        return result.rows;
    });
};

module.exports.getAllReviewsByUserId = function getAllReviewsByUserId(userID) {
    const sql = `
        SELECT
            AU.name,
            R.reviewid,
            R.rating,
            R.reviewDescription,
            R.createdAt,
            R.updatedAt,
            P.productName,
            P.productID,
            R.productDetailID,
            R.orderID,
            C.colourname,
            S.sizename,
            ARRAY_REMOVE(ARRAY_AGG(I.url ORDER BY I.imageID), NULL) AS urls
        FROM review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN productdetail PD ON R.productDetailID = PD.productDetailID
        LEFT JOIN product P ON R.productID = P.productID
        LEFT JOIN colour C ON PD.colourid = C.colourid
        LEFT JOIN size S ON PD.sizeid = S.sizeid
        WHERE R.userid = $1
        GROUP BY
            AU.name,
            R.reviewid,
            R.rating,
            R.reviewDescription,
            R.createdAt,
            R.updatedAt,
            P.productName,
            P.productID,
            R.productDetailID,
            R.orderID,
            C.colourname,
            S.sizename
        ORDER BY R.updatedAt DESC, R.reviewid DESC;
    `;

    return query(sql, [userID]).then((result) => {
        return result.rows;
    });
};

module.exports.updateReview = function updateReview(rating, reviewDescription, reviewID) {
    const sql = `
        UPDATE review
        SET rating = $1, reviewDescription = $2, updatedAt = NOW()
        WHERE reviewID = $3
        RETURNING *;
    `;

    return query(sql, [rating, reviewDescription, reviewID]).then((result) => {
        if (result.rowCount === 0) {
            throw new EMPTY_RESULT_ERROR("Review Not Found");
        }

        return result.rows[0];
    });
};

module.exports.deleteReview = function deleteReview(reviewID) {
    const sql = `
        DELETE FROM review
        WHERE reviewID = $1
        RETURNING *;
    `;

    return query(sql, [reviewID]).then((result) => {
        if (result.rowCount === 0) {
            throw new EMPTY_RESULT_ERROR("Review Not Found");
        }

        return result.rows[0];
    });
};

module.exports.getTotalReviewCount = function getTotalReviewCount() {
    const sql = `SELECT COUNT(*) AS total FROM review;`;

    return query(sql).then((result) => {
        return result.rows[0].total;
    });
};

module.exports.getReviewsByLimit = function getReviewsByLimit(offset, limit) {
    const sql = `
        SELECT
            R.reviewid,
            AU.name,
            COALESCE(UI.url, '/icons/avatar-placeholder.svg') AS profileurl,
            P.productname,
            R.rating,
            ARRAY_REMOVE(ARRAY_AGG(I.url ORDER BY I.imageID), NULL) AS urls,
            R.reviewdescription
        FROM review R
        LEFT JOIN reviewimage RI ON R.reviewID = RI.reviewID
        LEFT JOIN image I ON RI.imageID = I.imageID
        LEFT JOIN appuser AU ON R.userid = AU.userid
        LEFT JOIN image UI ON AU.imageid = UI.imageid
        LEFT JOIN product P ON R.productid = P.productid
        GROUP BY R.reviewid, R.rating, R.reviewdescription, AU.name, UI.url, P.productname
        ORDER BY R.reviewid DESC
        LIMIT $1 OFFSET $2;
    `;

    return query(sql, [limit, offset]).then((result) => {
        return result.rows;
    });
};

module.exports.checkReviewExists = async function checkReviewExists(orderID, productDetailID = 0, userID = 0) {
    let sql = `SELECT COUNT(*) AS count FROM review WHERE orderID = $1`;
    const params = [orderID];

    if (productDetailID) {
        params.push(productDetailID);
        sql += ` AND productDetailID = $${params.length}`;
    }

    if (userID) {
        params.push(userID);
        sql += ` AND userID = $${params.length}`;
    }

    const result = await query(sql, params);
    return Number(result.rows[0].count) > 0;
};

module.exports.getReviewByOrderItem = function getReviewByOrderItem(orderID, productDetailID, userID) {
    const sql = `
        SELECT *
        FROM review
        WHERE orderID = $1
        AND productDetailID = $2
        AND userID = $3
        LIMIT 1;
    `;

    return query(sql, [orderID, productDetailID, userID]).then((result) => {
        return result.rows[0] || null;
    });
};

module.exports.getReviewByOrderId = function getReviewByOrderId(orderID) {
    const sql = `SELECT * FROM review WHERE orderID = $1 ORDER BY createdAt DESC;`;

    return query(sql, [orderID]).then((result) => {
        return result.rows;
    });
};

module.exports.getReviewDetails = function getReviewDetails(reviewId, userId) {
    const sql = `
        SELECT *
        FROM review
        WHERE userid = $1
        AND reviewid = $2;
    `;

    return query(sql, [userId, reviewId]).then((result) => {
        return result.rows[0] || null;
    });
};

module.exports.getReviewById = function getReviewById(reviewId) {
    const sql = `
        SELECT *
        FROM review
        WHERE reviewid = $1;
    `;

    return query(sql, [reviewId]).then((result) => {
        return result.rows[0] || null;
    });
};
