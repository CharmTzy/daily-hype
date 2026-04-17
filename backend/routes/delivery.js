const express = require("express");
const router = express.Router();
const userModel = require("../models/users");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR } = require("../errors");
const deliveryController = require("../models/deliveries");
const deliveryController2 = require("../models/deliveriesadmin");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
router.post("/deliveries", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { orderID, userID, deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid } = req.body;
        const [isOrderPaid, isOrderExistsWithUser] = await Promise.all([await deliveryController.checkOrderInPaymentTableAsync(orderID), await deliveryController.checkOrderExistsWithUserAsync(orderID, userID)]);
        if (isOrderPaid && isOrderExistsWithUser) {
            const newDelivery = await deliveryController.createADelivery(deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperid);
            res.status(201).json(newDelivery);
        }
        else {
            res.status(400).json({ error: "Failed to create delivery. Check payment and user information." });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put("/updateDeliveryStatusBatch", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const updatedDeliveries = req.body;
        await deliveryController.checkIfDeliveryInOrderTable(updatedDeliveries);
        await deliveryController.updateDeliveriesBatch(updatedDeliveries);
        res.json({ message: "Deliveries updated successfully" });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get("/categoriesForDelivery", async (req, res) => {
    try {
        const categories = await deliveryController.retrieveAllCurrentProductsCat();
        res.json(categories);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/userRegionsForDelivery", async (req, res) => {
    try {
        const regionUser = await deliveryController.retrieveAllUsersInRegions();
        res.json(regionUser);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/userNameForDelivery", async (req, res) => {
    try {
        const username = await deliveryController.retrieveAllUserNames();
        res.json(username);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/productForDelivery", async (req, res) => {
    try {
        const product = await deliveryController.retrieveAllProducts();
        res.json(product);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/addressForDelivery", async (req, res) => {
    try {
        const address = await deliveryController.retrieveAllAddress();
        res.json(address);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/shipperIdForDelivery", async (req, res) => {
    try {
        const shipperIdList = await deliveryController.retrieveAllShipperID();
        res.json(shipperIdList);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/trackingnumbers", async (req, res) => {
    try {
        const trackingNumbers = await deliveryController.retrieveAllTrackingNumbers();
        res.json(trackingNumbers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/getDeliveriesSortedByStageNumChart0', async (req, res) => {
    try {
        const selectedDropdownValueForm = req.query.selectedDropdownValueForm;
        const choiceNum = req.query.choiceNum;
        const date1 = decodeURIComponent(req.query.date1True);
        const date2 = decodeURIComponent(req.query.date2True);
        const deliveries = await deliveryController.getDeliveriesSortedByStageNum(selectedDropdownValueForm, choiceNum, date1, date2);
        res.json(deliveries);
    }
    catch (error) {
        console.error('Error fetching sorted deliveries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get("/chartJS1", async (req, res) => {
    try {
        const selectedDropdownValueForm = req.query.selectedDropdownValueForm;
        const choiceNum = req.query.choiceNum;
        const date1 = decodeURIComponent(req.query.date1True);
        const date2 = decodeURIComponent(req.query.date2True);
        const chartJS1Array = await deliveryController.retrievechartJS1Array(selectedDropdownValueForm, choiceNum, date1, date2);
        res.json(chartJS1Array);
    }
    catch (error) {
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
        const namesArr = JSON.parse(decodeURIComponent(chartHeaderString));
        const diffHoursSpecific = {};
        for (let i = 0; i < namesArr.length; i++) {
            const name = namesArr[i];
            const deliveryObject = chartJS2Array3Ids[i];
            if (diffHoursSpecific.hasOwnProperty(name)) {
                diffHoursSpecific[name].deliveries.push(deliveryObject);
            }
            else {
                diffHoursSpecific[name] = {
                    deliveries: [deliveryObject],
                };
            }
        }
        const stageintervalSpecific = {};
        for (let i = 0; i < namesArr.length; i++) {
            const name = namesArr[i];
            const deliveryObject = chartJS1Array2Ids[i];
            if (stageintervalSpecific.hasOwnProperty(name)) {
                stageintervalSpecific[name].deliveries.push(deliveryObject);
            }
            else {
                stageintervalSpecific[name] = {
                    deliveries: [deliveryObject],
                };
            }
        }
        const combinedJSON = {
            diffHoursSpecific: diffHoursSpecific,
            stageintervalSpecific: stageintervalSpecific,
        };
        res.json(combinedJSON);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/chartJSPart2", async (req, res) => {
    try {
        const deliveryIdsString = req.query.deliveryIds;
        const chartHeaderString = req.query.chartHeaderString;
        const chartJS1Array2Execute = deliveryController.retrievechartJS2Array(deliveryIdsString, chartHeaderString, false);
        const chartJS2Array3Execute = deliveryController.retrievechartJS3Array(deliveryIdsString, chartHeaderString, false);
        const [chartJS1Array2, chartJS2Array3] = await Promise.all([chartJS1Array2Execute, chartJS2Array3Execute]);
        const namesArr = JSON.parse(decodeURIComponent(chartHeaderString));
        const averagedDiffHours = {};
        for (let i = 0; i < namesArr.length; i++) {
            const name = namesArr[i];
            const diffHours = chartJS1Array2[i].chartHeaderValue;
            if (averagedDiffHours.hasOwnProperty(name)) {
                averagedDiffHours[name].count++;
                averagedDiffHours[name].diff_ab_hours += parseFloat(diffHours.diff_ab_hours);
                averagedDiffHours[name].diff_bc_hours += parseFloat(diffHours.diff_bc_hours);
                averagedDiffHours[name].diff_cd_hours += parseFloat(diffHours.diff_cd_hours);
            }
            else {
                averagedDiffHours[name] = {
                    count: 1,
                    diff_ab_hours: parseFloat(diffHours.diff_ab_hours),
                    diff_bc_hours: parseFloat(diffHours.diff_bc_hours),
                    diff_cd_hours: parseFloat(diffHours.diff_cd_hours),
                };
            }
        }
        Object.keys(averagedDiffHours).forEach((name) => {
            const allZero = averagedDiffHours[name].diff_ab_hours === 0 && averagedDiffHours[name].diff_bc_hours === 0 && averagedDiffHours[name].diff_cd_hours === 0;
            if (!allZero) {
                averagedDiffHours[name].diff_ab_hours /= averagedDiffHours[name].count;
                averagedDiffHours[name].diff_bc_hours /= averagedDiffHours[name].count;
                averagedDiffHours[name].diff_cd_hours /= averagedDiffHours[name].count;
            }
        });
        const averagedDiffHoursArray = Object.entries(averagedDiffHours).map(([name, diffHours]) => ({
            name,
            diff_ab_hours: diffHours.diff_ab_hours,
            diff_bc_hours: diffHours.diff_bc_hours,
            diff_cd_hours: diffHours.diff_cd_hours,
        }));
        const averagedDiffHoursJSON = JSON.stringify(averagedDiffHoursArray);
        const summedLateHours = {};
        for (let i = 0; i < namesArr.length; i++) {
            const name = namesArr[i];
            const lateHours = chartJS2Array3[i].chartHeaderValue;
            if (summedLateHours.hasOwnProperty(name)) {
                summedLateHours[name].hour_difference += parseFloat(lateHours.hour_difference);
            }
            else {
                summedLateHours[name] = {
                    hour_difference: parseFloat(lateHours.hour_difference),
                };
            }
        }
        const summedLateHoursArray = Object.entries(summedLateHours).map(([name, lateHours]) => ({
            name,
            hour_difference: lateHours.hour_difference,
        }));
        const summedLateHoursJSON = JSON.stringify(summedLateHoursArray);
        const combinedJSON = {
            averagedDiffHours: JSON.parse(averagedDiffHoursJSON),
            summedLateHours: JSON.parse(summedLateHoursJSON)
        };
        res.json(combinedJSON);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/Alldeliveries/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        var userid = req.body.id;
        const deliveries = await deliveryController.retrieveAllDeliveriesForUser(userid);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get("/listOfUserIds", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const categories = await deliveryController.retrieveAllUserIds();
        res.json(categories);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/allDeliveriesAllUsers", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    userIDStringEncode = req.query.userIDString;
    userIDStringArr = JSON.parse(decodeURIComponent(userIDStringEncode));
    try {
        const allDeliveries = await Promise.all(userIDStringArr.map(async (userID) => {
            try {
                const deliveriesForUser = await deliveryController.retrieveAllDeliveriesForUser(userID);
                if (deliveriesForUser.length > 0) {
                    return { userId: userID, deliveries: deliveriesForUser };
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.error(`Error retrieving deliveries for user ${userID}:`, error);
                return { userId: userID, error: "Error retrieving deliveries" };
            }
        }));
        res.json(allDeliveries);
    }
    catch (error) {
        console.error("Error retrieving deliveries for all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/addNewMessage", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        var userid = req.body.id;
        const { messagedatetime, msgcontent, roomid, speakerid } = req.body;
        const result = await deliveryController.addNewMessage(messagedatetime, msgcontent, roomid, speakerid, userid);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/getAllMessages/:roomid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        var userid = req.body.id;
        const { roomid } = req.params;
        const [updatedMessages, allMessages] = await Promise.all([
            deliveryController.updateMessageReadStatus(userid, roomid),
            deliveryController.getAllMessagesRoom(roomid)
        ]);
        res.json(allMessages);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/addNewRoom", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { adminUserID, userUserID, deliveryID } = req.body;
        const result = await deliveryController.addNewRoom(adminUserID, userUserID, deliveryID);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/getRoomId", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { userUserID, deliveryID, role } = req.query;
        if (!userUserID || !deliveryID) {
            return res.status(400).json({ error: "Both userUserID and deliveryID are required in the query parameters." });
        }
        var Isadmin = false;
        if (role == "admin") {
            Isadmin = true;
        }
        const roomId = await deliveryController.getRoomId(userUserID, deliveryID, Isadmin);
        if (roomId !== null) {
            res.json({ room_Id: roomId });
        }
        else {
            res.status(404).json({ error: "Room not found for the given userUserID and deliveryID." });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/getCurrentUserId", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        var userid = req.body.id;
        const role = await deliveryController.retrieveuserrole(userid);
        res.json({ userId: userid, userRole: role });
    }
    catch (error) {
        console.error("Error retrieving current userid:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/AlldeliveriesPage/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const userId = req.body.id;
        const { startDate, endDate, startDateOrder, endDateOrder, statusDetail, createdAtSortOrder, deliveryDateSortOrder, limit, offset } = req.query;
        const distinctDeliveryIds = await deliveryController.retrieveDistinctDeliveryIdsWithPagination(userId, startDate || null, endDate || null, startDateOrder || null, endDateOrder || null, statusDetail || null, limit || 10, offset || 0);
        if (distinctDeliveryIds.length === 0) {
            res.status(200).json([]);
            return;
        }
        const deliveries = await deliveryController.retrieveDeliveryDetails(distinctDeliveryIds, createdAtSortOrder || null, deliveryDateSortOrder || null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get("/deliverydetailsArr", async (req, res) => {
    try {
        const { deliveryId } = req.query;
        const deliveryIdArray = deliveryId.split(',').map(Number);
        const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(deliveryIdArray, null, null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get("/deliveries/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const deliveryid = req.params.deliveryid;
        deliveryidArr = [deliveryid];
        const deliveries = await deliveryController.retrieveDeliveryDetails(deliveryidArr, null, null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get('/productOrderDetails/:orderId', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const productOrderDetails = await deliveryController.retrieveProductOrderDetails(orderId);
        if (productOrderDetails.length === 0) {
            return res.status(200).json([]);
        }
        return res.status(200).json(productOrderDetails);
    }
    catch (error) {
        console.error("Error caught:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/shippersForDelivery', async (req, res) => {
    try {
        const shipperList = await deliveryController.retrieveAllShippers();
        res.json(shipperList);
    }
    catch (error) {
        console.error('Error retrieving delivery:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/getDeliveryAddressFromOrder/:orderId', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const deliveryAddress = await deliveryController.retrieveOrderAddress(orderId);
        res.json(deliveryAddress);
    }
    catch (error) {
        console.error('Error retrieving address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/deleteDeliveriesNotInItems', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        await deliveryController.deleteDeliveriesNotInItems();
        res.json({ message: 'Deliveries deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting deliveries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/deliverycreate', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { orderID, deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperId } = req.body;
        const userId = req.body.id;
        const [isOrderPaid, isOrderExistsWithUser] = await Promise.all([
            deliveryController.checkOrderInPaymentTableAsync(orderID),
            deliveryController.checkOrderExistsWithUserAsync(orderID)
        ]);
        if (isOrderPaid && isOrderExistsWithUser) {
            const newDelivery = await deliveryController.createADelivery(deliverydate, deliverystatus, deliverystatusdetail, trackingnumber, shipperId);
            res.status(201).json(newDelivery);
        }
        else {
            res.status(400).json({ error: "Failed to create delivery. Check payment and user information." });
        }
    }
    catch (error) {
        console.error("Error caught:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.put('/updateDelivery', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const productdetailId = req.body.productitemId;
        const deliveryId = req.body.deliveryId;
        const orderId = req.body.orderId;
        const updatedProductDetailId = await deliveryController.updateProductOrderItemDeliveryId(productdetailId, orderId, deliveryId);
        if (updatedProductDetailId !== null) {
            res.status(200).json({ message: 'Delivery ID updated successfully', productdetailid: updatedProductDetailId });
        }
        else {
            res.status(404).json({ message: 'Product detail not found or not updated' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.put('/updateOrderStatusDelivery/:orderid', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const orderId = req.params.orderid;
        const updatedProductDetailId = await deliveryController.updateOrderStatus(orderId);
        if (updatedProductDetailId === null) {
            return res.status(404).json({ error: 'Order not found or status not updated.' });
        }
        return res.status(200).json({ message: 'Order status updated successfully.', orderId: updatedProductDetailId });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/addRoom', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { deliveryid } = req.body;
        var adminuserid = req.body.id;
        const result = await deliveryController2.addRoom(adminuserid, deliveryid);
        const updatedroomid = result.roomid;
        const updateduserid = result.userid;
        const now = new Date();
        const timestampWithoutTimezone = now.toISOString().slice(0, 19).replace('T', ' ');
        const result2 = await deliveryController2.removeduplicatechat(updatedroomid);
        const result3 = await deliveryController.addNewMessage(timestampWithoutTimezone, "Welcome, Thank you for Choosing DailyHype", updatedroomid, adminuserid, updateduserid);
        if (result.success) {
            res.status(200).json({ success: true, room: result.room });
        }
        else {
            res.status(400).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        console.error(`Error in addRoom endpoint: ${error.message}`);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
router.put('/updatechatleavestatus/:roomid', validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const roomId = req.params.roomid;
        const enterOrLeave = req.query.enterorleave === 'true';
        const userId = req.body.id;
        const updatedleavestatusId = await deliveryController.updatechatleavestatus(enterOrLeave, roomId, userId);
        return res.status(200).json({ message: 'Leave status updated successfully.', roomId: updatedleavestatusId });
    }
    catch (error) {
        console.error('Error updating leave status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/getDeliveryIdFromTracking/:trackingid", async (req, res) => {
    try {
        const trackingid = req.params.trackingid;
        const deliveriesIds = await deliveryController2.retrieveDeliveriesByTrackingNumber(trackingid);
        if (deliveriesIds.length === 0) {
            res.status(200).json([]);
            return;
        }
        deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(deliveriesIds, null, null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get("/AlldeliveriesPageAdmin/user/:part", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const userId = req.body.id;
        const { startDate, endDate, startDateOrder, endDateOrder, statusDetail, createdAtSortOrder, deliveryDateSortOrder, limit, offset, chatunread, username, product, userRegion, searchCategory, address, shipper } = req.query;
        if (offset == null) {
            offset = 0;
        }
        const distinctDeliveryIds = await deliveryController2.retrieveFilteredDeliveriesWithMessageReadAdmin(userId, startDate || null, endDate || null, startDateOrder || null, endDateOrder || null, statusDetail || null, limit || 10, offset || 0, chatunread || false, username || null, product || null, userRegion || null, searchCategory || null, address || null, shipper || null);
        if (distinctDeliveryIds.length === 0) {
            res.status(200).json([]);
            return;
        }
        const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(distinctDeliveryIds, createdAtSortOrder || null, deliveryDateSortOrder || null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.get("/AllSingledeliveriesPageAdmin/:deliveryid", async (req, res) => {
    try {
        const userId = req.body.id;
        const deliveryid = req.params.deliveryid;
        distinctDeliveryIds = [deliveryid];
        const deliveries = await deliveryController2.retrieveDeliveryDetailsAdmin(distinctDeliveryIds, null, null);
        res.status(200).json(deliveries);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.put("/updateDeliveryCA2", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { deliveryId, deliveryAddress, deliveryDate, deliveryStatusDetail, deliveryShipper } = req.body;
        await deliveryController2.checkIfSingleDeliveryInOrderTable(deliveryId);
        await deliveryController2.updateDeliveryStatusAndTimestamps(deliveryId, deliveryStatusDetail, deliveryDate);
        await deliveryController2.updateDeliveryShipperAddressAndOrderStatus(deliveryId, deliveryShipper, deliveryAddress);
        res.json({ message: "Deliveries updated successfully" });
    }
    catch (error) {
        console.error("Failed to update deliveries:", error);
        res.status(400).json({ error: error.message });
    }
});
router.put("/bulkInsertDeliveries", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const deliveryArray = req.body;
        const results = await Promise.all(deliveryArray.map(async (delivery) => {
            try {
                await deliveryController2.updateDeliveryStatusAndTimestamps(delivery.deliveryId, delivery.deliveryStatusDetail, delivery.deliveryDate);
                await deliveryController2.updateDeliveryShipperAddressAndOrderStatus(delivery.deliveryId, delivery.deliveryShippers, delivery.deliveryAddress);
                return { message: `Delivery with ID ${delivery.deliveryId} processed successfully` };
            }
            catch (error) {
                console.error(`Processing delivery with ID ${delivery.deliveryId} failed:`, error);
                throw error;
            }
        }));
        res.json({ results });
    }
    catch (error) {
        console.error("Bulk insertion failed:", error);
        res.status(400).json({ error: error.message });
    }
});
router.delete("/deliveriesCA2/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const deliveryid = req.params.deliveryid;
        await deliveryController.deleteMessagesAndRoom(deliveryid);
        await deliveryController.deleteDelivery(deliveryid);
        res.json({ message: "Delivery deleted successfully" });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
router.post("/checkIfOrderCancelled/:deliveryid", async (req, res) => {
    const deliveryId = req.params.deliveryid;
    try {
        await deliveryController.checkOrderCancelledFirst(deliveryId);
        res.status(200).json({ message: `Order is cancelled for Delivery with ID ${deliveryId}` });
    }
    catch (error) {
        if (error instanceof EMPTY_RESULT_ERROR) {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: error.message });
        }
    }
});
router.post("/removeDeliveryIDFromOrder/:deliveryid", validationFn.validateToken, refreshFn.refreshToken, async (req, res) => {
    try {
        const { deliveryid } = req.params;
        const [resultOrder, resultOrderItem] = await Promise.all([
            deliveryController.removeDeliveryIDFromOrder(deliveryid),
            deliveryController.removeDeliveryIDFromOrderItem(deliveryid),
        ]);
        res.json({ resultOrder, resultOrderItem });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;

