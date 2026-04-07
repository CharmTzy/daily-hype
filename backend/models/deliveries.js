

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

const { query } = require('../database');
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require('../errors');


// This is the Model
//1) Creating Entities - With Checks

module.exports.checkOrderInPaymentTableAsync = async function checkOrderInPaymentTableAsync(orderID) { //at 20
    const sql = 'SELECT COUNT(*) AS count FROM payment WHERE orderID = $1';
    const result = await query(sql, [orderID]);
    const count = result.rows[0].count;
    console.log("Count0 is " + count)
    return count > 0;

}

module.exports.checkOrderExistsWithUserAsync = async function checkOrderExistsWithUserAsync(orderID) {
    const sql = 'SELECT userID FROM productorder WHERE orderID = $1';
    const result = await query(sql, [orderID]);

    // If no rows are returned, the order doesn't exist
    if (result.rows.length === 0) {
        console.log("Order not found.");
        return false;
    }

    const userID = result.rows[0].userID;

    // If userID is null, return false
    if (userID === null) {
        console.log("User ID is null.");
        return false;
    }

    console.log("User ID is " + userID);
    return true;
}


//2) Updating Entities - With Checks

//check if deliveryid inside orders table, before updating record
module.exports.checkIfDeliveryInOrderTable = async function checkIfDeliveryInOrderTable(deliveryIDs) {
    const results = await Promise.all(
        deliveryIDs.map(async (deliveryID) => {
            const query = `
          SELECT deliveryid
          FROM productorder
          WHERE deliveryid = $1;
        `;

            try {
                const result = await query(query, [deliveryID]);
                if (!result || result.length === 0) {
                    throw new Error(`Delivery ID ${deliveryID} not found in productorder table`);
                }
                console.log(`Delivery ID ${deliveryID} is in productorder table`);
                return { deliveryID, success: true };
            } catch (error) {
                console.error(`Error checking delivery ID ${deliveryID}: ${error.message}`);
                return { deliveryID, success: false, error: error.message };
            }
        })
    );

    return results;
};

module.exports.updateDeliveryUpdateSingleStatus = function updateDeliveryUpdateSingleStatus(deliveryid, newDeliverystatus, deliverystatusdetail) {
    const sql = `UPDATE delivery SET deliverystatus = $1, deliverystatusdetail = $2 WHERE deliveryid = $3`;

    return query(sql, [newDeliverystatus, deliverystatusdetail, deliveryid]).then(function (result) {
        if (result.rowCount === 0) {
            throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
        }
    });
};


module.exports.updateDeliveriesBatch = function updateDeliveriesBulk(updatedDeliveries) {
    const promises = updatedDeliveries.map(({ deliveryid, newDeliveryStatus, deliverystatusdetail, selectedDateDelivery }) => {

        const sql0 = `SELECT delivery.deliverystatusdetail FROM delivery WHERE deliveryid = $1`;

        return query(sql0, [deliveryid]).then(function (result) {
            const rows = result.rows;

            if (rows.length === 0) {
                throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
            }

            const deliveryStatusDetailRetrieved = rows[0].deliverystatusdetail;

            console.log("Retrieved deliverydetailstatus" + deliveryStatusDetailRetrieved);

            console.log("deliverydate is " + selectedDateDelivery);

            // Initialize main SQL query with default update fields
            let sql = 'UPDATE delivery SET deliverystatus = $1, deliverystatusdetail = $2, deliverydate = $3';

            // Set timestamp fields to null based on conditions
            let nullTimestamps = '';
            if (deliverystatusdetail == "Order confirmed") {
                nullTimestamps = ', updatedatcheck = NULL, updatedatway = NULL, updatedatpick = NULL';
            } else if (deliverystatusdetail == "Ready for pickup by company") {
                nullTimestamps = ', updatedatway = NULL, updatedatpick = NULL';
            } else if (deliverystatusdetail == "On the way") {
                nullTimestamps = ', updatedatpick = NULL';
            }

            // Append additional clauses to the main SQL query
            sql += nullTimestamps + ' WHERE deliveryid = $4';

            // Append specific update clauses based on deliverystatusdetail
            if (deliverystatusdetail == "Order confirmed") {
                sql += ', updatedatconfirmed = NOW()';
            } else if (deliverystatusdetail == "Ready for pickup by company") {
                sql += ', updatedatcheck = NOW()';
            } else if (deliverystatusdetail == "On the way") {
                sql += ', updatedatway = NOW()';
            } else if (deliverystatusdetail == "Product delivered") {
                sql += ', updatedatpick = NOW()';

                // Additional logic for Product delivered status
                const sql2 = `UPDATE productorder SET orderstatus = 'delivered' WHERE deliveryid = $1`;

                return query(sql, [newDeliveryStatus, deliverystatusdetail, selectedDateDelivery, deliveryid])
                    .then(function (result) {
                        if (result.rowCount === 0) {
                            throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
                        }

                        return query(sql2, [deliveryid]);
                    })
                    .then(function (result2) {
                        if (result2.rowCount === 0) {
                            throw new EMPTY_RESULT_ERROR(`Product order for Delivery with ID ${deliveryid} not found!`);
                        }
                    })
                    .catch(error => {
                        throw new Error(`Error updating Product delivered status: ${error.message}`);
                    });
            }

            const sqlInsert = sql;
            console.log("Actual SQL is " + sqlInsert);

            return query(sqlInsert, [newDeliveryStatus, deliverystatusdetail, selectedDateDelivery, deliveryid])
                .then(function (result) {
                    if (result.rowCount === 0) {
                        throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
                    }
                })
                .catch(error => {
                    throw new Error(`Error updating delivery status: ${error.message}`);
                });
        });
    });

    return Promise.all(promises);
};


//3) Get Entities
//For Dropdowns


module.exports.retrieveOneDelivery = function retrieveByCode(deliveryid) {
    const sql = `SELECT * FROM delivery WHERE deliveryid = $1`;
    return query(sql, [deliveryid]).then(function (result) {
        const rows = result.rows;

        if (rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
        }

        return rows[0];
    });
};

module.exports.retrieveuserrole = function retrieveuserrole(userid) { //User- for single select
    const sql = `SELECT role.rolename FROM role JOIN appuser ON appuser.roleid = role.roleid WHERE userid = $1`;
    return query(sql, [userid]).then(function (result) {
        const rows = result.rows;

        if (rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`user role not found!`);
        }

        return rows[0];
    });
};

module.exports.retrieveAllTrackingNumbers = function retrieveAllTrackingNumbers() {
    const sql = `SELECT deliveryid, trackingnumber FROM delivery`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ deliveryid: row.deliveryid, trackingnumber: row.trackingnumber }));
    });
};

module.exports.retrieveAllCurrentProductsCat = function retrieveAllCurrentProductsCat() {
    const sql = `SELECT categoryid, categoryname FROM category WHERE categoryname IS NOT NULL`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ categoryid: row.categoryid, categoryname: row.categoryname }));
    });
};
module.exports.retrieveAllUsersInRegions = function retrieveAllUsersInRegions() {
    const sql = `SELECT DISTINCT address.region FROM address inner join appuser on appuser.userid = address.userid WHERE address.region IS NOT NULL`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ region: row.region }));
    });
};

module.exports.retrieveAllUserNames = function retrieveAllUserNames() {
    const sql = `SELECT DISTINCT appuser.name FROM appuser;
    `;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ username: row.name }));
    });
};

module.exports.retrieveAllProducts = function retrieveAllProducts() {
    const sql = `SELECT DISTINCT product.productname FROM product;    ;
    `;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ productname: row.productname }));
    });
};

module.exports.retrieveAllAddress = function retrieveAllAddress() {
    const sql = `SELECT DISTINCT productorder.deliveryaddress FROM productorder;
    `;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ addressname: row.deliveryaddress }));
    });
};



module.exports.retrieveAllUserIds = function retrieveAllUserIds() {
    const sql = `SELECT DISTINCT userid FROM appuser`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ userId: row.userid }));
    });
};

module.exports.retrieveAllShipperID = function retrieveAllShipperID() {
    const sql = `SELECT DISTINCT shipperid FROM deliveryshipper`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ shipId: row.shipperid }));
    });
};

// CA1 Fetch Delivery - Note this is for CA1 (Without Filters)

// For the chat room (old code, new revamped code below)
module.exports.retrieveDeliveryDetailsById = function retrieveDeliveryDetailsById(deliveryId) {
    const sql = `
        SELECT
            deliveryshipper.name as carrier,
            deliveryshipper.phone as phone,
            delivery.deliveryid as deliveryId,
            delivery.deliverystatusdetail as deliveryStatusDetail,
            productorder.orderid as orderId,
            delivery.deliverydate as deliveryTime,
            productorder.deliveryaddress as deliveryAddress,
            delivery.deliverydate as estimatedDeliveryDate,
            delivery.deliverystatus as status,
            delivery.trackingnumber as trackingNumber,
            product.productname as itemName,
            product.description as itemDescription,
            image.url as itemImage,
            product.unitprice as itemPrice,
            appuser.userid as userId,
            appuser.name as userName
        FROM
            appuser
            JOIN productorder ON appuser.userid = productorder.userid
            JOIN delivery ON delivery.deliveryid = productorder.deliveryid
            JOIN productorderitem ON productorder.orderid = productorderitem.orderid
            JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid
            JOIN product ON productdetail.productid = product.productid
            JOIN productimage ON productimage.productid = product.productid
            JOIN image ON productimage.imageid = image.imageid
            JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid
        WHERE
            delivery.deliveryid = $1`;

    return query(sql, [deliveryId]).then(function (result) {
        const rows = result.rows;

        // If no delivery found, return null
        if (rows.length === 0) {
            return null;
        }

        console.log(rows)

        // Extract delivery details from the first row
        const deliveryDetails = {
            carrier: rows[0].carrier,
            phone: rows[0].phone,
            deliveryId: rows[0].deliveryid,
            deliveryStatusDetail: rows[0].deliverystatusdetail,
            orderId: rows[0].orderid,
            deliveryTime: rows[0].deliverytime,
            deliveryAddress: rows[0].deliveryaddress,
            estimatedDeliveryDate: rows[0].estimateddeliverydate,
            status: rows[0].status,
            trackingNumber: rows[0].trackingnumber,
            userId: rows[0].userid,
            userName: rows[0].username,
            items: rows.map(row => ({
                itemName: row.itemname,
                itemDescription: row.itemdescription,
                itemImage: row.itemimage,
                itemPrice: row.itemprice
            }))
        };

        return deliveryDetails;
    });
};


// for chart 0

/*
product.productname as itemName, 
    product.description as itemDescription, 
    image.url as itemImage, 
    product.unitprice as itemPrice, 
    */

module.exports.getDeliveriesSortedByStageNum = async function getDeliveriesSortedByStageNum(selectedDropdownValueForm, choiceNum, date1, date2) {

    let sqlstart = `
SELECT
DISTINCT
delivery.deliveryid as deliveryId, 

    deliveryshipper.name as carrier, 
    deliveryshipper.phone as phone, 
    delivery.deliverystatusdetail as deliveryStatusDetail, 
    productorder.orderid as orderId, 
    delivery.deliverydate as deliveryTime, 
    productorder.deliveryaddress as deliveryAddress, 
    delivery.deliverydate as estimatedDeliveryDate, 
    delivery.deliverystatus as status, 
    delivery.trackingnumber as trackingNumber, 
    
    appuser.userid as userId, 
    appuser.name as userName,
    CASE
        WHEN delivery.deliverydate < delivery.updatedatway OR delivery.deliverydate < delivery.updatedatcheck OR delivery.deliverydate < delivery.updatedatconfirmed THEN 'Late Delivery'
        WHEN delivery.updatedatpick IS NOT NULL THEN 'Delivered Success'
        WHEN (delivery.deliverydate - delivery.updatedatway) < '5 hours' THEN 'On the way (Urgent)'
        WHEN (delivery.deliverydate - delivery.updatedatcheck) < '11 hours' THEN 'Ready for pickup (Urgent)'
        WHEN (delivery.deliverydate - delivery.updatedatconfirmed) < '48 hours' THEN 'Confirmed (Urgent)'
        WHEN delivery.updatedatpick IS NULL AND delivery.updatedatway IS NOT NULL THEN 'On the way (On track)'
        WHEN delivery.updatedatway IS NULL AND delivery.updatedatcheck IS NOT NULL THEN 'Ready for pickup (On track)'
        WHEN delivery.updatedatcheck IS NULL AND delivery.updatedatconfirmed IS NOT NULL THEN 'Confirmed (On track)'
    END AS CurrentStageNum
`;




    let sqlend = " FROM appuser JOIN productorder ON appuser.userid = productorder.userid JOIN delivery ON delivery.deliveryid = productorder.deliveryid JOIN productorderitem ON productorder.orderid = productorderitem.orderid JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid JOIN product ON product.productid = productdetail.productid JOIN productimage ON product.productid = productimage.productid JOIN image ON productimage.imageid = image.imageid JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid";
    //let sqlend = " FROM appuser JOIN productorder ON appuser.userid = productorder.userid JOIN delivery ON delivery.deliveryid = productorder.deliveryid JOIN productorderitem ON productorder.orderid = productorderitem.orderid JOIN productdetail ON productorderitem.productdetailid JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid";

    //let sqlend = " FROM appuser JOIN productorder ON appuser.userid = productorder.userid JOIN delivery ON delivery.deliveryid = productorder.deliveryid JOIN productorderitem ON productorder.orderid = productorderitem.orderid JOIN productdetail ON productorderitem.productdetailid = productdetail.id JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid";



    // Append WHERE condition based on selectedDropdownValueForm and choiceNum
    if (choiceNum == 1) {
        if (selectedDropdownValueForm == "Region") {
            sqlstart += ", address.region";
            sqlend += " JOIN address ON appuser.userid = address.userid";
        } else if (selectedDropdownValueForm == "Category") {
            sqlstart += ", category.categoryname";
            sqlend += " JOIN category ON product.categoryid = category.categoryid";
        } else if (selectedDropdownValueForm == "Gender") {
            sqlstart += ", appuser.gender";
        } else if (selectedDropdownValueForm == "DayParts") {
            sqlend += ` WHERE delivery.deliverydate BETWEEN '${date1}' AND '${date2}' AND delivery.updatedatpick IS NOT NULL`;
        } else if (selectedDropdownValueForm == "Shipper") {
            sqlstart += ", deliveryshipper.name";
        } else {
            // Default condition if none of the above
            sqlstart += ", delivery.updatedatpick";
            sqlend += " WHERE delivery.updatedatpick IS NOT NULL";
        }
    } else if (choiceNum == 2) {
        sqlstart += ", product.productname";
        //JOIN category ON product.categoryid = category.categoryid
        sqlend += " JOIN category ON product.categoryid = category.categoryid WHERE category.categoryname = '" + selectedDropdownValueForm + "'";
    } else if (choiceNum == 3) {
        sqlstart += ", appuser.name";
        sqlend += " JOIN address ON appuser.userid = address.userid WHERE address.region = '" + selectedDropdownValueForm + "'";
    } else if (choiceNum == 4) {
        sqlend += ` WHERE delivery.deliverydate BETWEEN '${date1}' AND '${date2}' AND delivery.updatedatpick IS NOT NULL`;
    }

    const sql = `${sqlstart} ${sqlend} ORDER BY CurrentStageNum`;

    const result = await query(sql);

    console.log("Chart 0 Result================================================: " + result.rows)
    return result.rows;
}







// Stats functions reused for CA2
module.exports.retrievechartJS1Array = async function retrievechartJS1Array(selectedDropdownValueForm, choiceNum, date1, date2) {

    var sqlstart = " ";
    var sqlend = " ";

    var sqlend2 = " delivery.deliverydate BETWEEN '" + date1 + "' AND '" + date2 + "' ";

    // Append WHERE condition based on selectedDropdownValueForm and choiceNum
    if (choiceNum == 1) {
        if (selectedDropdownValueForm == "Region") {

            sqlstart = "SELECT DISTINCT delivery.deliveryid, address.region"
            //sql += " WHERE appuser.userid = 14 AND appuser.region = 'YourRegionValue'";
            sqlend = " WHERE "



        } else if (selectedDropdownValueForm == "Category") {
            sqlstart = "SELECT DISTINCT delivery.deliveryid, category.categoryname"
            sqlend = " WHERE "

        } else if (selectedDropdownValueForm == "Gender") {
            sqlstart = "SELECT DISTINCT delivery.deliveryid, appuser.gender"
            sqlend = " WHERE "

        } else if (selectedDropdownValueForm == "DayParts") {

            //sqlstart = "SELECT DISTINCT delivery.deliveryid"
            //sqlend = " WHERE "

            sqlstart = "SELECT DISTINCT delivery.deliveryid, delivery.deliverydate, delivery.updatedatpick"
            sqlend = " WHERE delivery.deliverydate BETWEEN '" + date1 + "' AND '" + date2 + "' AND delivery.updatedatpick IS NOT NULL AND";

            choiceNum = 4;


        } else if (selectedDropdownValueForm == "Shipper") {


            sqlstart = "SELECT DISTINCT delivery.deliveryid, deliveryshipper.name"
            sqlend = " WHERE ";

        } else {
            // Default condition if none of the above
            sqlstart = "SELECT DISTINCT delivery.deliveryid, delivery.updatedatpick"
            sqlend = " WHERE delivery.updatedatpick IS NOT NULL AND";
        }

    } else if (choiceNum == 2) {


        console.log(selectedDropdownValueForm)
        sqlstart = "SELECT DISTINCT delivery.deliveryid, product.productname"
        sqlend = " WHERE category.categoryname = '" + selectedDropdownValueForm + "' AND";

    } else if (choiceNum == 3) {

        sqlstart = "SELECT DISTINCT delivery.deliveryid, appuser.name"
        sqlend = " WHERE address.region = '" + selectedDropdownValueForm + "' AND"

    } else if (choiceNum == 4) {
        // Not reaching

        console.log("Reached ChoiceNum 4")

        sqlstart = "SELECT DISTINCT delivery.deliveryid, delivery.deliverydate, delivery.updatedatpick"
        sqlend = " WHERE delivery.deliverydate BETWEEN '" + date1 + "' AND '" + date2 + "' AND delivery.updatedatpick IS NOT NULL AND";
        //sqlend2 = " AND delivery.updatedatpick IS NOT NULL";

    } else {

    }

    var sql = sqlstart + " FROM appuser JOIN address ON appuser.userid = address.userid JOIN productorder ON appuser.userid = productorder.userid JOIN delivery ON delivery.deliveryid = productorder.deliveryid JOIN productorderitem ON productorder.orderid = productorderitem.orderid JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid JOIN product ON productdetail.productid = product.productid JOIN category ON product.categoryid = category.categoryid JOIN productimage ON productimage.productid = product.productid JOIN image ON productimage.imageid = image.imageid JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid" + sqlend + sqlend2 + ";";

    console.log("sql: " + sql)

    return query(sql).then(function (result) {
        const rows = result.rows;

        // Map the rows based on the selected field
        return rows.map(row => {
            let fieldValue;

            console.log("ChoiceNum" + choiceNum)

            // Determine the field value based on choiceNum
            if (choiceNum == 1) {
                if (selectedDropdownValueForm == "Region") {
                    fieldValue = row.region;

                } else if (selectedDropdownValueForm == "Category") {
                    fieldValue = row.categoryname;

                } else if (selectedDropdownValueForm == "Gender") {
                    fieldValue = row.gender;

                } else if (selectedDropdownValueForm == "Shipper") {
                    fieldValue = row.name
                }

                //fieldValue = row.region;
            } else if (choiceNum == 2) {
                fieldValue = row.productname;
            } else if (choiceNum == 3) {
                fieldValue = row.name;
            } else if (choiceNum == 4) {
                fieldValue = categorizeTimeOfDay(row.deliverydate);

                function categorizeTimeOfDay(timestamp) {
                    // Convert the timestamp to a JavaScript Date object
                    const dateObject = new Date(timestamp);

                    // Get the hour from the Date object
                    const hour = dateObject.getHours();

                    // Define the boundaries for each time category
                    const morningStart = 6;
                    const afternoonStart = 12;
                    const eveningStart = 18;


                    // Categorize the time based on the hour
                    if (hour >= morningStart && hour < afternoonStart) {
                        return 'Morning';
                    } else if (hour >= afternoonStart && hour < eveningStart) {
                        return 'Afternoon';
                    } else {
                        console.log("Night hour is: " + hour)
                        return 'Evening/Night';
                    }
                }
            } else {
                // Handle the default case or any other conditions
            }

            // Return an object with both deliveryid and the dynamically selected field

            console.log("=============  fieldValue is " + fieldValue + " ===================")
            return { deliveryid: row.deliveryid, chartHeaderValue: fieldValue };
        });
    });
};


module.exports.retrievechartJS3Array = async function retrievechartJS3Array(deliveryIdsString, chartHeaderString, specficboolean) {

    console.log("RetrievechartJS3ArrayEncoded" + deliveryIdsString);

    const allDeliveryIdsArr = JSON.parse(decodeURIComponent(deliveryIdsString));

    const sqlBase = `
    SELECT 
        DISTINCT
        delivery.deliveryid,
        delivery.trackingnumber,
        delivery.deliverystatusdetail,
        deliveryshipper.name,
        productorder.deliveryaddress,
        delivery.deliverydate,
        GREATEST(
            ROUND(EXTRACT(EPOCH FROM (delivery.updatedatpick - delivery.deliverydate)) / 3600, 2),
            0
        ) AS hour_difference
    FROM delivery
    JOIN deliveryshipper ON deliveryshipper.shipperid = delivery.shipperid
    JOIN productorderitem ON delivery.deliveryid = productorderitem.deliveryid
    JOIN productorder ON productorder.orderid = productorderitem.orderid
    WHERE delivery.deliveryid = 
`;


    const promises = allDeliveryIdsArr.map(async function (deliveryId) {
        const sql = sqlBase + deliveryId;
        const result = await query(sql);
        const rows = result.rows;


        if (specficboolean) {
            return { rows: rows };
        } else {

            console.log("========================= ROWS2nd: " + rows.length);

            if (rows.length > 0) {
                console.log(rows[0].hour_difference);
                const fieldValue = {
                    hour_difference: rows[0].hour_difference
                };

                console.log(fieldValue == null);

                return { deliveryid: deliveryId, chartHeaderValue: fieldValue };
            } else {

                return { deliveryid: deliveryId, chartHeaderValue: null };
            }
        }
    });

    return Promise.all(promises);
};


module.exports.retrievechartJS2Array = async function retrievechartJS2Array(deliveryIdsString, chartHeaderString, specficboolean) {

    console.log("RetrievechartJS2ArrayEncoded" + deliveryIdsString);

    allDeliveryIdsArr = JSON.parse(decodeURIComponent(deliveryIdsString));

    //const allDeliveryIdsArr = deliveryIdsString.split('#');

    //const headersArr = chartHeaderString.split('#');

    const sqlBase = "SELECT" +
        " DISTINCT" +
        " delivery.deliveryid," +
        " delivery.trackingnumber," +
        " delivery.deliverystatusdetail," +
        " deliveryshipper.name," +
        " productorder.deliveryaddress," +
        " delivery.deliverydate," +
        " ROUND(GREATEST(COALESCE(EXTRACT(EPOCH FROM (delivery.updatedatcheck - delivery.updatedatconfirmed)) / 3600, 0), 0), 2) AS diff_ab_hours," +
        " ROUND(GREATEST(COALESCE(EXTRACT(EPOCH FROM (delivery.updatedatway - delivery.updatedatcheck)) / 3600, 0), 0), 2) AS diff_bc_hours," +
        " ROUND(GREATEST(COALESCE(EXTRACT(EPOCH FROM (delivery.updatedatpick - delivery.updatedatway)) / 3600, 0), 0), 2) AS diff_cd_hours" +
        " FROM" +
        " delivery" +
        " JOIN deliveryshipper ON deliveryshipper.shipperid = delivery.shipperid" +
        " JOIN productorderitem ON delivery.deliveryid = productorderitem.deliveryid" +
        " JOIN productorder ON productorder.orderid = productorderitem.orderid" +
        " WHERE" +
        " delivery.deliveryid = ";


    const promises = allDeliveryIdsArr.map(async function (deliveryId) {
        const sql = sqlBase + deliveryId;
        const result = await query(sql);
        const rows = result.rows;

        if (specficboolean) {
            return { deliveryid: deliveryId, rows: rows };
        } else {

            console.log("========================= ROWS: " + rows.length)

            if (rows.length > 0) {
                console.log(rows[0].diff_ab_hours + rows[0].diff_bc_hours + rows[0].diff_cd_hours)
                const fieldValue = {
                    diff_ab_hours: rows[0].diff_ab_hours,
                    diff_bc_hours: rows[0].diff_bc_hours,
                    diff_cd_hours: rows[0].diff_cd_hours
                };

                console.log(fieldValue == null)

                return { deliveryid: deliveryId, chartHeaderValue: fieldValue };
            } else {

                // Handle the case when no rows are returned for a delivery ID
                return { deliveryid: deliveryId, chartHeaderValue: null };
            }

        }

    });

    return Promise.all(promises);
};

//4) Delete Entities

module.exports.checkOrderCancelledFirst = function checkOrderCancelledFirst(deliveryid) {
    const sql = `
    SELECT productorder.orderstatus 
    FROM productorder 
    JOIN productorderitem ON productorder.orderid = productorderitem.orderid
    JOIN delivery ON productorderitem.deliveryid = delivery.deliveryid 
    WHERE delivery.deliveryid = $1;
    `;

    return query(sql, [deliveryid]).then(function (result) {
        if (result.rowCount === 0) {
            throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
        }

        const orderStatus = result.rows[0].orderstatus;

        if (orderStatus !== 'cancelled') {

            throw new Error(`Order is not cancelled for Delivery with ID ${deliveryid}`);
        }
    });
};


const removeDeliveryIDFromTable = function (tableName, deliveryid) {
    const sql = `
    UPDATE ${tableName}
    SET deliveryid = null
    WHERE deliveryid = $1;
    `;

    console.log(`Removing deliveryid to NULL in table ${tableName}`);

    return query(sql, [deliveryid]).then(function (result) {
        if (result.rowCount === 0) {
            throw new Error(`No record found in table ${tableName} with associated delivery ID ${deliveryid}`);
        }

        return { message: `Delivery ID removed from ${tableName} successfully` };
    });
};

// Usage for productorder
module.exports.removeDeliveryIDFromOrder = function (deliveryid) {
    return removeDeliveryIDFromTable('productorder', deliveryid);
};

// Usage for productorderitem
module.exports.removeDeliveryIDFromOrderItem = function (deliveryid) {
    return removeDeliveryIDFromTable('productorderitem', deliveryid);
};

module.exports.deleteMessagesAndRoom = function deleteMessagesAndRoom(deliveryid) {
    const getRoomIdSql = `SELECT roomid FROM chat WHERE deliveryid = $1`;
    const deleteMessagesSql = `DELETE FROM message WHERE roomid = $1`;
    const deleteChatSql = `DELETE FROM chat WHERE roomid = $1`;

    return query(getRoomIdSql, [deliveryid])
        .then(function (roomResult) {
            const roomid = roomResult.rows[0].roomid;
            return query(deleteMessagesSql, [roomid]).then(function () {
                return query(deleteChatSql, [roomid]);
            });
        })
        .catch(function (error) {
            throw new Error(`Error deleting messages and room: ${error.message}`);
        });
};


module.exports.deleteDelivery = function deleteDelivery(deliveryid) {
    const sql = `DELETE FROM delivery WHERE deliveryid = $1`;
    return query(sql, [deliveryid]).then(function (result) {
        if (result.rowCount === 0) {
            throw new EMPTY_RESULT_ERROR(`Delivery with ID ${deliveryid} not found!`);
        }
    });
};


// ===================================================    CA2   ===============================================//

// New models for CA2 are separated into 4 main sections
// Section 1: Initalisation of new dropdowns - Lines 170+ Onwards and This:


// Section 2: The Chat

module.exports.addNewChatEntry = function addNewChatEntry(adminUserID, userUserID, deliveryID) {
    const sql = `INSERT INTO chat (adminUserID, userUserID, deliveryID, speakerID) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [adminUserID, userUserID, deliveryID];
    return query(sql, values).then(function (result) {
        return result.rows[0];
    });
};

module.exports.addNewMessage = function addNewMessage(messagedatetime, msgcontent, roomid, speakerid, userid) {
    // First query to retrieve the role for the specified user
    const roleQuery = `SELECT role.rolename FROM role INNER JOIN appuser ON role.roleid = appuser.roleid WHERE appuser.userid = $1`;
    const roleValues = [speakerid];

    console.log("Adding new message ===========================================")


    // Execute the role query
    return query(roleQuery, roleValues)
        .then(function (roleResult) {
            const roleName = roleResult.rows[0] ? roleResult.rows[0].rolename : null;

            // Determine the values based on the role
            let messagereaduser, messagereadadmin;

            if (roleName === 'admin') {
                // Check if userenteredchat is true for the given roomid
                const adminEnteredChatQuery = `SELECT chat.userenteredchat FROM chat WHERE roomid = $1`;
                const adminEnteredChatValues = [roomid];

                return query(adminEnteredChatQuery, adminEnteredChatValues)
                    .then(function (chatResult) {
                        const userEnteredChat = chatResult.rows[0] ? chatResult.rows[0].userenteredchat : false;

                        // Set values based on the userEnteredChat condition
                        messagereaduser = userEnteredChat;
                        messagereadadmin = true;

                        // Continue with the message insertion query
                        const sql = `INSERT INTO Message (messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                        const values = [messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin];

                        return query(sql, values).then(function (result) {
                            // Return the first row of the result, assuming it is an array of rows
                            return result.rows[0];
                        });
                    });
            } else if (roleName === 'customer') {
                // Check if adminenteredchat is true for the given roomid
                const customerEnteredChatQuery = `SELECT chat.adminenteredchat FROM chat WHERE roomid = $1`;
                const customerEnteredChatValues = [roomid];

                return query(customerEnteredChatQuery, customerEnteredChatValues)
                    .then(function (chatResult) {
                        const adminEnteredChat = chatResult.rows[0] ? chatResult.rows[0].adminenteredchat : false;

                        // Set values based on the adminEnteredChat condition
                        messagereaduser = true;
                        messagereadadmin = adminEnteredChat;

                        // Continue with the message insertion query
                        const sql = `INSERT INTO Message (messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                        const values = [messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin];

                        return query(sql, values).then(function (result) {
                            // Return the first row of the result, assuming it is an array of rows
                            return result.rows[0];
                        });
                    });
            } else {
                // Default values if the role is neither admin nor customer
                messagereaduser = false;
                messagereadadmin = false;

                // Continue with the message insertion query
                const sql = `INSERT INTO Message (messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                const values = [messagedatetime, msgcontent, roomid, speakerid, messagereaduser, messagereadadmin];

                return query(sql, values).then(function (result) {
                    // Return the first row of the result, assuming it is an array of rows
                    return result.rows[0];
                });
            }
        });
};


// Function to update message read status based on user role and get all messages for the specified room
module.exports.updateMessageReadStatus = function updateMessageReadStatus(userid, roomid) {
    //userid = 54;
    const roleQuery = `SELECT role.rolename FROM role INNER JOIN appuser ON role.roleid = appuser.roleid WHERE appuser.userid = $1`;
    const roleValues = [userid];

    return query(roleQuery, roleValues)
        .then(function (roleResult) {
            const roleName = roleResult.rows[0] ? roleResult.rows[0].rolename : null;
            console.log("roleName for updateMessageReadStatus is: " + roleName)
            const readStatusField = roleName === 'admin' ? 'messagereadadmin' : 'messagereaduser';

            const updateQuery = `
                UPDATE message AS m
                SET ${readStatusField} = true
                FROM chat AS c
                WHERE m.roomid = c.roomid AND m.roomid = $1
            `;
            const updateValues = [roomid];

            return query(updateQuery, updateValues);
        })
        .then(function (result) {
            return result.rows;
        });
};


// Function to get all message content, speaker IDs, and dates for a specific roomid
module.exports.getAllMessagesRoom = function getAllMessagesRoom(roomid) {
    const sql = `SELECT msgcontent, speakerid, messagedatetime FROM Message WHERE roomid = $1`;
    const values = [roomid];

    return query(sql, values).then(function (result) {
        return result.rows;
    });
};

module.exports.updatechatleavestatus = function updatechatleavestatus(leaveStatus, roomId, userId) {
    let updatechatleavestatusQuery = '';

    console.log("ROOMID IS " + roomId)

    var sqlInput

    // First Time Load
    if (roomId == null) {
        return o;
    }

    if (roomId == 0) {
        // Update all rooms when roomId is 0
        updatechatleavestatusQuery = `
            UPDATE chat
            SET 
                userenteredchat = CASE WHEN useruserid = $2 THEN $1 ELSE userenteredchat END,
                adminenteredchat = CASE WHEN adminuserid = $2 THEN $1 ELSE adminenteredchat END
        `;
        console.log("BY RIGHT CORRECT")

        sqlInput = [leaveStatus, userId]

    } else {
        // Update a specific room when roomId is not 0
        console.log("BY RIGHT WRONG")

        sqlInput = [leaveStatus, roomId, userId]

        updatechatleavestatusQuery = `
            UPDATE chat
            SET 
                userenteredchat = CASE WHEN useruserid = $3 THEN $1 ELSE userenteredchat END,
                adminenteredchat = CASE WHEN adminuserid = $3 THEN $1 ELSE adminenteredchat END
            WHERE roomid = $2
        `;
    }

    return query(updatechatleavestatusQuery, sqlInput)
        .then(function (result) {
            const rows = result.rows;

            if (rows.length === 0) {
                return null;
            }

            return rows[0].roomid;
        });
};


// Function to get the room_Id based on userUserID and deliveryID
module.exports.getRoomId = function getRoomId(userUserID, deliveryID, isadmin) {

    var sql = `SELECT roomid FROM chat WHERE useruserid = $1 AND deliveryid = $2`
    if (isadmin) {
        sql = `SELECT roomid FROM chat WHERE adminuserid = $1 AND deliveryid = $2`;
    }

    const values = [userUserID, deliveryID];
    return query(sql, values).then(function (result) {
        // Assuming you expect only one result, you can directly return the room_Id
        if (result.rows.length > 0) {
            return result.rows[0].roomid;
        } else {
            // Return null or some indication that the room was not found
            return null;
        }
    });
};

// Part 3: Get Delivery (CA2)
// Here, getting delivery is done using 2 queries. a) Get deliveryids based on filters, b) Get delivery details based on deliverids

// a) Get deliveryids based on filters
module.exports.retrieveDistinctDeliveryIdsWithPagination = function retrieveDistinctDeliveryIdsWithPagination(
    userid,
    startDate,
    endDate,
    startDateOrder,
    endDateOrder,
    statusDetail,
    limit,
    offset
) {
    // Define the base SQL query
    let sql = `
    SELECT DISTINCT delivery.deliveryid,
    delivery.deliverydate as deliveryTime,
    productorder.createdat as createTime
    FROM
        appuser
        JOIN productorder ON appuser.userid = productorder.userid
        JOIN productorderitem ON productorder.orderid = productorderitem.orderid
		JOIN delivery ON delivery.deliveryid = productorderitem.deliveryid
        JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid
        JOIN product ON productdetail.productid = product.productid
        JOIN productimage ON productimage.productid = product.productid
        JOIN image ON productimage.imageid = image.imageid
        JOIN deliveryshipper ON delivery.shipperid = deliveryshipper.shipperid
    WHERE
        appuser.userid = $1
        -- Additional Filters
        AND delivery.deliverydate >= COALESCE($2, delivery.deliverydate)
        AND delivery.deliverydate <= COALESCE($3, delivery.deliverydate)
        AND delivery.deliverystatusdetail = COALESCE($4, delivery.deliverystatusdetail)
        AND productorder.createdat >= COALESCE($5, productorder.createdat)
        AND productorder.createdat <= COALESCE($6, productorder.createdat)
        
    LIMIT $7 OFFSET $8;
    `;

    return query(sql, [userid, startDate, endDate, statusDetail, startDateOrder, endDateOrder, limit, offset])
        .then(function (result) {
            const rows = result.rows;

            // If no deliveries found, return an empty array
            if (rows.length === 0) {
                return [];
            }

            // Extract and return the distinct delivery ids
            const distinctDeliveryIds = rows.map(row => row.deliveryid);
            return distinctDeliveryIds;
        });
};


// Actual retrieving of delivery information for both general and chat page

module.exports.retrieveDeliveryDetails = function retrieveDeliveryDetails(
    deliveryIds,
    arrangeByOrder,
    arrangeByDelivery
) {

    console.log("FUNCTION CALLED");

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
        COUNT(CASE WHEN message.messagereaduser = 'false' THEN 1 ELSE NULL END) AS readMessageCount
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


// b) Get delivery details based on orderdetailids

module.exports.retrieveProductOrderDetails = function retrieveProductOrderDetails(orderId) {
    console.log("FUNCTION CALLED");

    // Define the base SQL query
    let sql = `
    SELECT 
        productorder.orderid as orderId,
        productorder.deliveryaddress as deliveryAddress,
        productorderitem.productdetailid as productdetailid,
		productorderitem.qty as productquantity,
		size.sizename as size,
		colour.colourname as colour,
        product.productname as name,
        product.description as description,
        image.url as image,
        product.unitprice as price,
        productorder.orderid as orderID,
        productorder.createdat as createTime
    FROM
        productorderitem
        JOIN productorder ON productorderitem.orderid = productorder.orderid   
        JOIN productdetail ON productorderitem.productdetailid = productdetail.productdetailid
        JOIN product ON productdetail.productid = product.productid
        JOIN size ON productdetail.sizeid = size.sizeid
        JOIN colour ON productdetail.colourid = colour.colourid
        JOIN productimage ON productimage.productid = product.productid
        JOIN image ON productimage.imageid = image.imageid
    WHERE
        productorderitem.orderid = $1
    `;

    return query(sql, [orderId])
        .then(function (result) {
            const rows = result.rows;

            // If no product orders found, return an empty array
            if (rows.length === 0) {
                return [];
            }

            // Process the rows to maintain the desired output format
            const productOrdersArray = [];

            rows.forEach((row) => {
                productOrdersArray.push({
                    orderId: row.orderid,
                    productdetailId: row.productdetailid,
                    deliveryAddress: row.deliveryaddress,
                    productquantity: row.productquantity,
                    size: row.size,
                    colour: row.colour,
                    name: row.name,
                    description: row.description,
                    image: row.image,
                    price: row.price,
                    orderID: row.orderid,
                    createTime: row.createtime
                });
            });

            return productOrdersArray;
        });
};

// Part 4: Create New Delivery - Since 1 order can have many deliveries, we have to manually create assign deliveries to orders items

module.exports.retrieveAllShippers = function retrieveAllShippers() {
    const sql = `SELECT DISTINCT shipperid, name FROM deliveryshipper`;
    return query(sql).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ shipId: row.shipperid, name: row.name }));
    });
};

module.exports.retrieveOrderAddress = function retrieveOrderAddress(orderId) {
    const sql = `SELECT DISTINCT deliveryaddress FROM productorder WHERE orderid = $1`;
    const values = [orderId]
    return query(sql, values).then(function (result) {
        const rows = result.rows;
        return rows.map(row => ({ orderAddress: row.deliveryaddress }));
    });
};

// When the sortorderitem page is refreshed, those unassigned created deliveries will be auto deleted
module.exports.deleteDeliveriesNotInItems = function deleteDeliveriesNotInItems() {
    const sql = `
        DELETE FROM delivery
        WHERE deliveryId NOT IN (SELECT deliveryId FROM productorderitem WHERE deliveryId IS NOT NULL)
    `;

    return query(sql).then(function (result) {
        if (result.rowCount === 0) {
            console.log('No matching deliveries found for deletion.');
        }
    });
};

module.exports.getShipperId = function getShipperId(shipperName) {
    const sql = `SELECT shipperid FROM chat WHERE name = $1`;
    const values = [shipperName];
    return query(sql, values).then(function (result) {
        // Assuming you expect only one result, you can directly return the room_Id
        if (result.rows.length > 0) {
            return result.rows[0].shipperid;
        } else {
            // Return null or some indication that the room was not found
            return null;
        }
    });
};

// a) First create a delivery
module.exports.createADelivery = function create(deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid) {

    const sql = `INSERT INTO delivery (deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid, updatedat, updatedatConfirmed) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING deliveryid`;
    console.log("reached0")
    return query(sql, [deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid])
        .then(result => {
            // Check if any rows were affected by the insert
            console.log("reached")
            if (result.rowCount > 0 && result.rows.length > 0) {
                // Return the ID of the created delivery
                return result.rows[0].deliveryid;
            } else {
                // If no rows were affected, something went wrong
                throw new Error('Failed to create delivery. No ID returned.');
            }
        })
        .catch(function (error) {
            if (error.errno === DELIVERY_ERROR_CODE.DUPLICATE_ENTRY) {
                throw new DUPLICATE_ENTRY_ERROR(`Delivery already exists`);
            }
            throw error;
        });
};


// b) Assigning a deliveryid to orderitemid
module.exports.updateProductOrderItemDeliveryId = function updateProductOrderItemDeliveryId(productdetailId, orderId, deliveryId) {
    console.log("UPDATE FUNCTION CALLED");

    // Define the SQL query for updating the deliveryid column
    let sql = `
    UPDATE productorderitem
    SET deliveryid = $1
    WHERE productdetailid = $2 AND orderid = $3
    RETURNING orderid
    `;

    return query(sql, [deliveryId, productdetailId, orderId])
        .then(function (result) {
            const rows = result.rows;

            // If no rows were updated, return null or an appropriate value
            if (rows.length === 0) {
                return null;
            }

            // Return the orderId for reference
            return rows[0].orderid;
        });
};


// c) Lastly, Update order status to 'confirmed'
module.exports.updateOrderStatus = function updateOrderStatus(orderId) {

    // Define the SQL query for updating the order status
    const updateOrderStatusQuery = `
        UPDATE productorder
        SET orderstatus = $1
        WHERE orderid = $2
    `;

    // Set the desired order status
    const confirmedOrderStatus = 'confirmed';

    // Execute the SQL query with the provided parameters
    return query(updateOrderStatusQuery, [confirmedOrderStatus, orderId])
        .then(function (result) {
            // Extract rows from the query result
            const rows = result.rows;

            // If no rows were updated, return null or an appropriate value
            if (rows.length === 0) {
                return null;
            }

            // Return the orderId for reference
            return rows[0].orderid;
        });
};


// Chat System
// -- when leaves the chatroom, set it to false




// OR
// Idea - delivery history - pending - SELECT all, under call to
// check if order exists and payment id exists, if order created - if not - then add create delivery - order first
// payment checked to order
// to create delivery - CHECK 1) Cocurrent check the orderID is in payment table, SAME TIME 2) orderID exists with user 

