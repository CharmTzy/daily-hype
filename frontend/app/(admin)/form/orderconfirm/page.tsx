"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

// Import necessary components and styles
import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { useRouter } from "next/router";

import {
  getAllOrderItems,
  createDelivery,
  updateDeliveryForOrderItem,
  updateOrderStatusAndCreateChatRoom,
} from "@/functions/deliv-functions"; // Import createDelivery function
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
//import { DatePicker } from '@nextui-org/react';

export default function Page() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryStatusDetail, setDeliveryStatusDetail] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipperItems, setShipperItems] = useState<any[]>([]);
  const [shipperName, setShipperName] = useState("");
  const [orderAddress, setOrderAddress] = useState("");

  var orderID = 0;

  const currentUrl = window.location.href;
  const regex = /orderId=([^&]+)/;
  const match = currentUrl.match(regex);
  const orderIdFromUrl = match ? parseInt(match[1], 10) : null;

  if (orderIdFromUrl != null) {
    orderID = orderIdFromUrl;
    console.log(orderIdFromUrl);
  } else {
    //alert("Order ID not found in the URL");
    orderID = 0;
  }

  const [defaultFirstCreatedDeliveryID, setdefaultFirstCreatedDeliveryID] =
    useState("");

  const [deliveryIDs, setDeliveryIDs] = useState<number[]>([]); // State to store delivery IDs
  const [latestDelivery, setLatestDelivery] = useState<any | null>(null); // State to store the latest delivery information

  //const [selectedDeliveryID, setSelectedDeliveryID] = useState("");

  const [selectedDeliveryIDs, setSelectedDeliveryIDs] = useState<number[]>(
    Array(orderItems.length).fill("")
  );

  const handleDeliveryIDSelection = (index: number, deliveryID: number) => {
    console.log(
      "delivery index is " + index + " and deliveryID is " + deliveryID
    );
    const updatedSelectedDeliveryIDs = [...selectedDeliveryIDs];
    updatedSelectedDeliveryIDs[index] = deliveryID;
    setSelectedDeliveryIDs(updatedSelectedDeliveryIDs);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: successModalOpen,
    onOpen: openSuccessModal,
    onClose: closeSuccessModal,
  } = useDisclosure();

  // Function to generate a random 8-digit number
  function generateRandomTrackingNumber() {
    console.log("shipperItems: " + shipperItems);
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  useEffect(() => {
    // Generate a random tracking number when the modal opens

    setTrackingNumber(generateRandomTrackingNumber());
  }, [isOpen]);

  useEffect(() => {
    // Fetch order items and set them in state
    const fetchOrderItems = async () => {
      /*if (orderID == 0){
        alert("Invalid orderID")
        return;
      }*/
      try {
        const items = await getAllOrderItems(orderID);

        console.log(items);

        setOrderItems(items.orderItems);
        setOrderAddress(items.deliveryAddress[0].orderAddress);
        setShipperItems(items.shippers);

        console.log("orderAddress: " + items.deliveryAddress[0].orderAddress);

        setDeliveryStatusDetail("Order confirmed");
        setShipperName("BLUEDART");
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    };

    fetchOrderItems();
  }, [orderID]);

  const handleCreateDelivery = async () => {
    try {
      if (deliveryDate) {
      } else {
        alert("Please enter a valid date.");
        return;
      }

      // Call the createDelivery function with the necessary parameters
      var matchingObject = shipperItems.find(function (item: any) {
        return item.name == shipperName;
      });

      var shipid = 1; //default to 1
      if (matchingObject) {
        shipid = matchingObject.shipId;
      }

      const newDeliveryId = await createDelivery(
        orderID,
        deliveryDate,
        "UnDelivered",
        deliveryStatusDetail,
        trackingNumber,
        shipid
      );

      console.log("DeliveryId for on creation is: " + newDeliveryId);

      // Close the modal form
      onClose();

      // Open the success modal
      openSuccessModal();

      // Add the created delivery ID to the state
      /* NEW STUFF */
      setDeliveryIDs((prevIDs) => [...prevIDs, newDeliveryId]);

      // Set the latest delivery information

      const newDeliveryObj = {
        deliveryId: newDeliveryId,
        deliveryDate: deliveryDate,
        deliveryStatusDetail: deliveryStatusDetail,
        trackingNumber: trackingNumber,
        shipperName: shipperName,
      };

      // Update the state based on the previous state
      setLatestDelivery((prevDeliveries: any) => {
        // If it's the first time, prevDeliveries might be null or undefined
        // Use an empty array as the initial state

        if (prevDeliveries) {
          return [...prevDeliveries, newDeliveryObj];
        } else {
          setdefaultFirstCreatedDeliveryID(newDeliveryObj.deliveryId);
          //defaultFirstCreatedDeliveryID = newDeliveryObj.deliveryId;
          return [newDeliveryObj];
        }
      });

      // Append the new delivery object to the existing deliveries array
      //setLatestDelivery((prevDeliveries: any) => [...prevDeliveries, newDeliveryObj]);

      //setLatestDelivery(newDeliveryObj);
    } catch (error) {
      console.error("Failed to create delivery:", error);

      alert("Failed to create delivery. Please try again.");
    }
  };

  const handleSendToBackend = async () => {
    try {
      // Iterate through each order item

      if (defaultFirstCreatedDeliveryID) {
      } else {
        alert("Please create a new delivery first and assign them.");
        return;
      }

      for (let index = 0; index < orderItems.length; index++) {
        const orderItem = orderItems[index];

        // Get the relevant details
        const productDetailID = orderItem["productdetailId"];
        const orderID = orderItem["orderId"];

        const FormalselectedDeliveryIDs = [...selectedDeliveryIDs];
        //updatedSelectedDeliveryIDs[index]

        var deliveryID = FormalselectedDeliveryIDs[index]; // Assuming selectedDeliveryIDs is correctly set

        if (deliveryID) {
        } else {
          deliveryID = parseInt(defaultFirstCreatedDeliveryID, 10);
        }

        console.log("deliveryIDs passed to Backend are " + deliveryID);

        const updatedProductDetailID = await updateDeliveryForOrderItem(
          deliveryID,
          orderID,
          productDetailID
        );

        // Log the result (assuming your function returns the updated productdetailid)
        console.log(
          `Product Detail ID updated for order item ${index}: ${updatedProductDetailID}`
        );

        const updatedToConfirmedOrderID = updateOrderStatusAndCreateChatRoom(
          deliveryID,
          orderID
        );
        console.log("updatedToConfirmedOrderID: " + updatedToConfirmedOrderID);
      }

      alert("All order items processed successfully!");

      window.location.href = "../list/order";
    } catch (error) {
      console.error("Error updating delivery for order items:", error);
      // Handle general errors
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Delivery Section</h2>
      {/* Button to open delivery form */}
      <Button onClick={onOpen} className="mb-5">
        Create New Delivery
      </Button>

      {/* Display all deliveries */}
      {latestDelivery && latestDelivery.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestDelivery.map((delivery: any, index: any) => (
            <Card key={index} className="mb-4">
              <CardBody>
                <p>{`Delivery ID: ${delivery.deliveryId}`}</p>
                <p>{`Delivery Date: ${delivery.deliveryDate}`}</p>
                <p>{`Delivery Status Detail: ${delivery.deliveryStatusDetail}`}</p>
                <p>{`Tracking Number: ${delivery.trackingNumber}`}</p>
                <p>{`Shipper Name: ${delivery.shipperName}`}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for delivery form */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New Delivery</ModalHeader>
          <ModalBody>
            {/* Use native HTML datetime-local input */}
            <input
              type="datetime-local"
              id="deliveryDateTime"
              className="form-control"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
            {/* Dropdown for Delivery Status Detail */}
            <select
              id="deliveryStatusDetail"
              className="form-control"
              value={deliveryStatusDetail}
              onChange={(e) => setDeliveryStatusDetail(e.target.value)}
            >
              <option value="Order confirmed">Stage 1: Order confirmed</option>
              <option value="Ready for pickup by company">
                Stage 2: Ready for pickup by company
              </option>
              <option value="On the way">Stage 3: On the way</option>
              <option value="Product Delivered">
                Stage 4: Product Delivered
              </option>
            </select>

            {/* Input for Tracking Number (read-only) */}
            <input
              type="text"
              placeholder="Tracking Number"
              value={"Tracking No.: " + trackingNumber}
              readOnly
            />

            {/* Input for Orderaddress (read-only) */}
            <input
              type="text"
              placeholder="Order Address"
              value={"Delivery Address: " + orderAddress}
              readOnly
            />

            <select
              id="shipperName"
              className="form-control"
              value={shipperName}
              onChange={(e) => setShipperName(e.target.value)}
            >
              {shipperItems.map((stage: any, index: any) => (
                <option key={"shipkey" + index} value={stage.name}>
                  {`Shipper: ${stage.name} `}
                </option>
              ))}
            </select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleCreateDelivery}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={successModalOpen} onClose={closeSuccessModal}>
        <ModalContent>
          <ModalHeader>Success!</ModalHeader>
          <ModalBody>
            <p>Delivery created successfully!</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={closeSuccessModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Render order items as cards */}
      <h2 className="text-2xl font-semibold mb-5 mt-3">Order Items section</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orderItems.map((item, index) => (
          <Card key={index} className="mb-4">
            <CardBody>
              <p>{`Product Detail ID: ${item["productdetailId"]}`}</p>
              <p>{`Order ID: ${item["orderId"]}`}</p>
              <p>{`Product Name: ${item["name"]}`}</p>
              <p>{`Price: $${item["price"]}`}</p>
              <p>{`Size: ${item["size"]}`}</p>
              <p>{`Colour: ${item["colour"]}`}</p>

              {/* ... (existing code) */}
              <label htmlFor={`deliveryDropdown_${index}`}>
                Select Delivery ID:
              </label>
              <select
                id={`deliveryDropdown_${index}`}
                className="form-control"
                value={selectedDeliveryIDs[index]}
                onChange={(e) =>
                  handleDeliveryIDSelection(index, parseInt(e.target.value, 10))
                }
              >
                {deliveryIDs.map((id) => (
                  <option key={id} value={id}>
                    {`Delivery ID: ${id}`}
                  </option>
                ))}
              </select>
            </CardBody>
          </Card>
        ))}
      </div>
      {/* Button to send order item and respective delivery ID to the backend */}
      <Button onClick={handleSendToBackend} key="sendToBackendButton">
        Assign deliveryIds to respective order items and confirm order!
      </Button>
    </div>
  );
}
