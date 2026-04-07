
// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

const express = require("express");

const router = express.Router();

const userModel = require("../models/users");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR } = require("../errors");
const deliveryController = require("../models/deliveries");
const deliveryController2 = require("../models/deliveriesadmin");

const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");

//1) Insert Controllers

router.post("/deliveries", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { orderID, userID, deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid } = req.body;
    console.log("userID is " + userID);

    // Concurrently check if the orderID is in the payment table and orderID exists with the user
    // ** Important
    const [isOrderPaid, isOrderExistsWithUser] = await Promise.all([await deliveryController.checkOrderInPaymentTableAsync(orderID), await deliveryController.checkOrderExistsWithUserAsync(orderID, userID)]);

    console.log("userID2 is " + userID);
    // Proceed with creating the delivery if both checks pass
    if (isOrderPaid && isOrderExistsWithUser) {
      console.log("reached-1");
      const newDelivery = await deliveryController.createADelivery(deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid);
      res.status(201).json(newDelivery);
    } else {
      // Handle the case where one or both checks fail
      res.status(400).json({ error: "Failed to create delivery. Check payment and user information." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//2) Update Controllers

// Update Deliveries in Batch -- Admin - multiple edits
router.put("/updateDeliveryStatusBatch", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const updatedDeliveries = req.body; // An array of { id, newStatus } objects

    // Assuming there is a function in your controller to handle batch updates

    //console.log("1")
    await deliveryController.checkIfDeliveryInOrderTable(updatedDeliveries);
    //console.log("2")
    await deliveryController.updateDeliveriesBatch(updatedDeliveries);
    //console.log("3")

    res.json({ message: "Deliveries updated successfully" });
  } catch (error) {
    console.log("failed");
    res.status(400).json({ error: error.message });
  }
});

//3) Get Controllers

router.get("/categoriesForDelivery", async (req, res) => {
  try {
    const categories = await deliveryController.retrieveAllCurrentProductsCat();
    res.json(categories);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userRegionsForDelivery", async (req, res) => {
  try {
    const regionUser = await deliveryController.retrieveAllUsersInRegions();
    res.json(regionUser);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userNameForDelivery", async (req, res) => {
  try {
    const username = await deliveryController.retrieveAllUserNames();
    res.json(username);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/productForDelivery", async (req, res) => {
  try {
    const product = await deliveryController.retrieveAllProducts();
    res.json(product);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/addressForDelivery", async (req, res) => {
  try {
    const address = await deliveryController.retrieveAllAddress();
    res.json(address);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/shipperIdForDelivery", async (req, res) => {
  try {
    const shipperIdList = await deliveryController.retrieveAllShipperID();
    res.json(shipperIdList);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieve all Tracking Numbers for update
router.get("/trackingnumbers", async (req, res) => {
  try {
    const trackingNumbers = await deliveryController.retrieveAllTrackingNumbers();
    res.json(trackingNumbers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Chart 0 (Number of Deliveries per stage) - Straight Take all Delivery Obj based on filters

router.get('/getDeliveriesSortedByStageNumChart0', async (req, res) => {
  try {
    const selectedDropdownValueForm = req.query.selectedDropdownValueForm;
    console.log("selectedDropdownValueForm" + selectedDropdownValueForm)
    const choiceNum = req.query.choiceNum;
    const date1 = decodeURIComponent(req.query.date1True);
    const date2 = decodeURIComponent(req.query.date2True);

    console.log("GOING TO Chart 0 Result================================================: ")


    const deliveries = await deliveryController.getDeliveriesSortedByStageNum(selectedDropdownValueForm, choiceNum, date1, date2);

    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching sorted deliveries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Aim: Obtain delivery Ids, for all 3 charts based on filter options
router.get("/chartJS1", async (req, res) => {
  try {
    const selectedDropdownValueForm = req.query.selectedDropdownValueForm;

    console.log("selectedDropdownValueForm" + selectedDropdownValueForm)

    const choiceNum = req.query.choiceNum;

    //const date1 = req.query.date1True;
    //const date2 = req.query.date2;

    const date1 = decodeURIComponent(req.query.date1True);
    const date2 = decodeURIComponent(req.query.date2True);


    const chartJS1Array = await deliveryController.retrievechartJS1Array(selectedDropdownValueForm, choiceNum, date1, date2);
    res.json(chartJS1Array);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chartJSPart2Specific", async (req, res) => {
  try {

    const deliveryIdsString = req.query.deliveryIds;
    const chartHeaderString = req.query.chartHeaderString;

    const chartJS1Array2Specific = deliveryController.retrievechartJS2Array(deliveryIdsString, chartHeaderString, true);
    const chartJS2Array3Specific = deliveryController.retrievechartJS3Array(deliveryIdsString, chartHeaderString, true);

    const [chartJS1Array2Ids, chartJS2Array3Ids] = await Promise.all([chartJS1Array2Specific, chartJS2Array3Specific]);

    console.log("Chart1Specifc is " + chartJS1Array2Ids);
    console.log("Chart1Specifc is " + chartJS2Array3Ids);

    const namesArr = JSON.parse(decodeURIComponent(chartHeaderString)); //Basically all the categories names

    const diffHoursSpecific = {};

    // Iterate through the namesArray
    console.log("names length " + namesArr.length);
    for (let i = 0; i < namesArr.length; i++) {
      const name = namesArr[i];
      console.log("reached pre header value name is " + name);
      const deliveryObject = chartJS2Array3Ids[i];

      // Check if the name already exists in the diffHoursSpecific object
      if (diffHoursSpecific.hasOwnProperty(name)) {
        // If the name exists, add the entire delivery object to the array
        diffHoursSpecific[name].deliveries.push(deliveryObject);
      } else {
        // If the name doesn't exist, create a new entry in the diffHoursSpecific object
        diffHoursSpecific[name] = {
          deliveries: [deliveryObject],
        };
      }
    }

    const stageintervalSpecific = {};
    for (let i = 0; i < namesArr.length; i++) {
      const name = namesArr[i];
      console.log("reached pre header value name is " + name);
      const deliveryObject = chartJS1Array2Ids[i];


      // Check if the name already exists in the diffHoursSpecific object
      if (stageintervalSpecific.hasOwnProperty(name)) {
        // If the name exists, add the entire delivery object to the array
        stageintervalSpecific[name].deliveries.push(deliveryObject);
      } else {
        // If the name doesn't exist, create a new entry in the diffHoursSpecific object
        stageintervalSpecific[name] = {
          deliveries: [deliveryObject],
        };
      }
    }

    const combinedJSON = {
      diffHoursSpecific: diffHoursSpecific,
      stageintervalSpecific: stageintervalSpecific,
      //numAtStageCurrent: JSON.parse(numAtStageCurrentJSON)
    };

    console.log("Diffhourspecfic " + JSON.stringify(diffHoursSpecific))
    console.log("stageIntervalSpecific " + JSON.stringify(stageintervalSpecific))


    res.json(combinedJSON);

    //return;

  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chartJSPart2", async (req, res) => {
  try {
    //const deliveryIdsString = decodeURIComponent(req.query.deliveryIds);
    //const chartHeaderString = decodeURIComponent(req.query.chartHeaderString);

    const deliveryIdsString = req.query.deliveryIds;
    const chartHeaderString = req.query.chartHeaderString;

    const chartJS1Array2Execute = deliveryController.retrievechartJS2Array(deliveryIdsString, chartHeaderString, false);
    const chartJS2Array3Execute = deliveryController.retrievechartJS3Array(deliveryIdsString, chartHeaderString, false);

    const [chartJS1Array2, chartJS2Array3] = await Promise.all([chartJS1Array2Execute, chartJS2Array3Execute]);

    const namesArr = JSON.parse(decodeURIComponent(chartHeaderString)); //Basically all the categories names


    console.log("chartJS1Array2 is " + chartJS1Array2)
    console.log("chartJS1Array2 is " + JSON.stringify(chartJS1Array2));

    console.log("chartJS1Array3 is " + chartJS2Array3)
    console.log("chartJS1Array3 is " + JSON.stringify(chartJS2Array3));


    console.log("nameArr is" + namesArr);

    const averagedDiffHours = {};

    console.log("Array 2 Print: ");
    console.log(chartJS1Array2);

    // Iterate through the namesArray
    console.log("names length " + namesArr.length);
    for (let i = 0; i < namesArr.length; i++) {
      const name = namesArr[i];
      console.log("reached pre header value name is " + name);
      const diffHours = chartJS1Array2[i].chartHeaderValue;

      // Check if the name already exists in the averagedDiffHours object
      if (averagedDiffHours.hasOwnProperty(name)) {
        // If the name exists, increment the count and update the running total
        averagedDiffHours[name].count++;
        averagedDiffHours[name].diff_ab_hours += parseFloat(diffHours.diff_ab_hours);
        averagedDiffHours[name].diff_bc_hours += parseFloat(diffHours.diff_bc_hours);
        averagedDiffHours[name].diff_cd_hours += parseFloat(diffHours.diff_cd_hours);
      } else {
        // If the name doesn't exist, create a new entry in the averagedDiffHours object
        averagedDiffHours[name] = {
          count: 1,
          diff_ab_hours: parseFloat(diffHours.diff_ab_hours),
          diff_bc_hours: parseFloat(diffHours.diff_bc_hours),
          diff_cd_hours: parseFloat(diffHours.diff_cd_hours),
        };
      }
    }

    // Calculate averages for each category
    Object.keys(averagedDiffHours).forEach((name) => {
      // Check if all diff_hours values are 0 for the name
      const allZero = averagedDiffHours[name].diff_ab_hours === 0 && averagedDiffHours[name].diff_bc_hours === 0 && averagedDiffHours[name].diff_cd_hours === 0;

      // If all values are 0, skip this name from the average calculation
      if (!allZero) {
        averagedDiffHours[name].diff_ab_hours /= averagedDiffHours[name].count;
        averagedDiffHours[name].diff_bc_hours /= averagedDiffHours[name].count;
        averagedDiffHours[name].diff_cd_hours /= averagedDiffHours[name].count;
      }
    });

    // Convert the averagedDiffHours object into an array of objects with averages
    const averagedDiffHoursArray = Object.entries(averagedDiffHours).map(([name, diffHours]) => ({
      name,
      diff_ab_hours: diffHours.diff_ab_hours,
      diff_bc_hours: diffHours.diff_bc_hours,
      diff_cd_hours: diffHours.diff_cd_hours,
    }));

    const averagedDiffHoursJSON = JSON.stringify(averagedDiffHoursArray);

    console.log(averagedDiffHoursJSON);

    const summedLateHours = {};
    console.log("Array 3 Print: ");
    console.log(chartJS2Array3);

    console.log("names length " + namesArr.length);
    for (let i = 0; i < namesArr.length; i++) {
      const name = namesArr[i];
      console.log("reached pre header value is " + name);
      const lateHours = chartJS2Array3[i].chartHeaderValue;

      // Check if the name already exists in the summedLateHours object
      if (summedLateHours.hasOwnProperty(name)) {
        // If the name exists, update the running total
        summedLateHours[name].hour_difference += parseFloat(lateHours.hour_difference);
      } else {
        // If the name doesn't exist, create a new entry in the summedLateHours object
        summedLateHours[name] = {
          hour_difference: parseFloat(lateHours.hour_difference),
        };
      }
    }

    // Convert the summedLateHours object into an array of objects with sums
    const summedLateHoursArray = Object.entries(summedLateHours).map(([name, lateHours]) => ({
      name,
      hour_difference: lateHours.hour_difference,
    }));

    // Convert the summedLateHoursArray to JSON
    const summedLateHoursJSON = JSON.stringify(summedLateHoursArray);

    // Output the resulting JSON object
    console.log(summedLateHoursJSON);

    const combinedJSON = {
      averagedDiffHours: JSON.parse(averagedDiffHoursJSON),
      summedLateHours: JSON.parse(summedLateHoursJSON)
    };

    res.json(combinedJSON);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Retrieve all deliveries for a user
router.get("/Alldeliveries/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    console.log("hello");
    var userid = req.body.id;

    const deliveries = await deliveryController.retrieveAllDeliveriesForUser(userid);
    res.status(200).json(deliveries);
  } catch (error) {
    console.log("Error caught: " + error.message);
    res.status(404).json({ error: error.message });
  }
});

router.get("/listOfUserIds", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const categories = await deliveryController.retrieveAllUserIds();
    res.json(categories);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/*Line 311*/ router.get("/allDeliveriesAllUsers", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  userIDStringEncode = req.query.userIDString;
  userIDStringArr = JSON.parse(decodeURIComponent(userIDStringEncode));

  console.log("Array of userIds is " + userIDStringArr);

  try {
    // Use Promise.all to concurrently retrieve deliveries for all users
    const allDeliveries = await Promise.all(
      userIDStringArr.map(async (userID) => {
        try {
          const deliveriesForUser = await deliveryController.retrieveAllDeliveriesForUser(userID);
          // Check if deliveriesForUser is not empty before adding to the result
          if (deliveriesForUser.length > 0) {
            return { userId: userID, deliveries: deliveriesForUser };
          } else {
            console.log(`No deliveries found for user ${userID}`);
            return null; // Skip this record
          }
        } catch (error) {
          console.error(`Error retrieving deliveries for user ${userID}:`, error);

          return { userId: userID, error: "Error retrieving deliveries" };
        }
      })
    );

    res.json(allDeliveries);
  } catch (error) {
    console.error("Error retrieving deliveries for all users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// CA2 New Endpoints ===================================================================================================================
// validationFn.validateToken, refreshFn.refreshToken, 
// Endpoint to add a new message

router.post("/addNewMessage", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    var userid = req.body.id;

    const { messagedatetime, msgcontent, roomid, speakerid } = req.body;

    const result = await deliveryController.addNewMessage(messagedatetime, msgcontent, roomid, speakerid, userid);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get all messages for a specific roomid
router.get("/getAllMessages/:roomid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    var userid = req.body.id;

    const { roomid } = req.params;

    // Call the function to update message read status and get all messages concurrently
    const [updatedMessages, allMessages] = await Promise.all([
      deliveryController.updateMessageReadStatus(userid, roomid), // replace 'userId' with the actual user ID
      deliveryController.getAllMessagesRoom(roomid)
    ]);

    console.log("UPDATED MESSAGES");
    console.log(updatedMessages);

    console.log("ALL MESSAGES");
    console.log(allMessages);

    res.json(allMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to add a new CHAT room
router.post("/addNewRoom", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { adminUserID, userUserID, deliveryID } = req.body;
    const result = await deliveryController.addNewRoom(adminUserID, userUserID, deliveryID);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// validationFn.validateToken,
// Endpoint to get room_Id based on userUserID and deliveryID
router.get("/getRoomId", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {

    const { userUserID, deliveryID, role } = req.query;

    // Validate that both userUserID and deliveryID are present in the query parameters
    if (!userUserID || !deliveryID) {
      return res.status(400).json({ error: "Both userUserID and deliveryID are required in the query parameters." });
    }

    var Isadmin = false

    if (role == "admin") {
      Isadmin = true
    }

    const roomId = await deliveryController.getRoomId(userUserID, deliveryID, Isadmin);

    if (roomId !== null) {
      res.json({ room_Id: roomId });
    } else {
      res.status(404).json({ error: "Room not found for the given userUserID and deliveryID." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current userid

router.get("/getCurrentUserId", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    var userid = req.body.id;
    //var userid = 52;
    const role = await deliveryController.retrieveuserrole(userid);
    console.log("Role is " + role + "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
    res.json({ userId: userid, userRole: role });
  } catch (error) {
    console.error("Error retrieving current userid:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Express route to retrieve all deliveries for a user with pagination //validationFn.validateToken, refreshFn.refreshToken
router.get("/AlldeliveriesPage/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const userId = req.body.id; // Assuming user ID is in the request body, adjust accordingly
    //const userId = 52;
    const { startDate, endDate, startDateOrder, endDateOrder, statusDetail, createdAtSortOrder, deliveryDateSortOrder, limit, offset } = req.query;

    // Retrieve distinct delivery ids with pagination
    const distinctDeliveryIds = await deliveryController.retrieveDistinctDeliveryIdsWithPagination(
      userId,
      startDate || null, // Pass null if not provided
      endDate || null, // Pass null if not provided
      startDateOrder || null,
      endDateOrder || null,
      statusDetail || null, // Pass null if not provided
      limit || 10, // Default limit to 10 if not provided
      offset || 0 // Default offset to 0 if not provided
    );

    // If no distinct delivery ids found, return an empty array
    if (distinctDeliveryIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Retrieve delivery details for the distinct delivery ids with pagination
    const deliveries = await deliveryController.retrieveDeliveryDetails(distinctDeliveryIds, createdAtSortOrder || null, deliveryDateSortOrder || null);

    console.log("BACKEND DELIVERIES");
    console.log(deliveries);

    res.status(200).json(deliveries);
  } catch (error) {
    console.log("Error caught: " + error.message);
    res.status(404).json({ error: error.message });
  }
});


router.get("/deliverydetailsArr", async (req, res) => {
  try {
    const { deliveryId } = req.query;

    // Parse deliveryId into an array of numbers
    const deliveryIdArray = deliveryId.split(',').map(Number);

    console.log("Delivery id array retrieved: " + deliveryIdArray);

    // Assuming deliveryController.retrieveDeliveryDetails expects a numeric ID
    const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(deliveryIdArray, null, null);

    res.status(200).json(deliveries);

  } catch (error) {
    console.log("Error caught: " + error.message);
    res.status(404).json({ error: error.message });
  }
});

router.get("/deliveries/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const deliveryid = req.params.deliveryid;
    deliveryidArr = [deliveryid]
    const deliveries = await deliveryController.retrieveDeliveryDetails(deliveryidArr, null, null);
    console.log(deliveries)
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});



// Flow of operation for the delivery addition

// 1) Retrieve all order details based on orderitemid

// Express route to retrieve product order details by order ID
router.get('/productOrderDetails/:orderId', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Retrieve product order details for the specified order ID
    const productOrderDetails = await deliveryController.retrieveProductOrderDetails(orderId);

    // If no product order details found, return an empty array
    if (productOrderDetails.length === 0) {
      return res.status(200).json([]);
    }

    // Send the product order details in the response
    return res.status(200).json(productOrderDetails);
  } catch (error) {
    console.error("Error caught:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// IMPORTANT ====================================================================================

router.get('/shippersForDelivery', async (req, res) => {
  try {
    const shipperList = await deliveryController.retrieveAllShippers();
    res.json(shipperList);
  } catch (error) {
    console.error('Error retrieving delivery:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getDeliveryAddressFromOrder/:orderId', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deliveryAddress = await deliveryController.retrieveOrderAddress(orderId);
    res.json(deliveryAddress);
  } catch (error) {
    console.error('Error retrieving address:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/deleteDeliveriesNotInItems', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    await deliveryController.deleteDeliveriesNotInItems();
    res.json({ message: 'Deliveries deleted successfully.' });
  } catch (error) {
    console.error('Error deleting deliveries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2) Create new delivery

// Express route to create a delivery
router.post('/deliverycreate', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { orderID, deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperId } = req.body;

    const userId = req.body.id;
    console.log("userID is " + userId);
    console.log("orderID is " + orderID);

    // Get shipperId based on shipperName
    //const shipperId = await deliveryController.getShipperId(shipperName);

    // Concurrently check if the orderID is in the payment table and orderID exists with the user
    // ** Important
    //, isOrderExistsWithUser
    const [isOrderPaid, isOrderExistsWithUser] = await Promise.all([
      deliveryController.checkOrderInPaymentTableAsync(orderID),
      deliveryController.checkOrderExistsWithUserAsync(orderID)
    ]);


    if (isOrderPaid && isOrderExistsWithUser) {
      console.log("reached-1");

      console.log("deliverystatusdetail is " + deliverystatusdetail)

      // Create a new delivery
      const newDelivery = await deliveryController.createADelivery(
        deliverydate,
        deliverystatus,
        deliverystatusdetail,
        trackingnumber,
        shipperId  // Use the obtained shipperId
      );

      // Send the created delivery in the response
      res.status(201).json(newDelivery);
    } else {
      // Handle the case where one or both checks fail
      res.status(400).json({ error: "Failed to create delivery. Check payment and user information." });
    }
  } catch (error) {
    console.error("Error caught:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3) Assign a deliveryid to orderitemid

router.put('/updateDelivery', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const productdetailId = req.body.productitemId;
    const deliveryId = req.body.deliveryId; // Assuming you send deliveryId in the request body
    const orderId = req.body.orderId;


    // Call the model function to update deliveryid
    const updatedProductDetailId = await deliveryController.updateProductOrderItemDeliveryId(productdetailId, orderId, deliveryId);

    if (updatedProductDetailId !== null) {
      // The update was successful
      res.status(200).json({ message: 'Delivery ID updated successfully', productdetailid: updatedProductDetailId });
    } else {
      // No rows were updated
      res.status(404).json({ message: 'Product detail not found or not updated' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Make order 

router.put('/updateOrderStatusDelivery/:orderid', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const orderId = req.params.orderid;

    // Call the updateOrderStatus function with the orderId and productDetailId
    const updatedProductDetailId = await deliveryController.updateOrderStatus(orderId);

    if (updatedProductDetailId === null) {
      // Handle the case where no rows were updated (order not found, for example)
      return res.status(404).json({ error: 'Order not found or status not updated.' });
    }

    // Respond with a success message or any additional information needed
    return res.status(200).json({ message: 'Order status updated successfully.', orderId: updatedProductDetailId });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/addRoom', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { deliveryid } = req.body;
    var adminuserid = req.body.id;

    console.log("adding room where adminuserid " + adminuserid + " and delivery id is " + deliveryid)

    const result = await deliveryController2.addRoom(adminuserid, deliveryid);
    const updatedroomid = result.roomid;
    const updateduserid = result.userid;

    const now = new Date();
    const timestampWithoutTimezone = now.toISOString().slice(0, 19).replace('T', ' ');

    console.log("Timestamp is " + timestampWithoutTimezone + " roomid is " + updatedroomid + " userid is " + updateduserid);

    const result2 = await deliveryController2.removeduplicatechat(updatedroomid);
    const result3 = await deliveryController.addNewMessage(timestampWithoutTimezone, "Welcome, Thank you for Choosing DailyHype", updatedroomid, adminuserid, updateduserid);

    console.log("Executed")

    console.log()
    if (result.success) {
      res.status(200).json({ success: true, room: result.room });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error(`Error in addRoom endpoint: ${error.message}`);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



router.put('/updatechatleavestatus/:roomid', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const roomId = req.params.roomid;

    const enterOrLeave = req.query.enterorleave === 'true'; // Convert the string to a boolean

    const userId = req.body.id;
    //const userId = 54;

    // Call the updateOrderStatus function with the orderId and productDetailId
    const updatedleavestatusId = await deliveryController.updatechatleavestatus(enterOrLeave, roomId, userId);


    return res.status(200).json({ message: 'Leave status updated successfully.', roomId: updatedleavestatusId });
  } catch (error) {


    console.error('Error updating leave status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Admin Functions

router.get("/getDeliveryIdFromTracking/:trackingid", async (req, res) => {
  try {
    const trackingid = req.params.trackingid;

    const deliveriesIds = await deliveryController2.retrieveDeliveriesByTrackingNumber(trackingid);

    console.log(deliveriesIds)

    // If no distinct delivery ids found, return an empty array
    if (deliveriesIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Retrieve delivery details for the distinct delivery ids with pagination
    deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(deliveriesIds, null, null);

    //const delivery = await deliveryController.retrieveDeliveryDetailsById(deliveryid);
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


// Express route to retrieve all deliveries for a user with pagination //validationFn.validateToken, refreshFn.refreshToken
router.get("/AlldeliveriesPageAdmin/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const userId = req.body.id; // Assuming user ID is in the request body, adjust accordingly
    //const userId = 52;
    const { startDate, endDate, startDateOrder, endDateOrder, statusDetail, createdAtSortOrder, deliveryDateSortOrder, limit, offset, chatunread, username, product, userRegion, searchCategory, address, shipper } = req.query;

    if (offset == null) {
      offset = 0
    }

    // Retrieve distinct delivery ids with pagination
    const distinctDeliveryIds = await deliveryController2.retrieveFilteredDeliveriesWithMessageReadAdmin(
      userId,
      startDate || null, // Pass null if not provided
      endDate || null, // Pass null if not provided
      startDateOrder || null,
      endDateOrder || null,
      statusDetail || null, // Pass null if not provided
      limit || 10, // Default limit to 10 if not provided
      offset || 0, // Default offset to 0 if not provided
      chatunread || false,
      username || null,
      product || null,
      userRegion || null,
      searchCategory || null,
      address || null,
      shipper || null
      //note this is shipperName not ID
    );

    // If no distinct delivery ids found, return an empty array
    if (distinctDeliveryIds.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Retrieve delivery details for the distinct delivery ids with pagination
    const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(distinctDeliveryIds, createdAtSortOrder || null, deliveryDateSortOrder || null);

    console.log("BACKEND DELIVERIES ADMIN");
    console.log(deliveries);

    res.status(200).json(deliveries);
  } catch (error) {
    console.log("Error caught: " + error.message);
    res.status(404).json({ error: error.message });
  }
});

// Express route to retrieve all deliveries for a user with pagination //validationFn.validateToken, refreshFn.refreshToken
router.get("/AllSingledeliveriesPageAdmin/:deliveryid", async (req, res) => {
  try {
    const userId = req.body.id; // Assuming user ID is in the request body, adjust accordingly



    const deliveryid = req.params.deliveryid

    distinctDeliveryIds = [deliveryid]

    // Retrieve delivery details for the distinct delivery ids with pagination
    const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(distinctDeliveryIds, null, null);

    console.log("BACKEND DELIVERIES ADMIN");
    console.log(deliveries);

    res.status(200).json(deliveries);
  } catch (error) {
    console.log("Error caught: " + error.message);
    res.status(404).json({ error: error.message });
  }
});




// Update
// Update Deliveries in Single -- Single edits
router.put("/updateDeliveryCA2", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { deliveryId, deliveryAddress, deliveryDate, deliveryStatusDetail, deliveryShipper } = req.body;

    // Check if delivery exists in the order table
    await deliveryController2.checkIfSingleDeliveryInOrderTable(deliveryId);

    // Update delivery status and timestamps (Model 1)
    await deliveryController2.updateDeliveryStatusAndTimestamps(
      deliveryId,
      deliveryStatusDetail,
      deliveryDate
    );

    // Update delivery shipper, address, and order status (Model 2)
    await deliveryController2.updateDeliveryShipperAddressAndOrderStatus(
      deliveryId,
      deliveryShipper,
      deliveryAddress
    );

    res.json({ message: "Deliveries updated successfully" });
  } catch (error) {
    console.error("Failed to update deliveries:", error);
    res.status(400).json({ error: error.message });
  }
});



// Update Deliveries in Batch -- Admin - multiple edits

router.put("/bulkInsertDeliveries", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    // Assuming req.body is an array of delivery objects
    const deliveryArray = req.body;

    // Validate or process the deliveryArray as needed

    // Perform bulk insertion or update operations
    const results = await Promise.all(deliveryArray.map(async (delivery) => {
      // Your logic for bulk insertion or update for each delivery object
      try {
        // Execute Model 1: Update Delivery Status and Timestamps
        await deliveryController2.updateDeliveryStatusAndTimestamps(
          delivery.deliveryId,
          delivery.deliveryStatusDetail,
          delivery.deliveryDate
        );

        // Execute Model 2: Update Delivery Shipper, Address, and Order Status
        await deliveryController2.updateDeliveryShipperAddressAndOrderStatus(
          delivery.deliveryId,
          delivery.deliveryShippers,
          delivery.deliveryAddress
        );

        return { message: `Delivery with ID ${delivery.deliveryId} processed successfully` };
      } catch (error) {
        console.error(`Processing delivery with ID ${delivery.deliveryId} failed:`, error);
        throw error; // Propagate the error to Promise.all catch block
      }
    }));

    res.json({ results });
  } catch (error) {
    console.error("Bulk insertion failed:", error);
    res.status(400).json({ error: error.message });
  }
});



// Delete


// Delete a Delivery by ID
router.delete("/deliveriesCA2/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const deliveryid = req.params.deliveryid;

    await deliveryController.deleteMessagesAndRoom(deliveryid);
    await deliveryController.deleteDelivery(deliveryid);

    console.log("Delete success");

    res.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/checkIfOrderCancelled/:deliveryid", async (req, res) => {
  const deliveryId = req.params.deliveryid;

  console.log("reached");
  try {
    await deliveryController.checkOrderCancelledFirst(deliveryId);

    console.log("order checked to be cancalled");
    res.status(200).json({ message: `Order is cancelled for Delivery with ID ${deliveryId}` });
  } catch (error) {
    if (error instanceof EMPTY_RESULT_ERROR) {
      console.log("Error 404 reached")
      res.status(404).json({ error: error.message });
    } else {
      console.log("Error 500 reached")
      res.status(500).json({ error: error.message });
    }
  }
});

router.post("/removeDeliveryIDFromOrder/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
  try {
    const { deliveryid } = req.params;

    // Use Promise.all to run the removal operations in parallel
    const [resultOrder, resultOrderItem] = await Promise.all([
      deliveryController.removeDeliveryIDFromOrder(deliveryid),
      deliveryController.removeDeliveryIDFromOrderItem(deliveryid),
    ]);

    console.log("DeliveryID removed from order and order item");
    res.json({ resultOrder, resultOrderItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







module.exports = router;
