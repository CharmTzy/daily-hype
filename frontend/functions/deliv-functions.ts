export async function getDeliveryDetail(deliveryId: any) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/deliveries/${deliveryId}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching delivery details:", error);
        throw error;
    }
}
export async function getAllMessages(roomID: any) {
    console.log("Current roomID is " + roomID);
    const response = await fetch(`${process.env.BACKEND_URL}/api/getAllMessages/${roomID}`, {
        method: "GET",
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch messages. Status: ${response.status}`);
    }
    const data = await response.json();
    const messagesData = data
        .map((message: any) => ({
        text: message.msgcontent,
        messagedatetime: new Date(message.messagedatetime),
        speakerid: message.speakerid,
    }))
        .sort((a: any, b: any) => a.messagedatetime - b.messagedatetime);
    return messagesData;
}
export async function getAllDeliveries(userId: any, filterOptions: any) {
    try {
        const { startDate, endDate, startOrderDate, endOrderDate, statusDetail, createdAtSortOrder, deliveryDateSortOrder, limit, offset, } = filterOptions;
        const queryString = new URLSearchParams({
            startDate: startDate || "",
            endDate: endDate || "",
            startDateOrder: startOrderDate || "",
            endDateOrder: endOrderDate || "",
            statusDetail: statusDetail || "",
            createdAtSortOrder: createdAtSortOrder || "",
            deliveryDateSortOrder: deliveryDateSortOrder || "",
            limit: limit || 10,
            offset: offset || 0,
        }).toString();
        const response = await fetch(`${process.env.BACKEND_URL}/api/AlldeliveriesPage/user/${userId}?${queryString}`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch deliveries. Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        throw error;
    }
}
export async function getAllDeliveriesCount(userId: any, filterOptions: any) {
    try {
        const { startDate, endDate, startOrderDate, endOrderDate, statusDetail } = filterOptions;
        const queryString = new URLSearchParams({
            startDate: startDate || "",
            endDate: endDate || "",
            startDateOrder: startOrderDate || "",
            endDateOrder: endOrderDate || "",
            statusDetail: statusDetail || "",
        }).toString();
        const response = await fetch(`${process.env.BACKEND_URL}/api/AlldeliveriesPage/user/${userId}/count?${queryString}`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch delivery count. Status: ${response.status}`);
        }
        const data = await response.json();
        return Number(data.count || 0);
    }
    catch (error) {
        throw error;
    }
}
export async function getCurrentUserId() {
    try {
        const responseUserId = await fetch(`${process.env.BACKEND_URL}/api/getCurrentUserId/`, {
            method: "GET",
            credentials: "include",
        });
        if (!responseUserId.ok) {
            throw new Error(`Failed to fetch current user id. Status: ${responseUserId.status}`);
        }
        const currentUserIdData = await responseUserId.json();
        console.log("hello");
        console.log(currentUserIdData);
        const actualCurrentUserId = currentUserIdData.userId;
        const actualCurrentUserRole = currentUserIdData.userRole;
        console.log(actualCurrentUserId);
        return [actualCurrentUserId, actualCurrentUserRole];
    }
    catch (error) {
        console.error("Error fetching current user id:");
        throw error;
    }
}
export async function getAllOrderItems(orderID: any) {
    try {
        const [orderItems, shippers, deliveryAddress] = await Promise.all([
            fetch(`${process.env.BACKEND_URL}/api/productOrderDetails/${orderID}`, {
                method: "GET",
                credentials: "include",
            }).then((response) => response.json()),
            fetch(`${process.env.BACKEND_URL}/api/shippersForDelivery`, {
                method: "GET",
                credentials: "include",
            }).then((response) => response.json()),
            fetch(`${process.env.BACKEND_URL}/api/getDeliveryAddressFromOrder/${orderID}`, {
                method: "GET",
                credentials: "include",
            }).then((response) => response.json()),
            fetch(`${process.env.BACKEND_URL}/api/deleteDeliveriesNotInItems`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.ok
                ? response.json()
                : Promise.reject(`HTTP error! Status: ${response.status}`))
                .then((data) => console.log("Success:", data))
                .catch((error) => console.error("Error:", error)),
        ]);
        return {
            orderItems,
            shippers,
            deliveryAddress,
        };
    }
    catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to fetch all order details");
    }
}
export async function createDelivery(orderID: any, deliverydate: any, deliverystatus: any, deliverystatusdetail: any, trackingnumber: any, shipperId: any) {
    try {
        const createDeliveryResponse = await fetch(`${process.env.BACKEND_URL}/api/deliverycreate`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                orderID,
                deliverydate,
                deliverystatus,
                deliverystatusdetail,
                trackingnumber,
                shipperId,
            }),
        });
        if (!createDeliveryResponse.ok) {
            throw new Error(`Failed to create delivery. Status: ${createDeliveryResponse.status}`);
        }
        const newDelivery = await createDeliveryResponse.json();
        return newDelivery;
    }
    catch (error) {
        throw new Error("Failed to create delivery.");
    }
}
export async function updateDeliveryForOrderItem(deliveryId: any, orderID: any, productitemID: any) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/updateDelivery`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                deliveryId: deliveryId,
                orderId: orderID,
                productitemId: productitemID,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.message);
        return data.productdetailid;
    }
    catch (error) {
        throw new Error("Failed to assign deliveryid");
    }
}
export async function updateOrderStatusAndCreateChatRoom(deliveryId: any, orderId: any) {
    try {
        const updateOrderStatusEndpoint = `${process.env.BACKEND_URL}/api/updateOrderStatusDelivery/${orderId}`;
        const addRoomEndpoint = `${process.env.BACKEND_URL}/api/addRoom`;
        const [updatedOrderId, roomResult] = await Promise.all([
            (async () => {
                const response = await fetch(updateOrderStatusEndpoint, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                return data.orderId;
            })(),
            (async () => {
                const response = await fetch(addRoomEndpoint, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ deliveryid: deliveryId }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return await response.json();
            })(),
        ]);
        console.log("Order status updated successfully:", updatedOrderId);
        console.log("Chat room added successfully:", roomResult);
        return { updatedOrderId, roomResult };
    }
    catch (error: any) {
        console.error("Error updating order status and creating chat room:", error.message);
        throw new Error("Failed to update order status and create chat room");
    }
}
export async function updatechatleavestatus(roomId: any, enterorleave: boolean) {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/updatechatleavestatus/${roomId}?enterorleave=${enterorleave}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.message);
        return data.roomId;
    }
    catch (error) {
        throw new Error("Failed to update chat leave status");
    }
}

