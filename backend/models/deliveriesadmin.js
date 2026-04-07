
// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4


const { query } = require('../database');
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require('../errors');
const { use } = require('../routes/delivery');
//const db = require('pg-promise')(); // Adjust the library import based on your setup

// Continued from CA1, the filter function was introduced to filter items and display in admin table
// a) Get deliverids based on filters and pagination offset limit

module.exports.retrieveFilteredDeliveriesWithMessageReadAdmin = function retrieveFilteredDeliveriesWithMessageReadAdmin(
    userId,
    startDate,
    endDate,
    startDateOrder,
    endDateOrder,
    statusDetail,
    limit,
    offset,
    chatunread,
    userName,
    productName,
    region,
    categoryName,
    address,
    shipper
) {

    console.log('userId:', userId);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    console.log('startDateOrder:', startDateOrder);
    console.log('endDateOrder:', endDateOrder);
    console.log('statusDetail:', statusDetail);
    console.log('limit:', limit);
    console.log('offset:', offset);
    console.log('chatunread:', chatunread);
    console.log('userName:', userName);
    console.log('productName:', productName);
    console.log('region:', region);
    console.log('categoryName:', categoryName);
    console.log('address:', address);
    console.log('shipper:', shipper);

    var filterunread = ``;

    if (chatunread == "UnreadChats") {
        filterunread = `AND (CASE WHEN NOT message.messagereadadmin THEN 1 END) > 0`;
    }

    if (offset == null || limit == null) {
        offset = 0
        limit = 3
    }

    if (categoryName == "Default") {
        categoryName = null
    }

    if (address == "Default") {
        address = null
    }


    if (region == "Default") {
        region = null
    }

    if (userName == "Default") {
        userName = null
    }

    if (productName == "Default") {
        productName = null
    }

    if (shipper == "Default") {
        shipper = null
    }

    // Define the base SQL query
    let sql = `
    SELECT 
        delivery.deliveryid,
        delivery.deliverydate as deliveryTime,
        productorder.createdat as createTime,
        address.region
    FROM
        appuser
        JOIN productorder ON appuser.userid = productorder.userid
		JOIN productorderitem ON productorder.orderid = productorderitem.orderid
        JOIN delivery ON delivery.deliveryid = productorderitem.deliveryid
        JOIN chat ON delivery.deliveryid = chat.deliveryid
        JOIN message ON message.roomid = chat.roomid
        JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid
        JOIN product ON productdetail.productid = product.productid
        JOIN productimage ON productimage.productid = product.productid
        JOIN image ON productimage.imageid = image.imageid
        JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid
        JOIN address ON address.userid = appuser.userid
        JOIN category ON category.categoryid = product.categoryid
    WHERE
        delivery.deliverydate >= COALESCE($1, delivery.deliverydate)
        AND delivery.deliverydate <= COALESCE($2, delivery.deliverydate)
        AND delivery.deliverystatusdetail = COALESCE($3, delivery.deliverystatusdetail)
        AND productorder.createdat >= COALESCE($4, productorder.createdat)
        AND productorder.createdat <= COALESCE($5, productorder.createdat)
        AND appuser.name = COALESCE($6, appuser.name)
        AND address.region = COALESCE($7, address.region)
        AND product.productname = COALESCE($8, product.productname)
        AND productorder.deliveryaddress = COALESCE($9, productorder.deliveryaddress)
        AND deliveryshipper.name = COALESCE($10, deliveryshipper.name)
        AND category.categoryname = COALESCE($11, category.categoryname)`
        + filterunread + `
    GROUP BY
        delivery.deliveryid,
        delivery.deliverydate,
        productorder.createdat,
        address.region
    LIMIT $12 OFFSET $13;
    `;

    return query(sql, [startDate, endDate, statusDetail, startDateOrder, endDateOrder, userName, region, productName, address, shipper, categoryName, limit, offset])
        .then(function (result) {
            const rows = result.rows;

            // If no deliveries found, return an empty array
            if (rows.length === 0) {
                return [];
            }

            console.log("rows length prev is " + rows.length)

            // Extract and return the distinct delivery ids
            const distinctDeliveryIds = rows.map(row => row.deliveryid);

            console.log("rows length is " + distinctDeliveryIds.length)


            // Extract and return the filtered deliveries
            return distinctDeliveryIds;
        });
};


// b) Actual retrieving of delivery information for admin delivery table (adjust message.messagereadadmin)
module.exports.retrieveDeliveryDetailsAdmin = function retrieveDeliveryDetails(
    deliveryIds,
    arrangeByOrder,
    arrangeByDelivery
) {
    //deliveryIds = [35,36]

    console.log("Retrieving all deliveriles");

    console.log('arrangeByOrder:', arrangeByOrder);
    console.log('arrangeByDelivery:', arrangeByDelivery);

    if (arrangeByOrder == 'Default') {
        arrangeByOrder = null
    }

    if (arrangeByDelivery == 'Default') {
        arrangeByDelivery = null
    }

    // Define the base SQL query
    let sql = `
    SELECT 
        delivery.deliveryid,
        deliveryshipper.name AS carrier, 
        deliveryshipper.phone AS phone,
        delivery.deliverystatusdetail AS deliveryStatusDetail,
        productorder.orderid AS orderId,
        delivery.deliverydate AS deliveryTime,
        productorder.deliveryaddress AS deliveryAddress,
        productorderitem.qty AS productquantity,
        size.sizename AS size,
        colour.colourname AS colour,
        delivery.deliverydate AS estimatedDeliveryDate,
        delivery.deliverystatus AS status,
        delivery.trackingnumber AS trackingNumber,
        product.productname AS name,
        product.description AS description,
        image.url AS image,
        product.unitprice AS price,
        appuser.userid AS userId, 
        appuser.name AS userName,
        productorder.orderid AS orderID,
        productorder.createdat AS createTime,
        COUNT(CASE WHEN message.messagereadadmin = 'false' THEN 1 ELSE NULL END) AS readMessageCount
    FROM
        appuser
        JOIN productorder ON appuser.userid = productorder.userid   
        JOIN productorderitem ON productorder.orderid = productorderitem.orderid
        JOIN delivery ON delivery.deliveryid = productorderitem.deliveryid
        JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid
        JOIN product ON productdetail.productid = product.productid
        JOIN size ON productdetail.sizeid = size.sizeid
        JOIN colour ON productdetail.colourid = colour.colourid
        JOIN productimage ON productimage.productid = product.productid
        JOIN image ON productimage.imageid = image.imageid
        JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid
        LEFT JOIN chat ON delivery.deliveryid = chat.deliveryid
        LEFT JOIN message ON chat.roomid = message.roomid
    WHERE
        delivery.deliveryid = ANY($1::int[])
    GROUP BY
        delivery.deliveryid,
        deliveryshipper.name,
        deliveryshipper.phone,
        delivery.deliverystatusdetail,
        productorder.orderid,
        delivery.deliverydate,
        productorder.deliveryaddress,
        productorderitem.qty,
        size.sizename,
        colour.colourname,
        delivery.deliverystatus,
        delivery.trackingnumber,
        product.productname,
        product.description,
        image.url,
        product.unitprice,
        appuser.userid, 
        appuser.name,
        productorder.createdat
    `;

    // Arrange by Order (if provided)
    if (arrangeByOrder === 'asc' || arrangeByOrder === 'desc') {
        sql += ` ORDER BY delivery.deliveryid ${arrangeByOrder.toUpperCase()}`;
    }

    // Arrange by Delivery (if provided)
    if (arrangeByDelivery === 'asc' || arrangeByDelivery === 'desc') {
        sql += `${arrangeByOrder ? ',' : ' ORDER BY'} delivery.deliverydate ${arrangeByDelivery.toUpperCase()}`;
    }

    return query(sql, [deliveryIds])
        .then(function (result) {
            const rows = result.rows;

            // If no deliveries found, return an empty array
            if (rows.length === 0) {
                return [];
            }

            //console.log(result)

            // Process the rows to maintain the desired output format
            const deliveriesDict = {};
            const deliveriesArray = [];

            rows.forEach((row) => {
                const deliveryId = row.deliveryid;

                if (!deliveriesDict[deliveryId]) {
                    deliveriesDict[deliveryId] = {

                        deliveryId: row.deliveryid,
                        deliveryStatusDetail: row.deliverystatusdetail,
                        orderId: row.orderid,
                        orderDate: row.createtime,
                        deliveryTime: row.deliverytime,
                        estimatedDeliveryDate: row.estimateddeliverydate,
                        deliveryAddress: row.deliveryaddress,
                        appuser: row.username,
                        shipping: {
                            carrier: row.carrier,
                            phone: row.phone
                        },
                        status: row.status,
                        trackingNumber: row.trackingnumber,
                        items: [],
                        unreadMessageCount: row.readmessagecount // Added unreadMessageCount
                    };
                    deliveriesArray.push(deliveriesDict[deliveryId]);
                }

                deliveriesDict[deliveryId].items.push({
                    name: row.name,
                    description: row.description,
                    image: row.image,
                    price: row.price,
                    quantity: row.productquantity,
                    colour: row.colour,
                    size: row.size

                });
            });

            console.log(deliveriesArray);

            return deliveriesArray;
        });
};


// Updating of Single Delivery Records

module.exports.updateDeliveryStatusAndTimestamps = function updateDeliveryStatusAndTimestamps(deliveryid, deliverystatusdetail, deliverydate) {
    let sqlAppend = "";
    let nullTimestamps = "";
    if (deliverystatusdetail === "Order confirmed") {
        sqlAppend = ", updatedatconfirmed = NOW()";
        nullTimestamps = ', updatedatcheck = NULL, updatedatway = NULL, updatedatpick = NULL';
    } else if (deliverystatusdetail === "Ready for pickup by company") {
        sqlAppend = ", updatedatcheck = NOW()";
        nullTimestamps = ', updatedatway = NULL, updatedatpick = NULL';
    } else if (deliverystatusdetail === "On the way") {
        sqlAppend = ", updatedatway = NOW()";
        nullTimestamps = ', updatedatpick = NULL';
    } else if (deliverystatusdetail === "Product delivered") {
        sqlAppend = ", updatedatpick = NOW()";
        nullTimestamps = ', updatedatconfirmed = NULL, updatedatcheck = NULL, updatedatway = NULL';
    }

    // First, retrieve the current delivery status detail
    const sql0 = `SELECT deliverystatusdetail FROM delivery WHERE deliveryid = $1`;

    return query(sql0, [deliveryid])
        .then(function (result) {
            const rows = result.rows;

            if (rows.length === 0) {
                throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
            }

            const deliveryStatusDetailRetrieved = rows[0].deliverystatusdetail;

            if (deliveryStatusDetailRetrieved !== deliverystatusdetail) {
                // Construct the updateDeliverySql query
                const updateDeliverySql = `
                    UPDATE delivery
                    SET
                        deliverystatusdetail = $1,
                        deliverydate = $2
                        ${sqlAppend}
                        ${nullTimestamps}
                    WHERE
                        deliveryid = $3;
                `;

                const updateDeliveryParams = [deliverystatusdetail, deliverydate, deliveryid];

                // Execute the updateDeliverySql query
                return query(updateDeliverySql, updateDeliveryParams);
            } else {
                // If the delivery status detail is the same, just update the delivery date
                const updateDeliverySql = `
                    UPDATE delivery
                    SET
                        deliverydate = $1
                    WHERE
                        deliveryid = $2;
                `;

                const updateDeliveryParams = [deliverydate, deliveryid];

                // Execute the updateDeliverySql query
                return query(updateDeliverySql, updateDeliveryParams);
            }
        });
};


module.exports.updateDeliveryShipperAddressAndOrderStatus = function updateDeliveryShipperAddressAndOrderStatus(deliveryid, deliveryShipper, deliveryaddress, deliverystatusdetail) {
    // Retrieve the shipper ID based on the deliveryShipper name
    const getShipperIdSql = `
        SELECT shipperid
        FROM deliveryshipper
        WHERE name = $1;
    `;

    const getShipperIdParams = [deliveryShipper];

    // Update the delivery table with the obtained shipperid and deliveryaddress
    const updateDeliveryWithShipperIdSql = `
        UPDATE delivery
        SET
            shipperid = $1
        WHERE
            deliveryid = $2;
    `;

    // Execute the getShipperIdSql query to retrieve the shipper ID
    return query(getShipperIdSql, getShipperIdParams)
        .then(function (shipperResult) {
            if (shipperResult.rows.length === 0) {
                throw new EMPTY_RESULT_ERROR(`Shipper with name ${deliveryShipper} not found!`);
            }

            const shipperId = shipperResult.rows[0].shipperid;

            // Execute the updateDeliveryWithShipperIdSql query to update delivery table with shipperid and deliveryaddress
            return query(updateDeliveryWithShipperIdSql, [shipperId, deliveryid]);
        })
        .then(function () {
            // Update the delivery address and order status in the productorder table
            const updateProductOrderSql = `
                UPDATE productorder
                SET
                    deliveryaddress = $1,
                    orderstatus = CASE WHEN $2 = 'Product delivered' THEN 'delivered' ELSE orderstatus END
                WHERE
                    deliveryid = $3;
            `;

            const updateProductOrderParams = [deliveryaddress, deliverystatusdetail, deliveryid];

            // Execute the updateProductOrderSql query to update order status and delivery address
            return query(updateProductOrderSql, updateProductOrderParams);
        });
};



module.exports.checkIfSingleDeliveryInOrderTable = async function checkIfSingleDeliveryInOrderTable(deliveryID) {
    const queryText = `
      SELECT deliveryid
      FROM productorderitem
      WHERE deliveryid = $1;
    `

    try {
        const result = await query(queryText, [deliveryID]);

        if (!result || result.rows.length === 0) {
            console.error(`Delivery ID ${deliveryID} not found in productorder table`);
            return { deliveryID, success: false, error: `Delivery ID ${deliveryID} not found in productorder table` };
        }

        console.log(`Delivery ID ${deliveryID} is in productorder table`);
        return { deliveryID, success: true };
    } catch (error) {
        console.error(`Error checking delivery ID ${deliveryID}: ${error.message}`);
        return { deliveryID, success: false, error: error.message };
    }
};

// On delivery creation, new room is added

module.exports.addRoom = async function addRoom(adminuserid, deliveryid) {
    try {
        console.log("ONE TIME ADD ROOM: " + "===========================================================");

        // SELECT query to check if the delivery exists in the productorder table and retrieve userid
        const selectQuery = `
            SELECT appuser.userid, appuser.name
            FROM appuser
            JOIN productorder ON productorder.userid = appuser.userid
            JOIN productorderitem ON productorderitem.orderid = productorder.orderid
            JOIN delivery ON delivery.deliveryid = productorderitem.deliveryid
            WHERE delivery.deliveryid = $1;`;

        // SELECT query to check if the combination already exists in the chat table
        /*const checkIfExistsQuery = `
            SELECT *
            FROM chat
            WHERE adminuserid = $1::integer AND deliveryid = $2::integer AND useruserid = $3::integer;`;*/

        // INSERT query to add a new chat record
        const insertQuery = `
            INSERT INTO chat (adminuserid, deliveryid, useruserid, userenteredchat, adminenteredchat)
            VALUES ($1, $2, $3, false, false)
            RETURNING *;`;

        // Check if the delivery exists in the productorder table and retrieve userid
        const selectResult = await query(selectQuery, [deliveryid]);

        if (!selectResult || selectResult.rows.length == 0) {
            console.log("Not found");
            console.error(`Delivery ID ${deliveryid} not found in productorder table`);
            return { success: false, error: `Delivery ID ${deliveryid} not found in productorder table` };
        }

        // Retrieve userid from the SELECT result
        const userid = selectResult.rows[0].userid;

        const insertResult = await query(insertQuery, [adminuserid, deliveryid, userid]);

        if (!insertResult || insertResult.rows.length == 0) {
            console.log("Failed insert, returning")
            console.error(`Failed to add chat record for admin ID ${adminuserid}, delivery ID ${deliveryid}, and user ID ${userid}`);
            return { success: false, error: `Failed to add chat record for admin ID ${adminuserid}, delivery ID ${deliveryid}, and user ID ${userid}` };
        }

        console.log(`Chat record added for admin ID ${adminuserid}, delivery ID ${deliveryid}, and user ID ${userid}`);
        console.log("return to sender")
        return { success: true, roomid: insertResult.rows[0].roomid, userid: userid };
    } catch (error) {
        console.error(`Error adding chat record for admin ID ${adminuserid}, delivery ID ${deliveryid}: ${error.message}`);
        return { success: false, error: error.message };
    }
};


module.exports.removeduplicatechat = async function removeduplicatechat(updatedroomid) {
    const queryText = `
      WITH DuplicateRows AS (
        SELECT
          roomid,
          adminuserid,
          useruserid,
          deliveryid,
          ROW_NUMBER() OVER (PARTITION BY adminuserid, useruserid, deliveryid ORDER BY roomid) AS row_num
        FROM
          chat
      )
      DELETE FROM
        chat
      WHERE
        roomid IN (SELECT roomid FROM DuplicateRows WHERE row_num > 1);
    `;

    try {
        const result = await query(queryText);
        console.log('Duplicate chat rows removed successfully');
        return result;
    } catch (error) {
        console.error(`Error removing duplicate chat rows: ${error.message}`);
        throw new Error('Failed to remove duplicate chat rows');
    }


}

