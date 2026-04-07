// Import the necessary modules
"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

require("dotenv").config();

import React from "react";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSearchParams, useRouter } from "next/navigation";
//import DeliveryDetailsModal from './DeliveryDetailsModal'; // Import the new component

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Progress,
  Link,
} from "@nextui-org/react";

import {
  getAllMessages,
  getCurrentUserId,
  updatechatleavestatus,
  getDeliveryDetail,
} from "@/functions/deliv-functions";

import "./Chatroom.css";

interface DeliveryDetails {
  deliveryId: string;
  deliveryStatusDetail: string;
  items: any[];
  // Add other properties as needed
}

const ChatRoomPage = () => {
  const { currentActivePage } = useAppState();

  // State variables
  const [actualCurrentUserId, setUserId] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  const [actualCurrentUserRole, setUserRole] = useState(null);

  // Other variables
  const searchParams = useSearchParams();
  const deliveryDataAll = searchParams.get("data");
  let deliveryId: string | null = null;
  deliveryId = deliveryDataAll;
  const currentUrl = window.location.href;
  const regex = /\/(\d+)\?/;
  const match = currentUrl.match(regex);
  const roomId = match ? match[1] : null;

  useEffect(() => {
    const handleBeforeUnload = async (event: any) => {
      try {
        event.preventDefault();
        event.returnValue = "";

        const currentUrl = window.location.href;
        const regex = /\/(\d+)\?/;
        const match = currentUrl.match(regex);
        const roomId = match ? match[1] : null;

        console.log("Leaving, RoomId is " + roomId);
        await updatechatleavestatus(roomId, false);

        // Now allow the page to unload
        event.returnValue = null;
      } catch (error) {
        console.error("Error during beforeunload:", error);
      }
    };

    const handleUnload = async () => {
      const currentUrl = window.location.href;
      const regex = /\/(\d+)\?/;
      const match = currentUrl.match(regex);
      const roomId = match ? match[1] : null;

      console.log("Unloading, RoomId is " + roomId);
      await updatechatleavestatus(roomId, false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  useEffect(() => {
    const fetchDataDelivery = async () => {
      try {
        const deliveryData = await getDeliveryDetail(deliveryId);

        console.log("Deliveries print all");
        console.log(deliveryData);

        setDeliveryDetails(deliveryData);
      } catch (error) {
        console.error("Error fetching delivery details:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        if (roomId) {
          const messagesData = await getAllMessages(roomId);
          console.log("The messagesData is ", messagesData);
          setMessages(messagesData);
        } else {
          console.log("Room ID not found in the URL yet");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch current user ID
    const fetchUserData = async () => {
      try {
        const fetchedUserIdArr = await getCurrentUserId();
        const fetchedUserId = fetchedUserIdArr[0];
        setUserId(fetchedUserId);
        setUserRole(fetchedUserIdArr[1].rolename);
        console.log("User ID:", fetchedUserId);
        console.log("User Role:", fetchedUserIdArr[1].rolename);

        // Do other things with the user ID or perform actions based on it
      } catch (error) {
        console.error("Error in ChatRoomPage:", error);
        // Handle the error as needed
      }
    };

    // Fetch current user ID
    const updateLeaveStatus = async () => {
      try {
        console.log("Twenty Two: " + roomId);
        const roomIdUpdateLeave = await updatechatleavestatus(roomId, true);
      } catch (error) {
        console.error("Error in ChatRoomPage:", error);
      }
    };

    if (roomId != null) {
      // Concurrent API calls using Promise.all
      Promise.all([
        fetchDataDelivery(),
        fetchMessages(),
        fetchUserData(),
        updateLeaveStatus(),
      ])
        .then(([deliveryData, messagesData, fetchedUserId]) => {
          // Handle the results
          console.log("Delivery Details:", deliveryData);
          console.log("Messages:", messagesData);
          console.log("UserID:", fetchedUserId);
          //console.log('RoomID updated:', roomIdUpdateLeave);
        })
        .catch((error) => {
          // Handle errors
          console.error("Error in concurrent API calls:", error);
        });
    }
  }, [deliveryId, roomId]);

  // WebSocket connection
  //const WS_DOMAIN = "localhost";
  //const WS_PORT = "5001";

  //const NEXT_PUBLIC_APP_BACKEND_URL_SOCKET

  useEffect(() => {
    if (deliveryId) {
      const newSocket = io(
        `${process.env.NEXT_PUBLIC_APP_BACKEND_URL_SOCKET}/chat`,
        {
          transports: ["websocket"],
          query: { deliveryId },
        }
      );
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [deliveryId]);

  // Receive new messages through WebSocket
  useEffect(() => {
    if (socket) {
      socket.on("message", (messageData: any) => {
        console.log("Compare first");
        console.log(messageData.userId + " " + actualCurrentUserId);
        const newMessageData = {
          text: messageData.text,
          messagedatetime: new Date(),
          speakerid: messageData.speakerId, // Assuming userId is the speaker ID
        };

        setMessages((prevMessages) => [...prevMessages, newMessageData]);
      });
    }
  }, [socket]);

  useEffect(() => {
    // This effect will run whenever the messages state changes
    console.log("Messages state has changed:", messages);
  }, [messages]); // The dependency array ensures this effect runs when messages changes

  // Send a new message
  const sendMessage = async () => {
    try {
      if (socket && messageInput.trim() !== "") {
        const dataTime = new Date();
        const newMessageData = {
          text: messageInput,
          messagedatetime: dataTime,
          speakerid: actualCurrentUserId,
        };

        // Update the state locally first
        //setMessages((prevMessages) => [...prevMessages, newMessageData]);

        console.log("testing userid: " + actualCurrentUserId);

        const response = await fetch(
          `${process.env.BACKEND_URL}/api/addNewMessage`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messagedatetime: dataTime,
              msgcontent: messageInput,
              roomid: roomId,
              speakerid: actualCurrentUserId,
            }),
          }
        );

        if (response.ok) {
          console.log("Sending message through socket: " + messageInput);
          socket.emit("message", {
            text: messageInput,
            speakerId: actualCurrentUserId,
          });

          setMessageInput("");
        } else {
          console.error("Error adding message to the database");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Open the delivery details modal
  const openModal = (delivery: any) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  // Calculate progress value based on delivery status detail
  const getProgressValue = (statusDetail: string) => {
    switch (statusDetail) {
      case "Order confirmed":
        return 25;
      case "Ready for pickup by company":
        return 50;
      case "On the way":
        return 75;
      case "Product delivered":
        return 99;
      default:
        return 0; // Default value when status is unknown
    }
  };

  /*Checks*/

  useEffect(() => {
    if (deliveryDetails) {
      console.log("Delivery Details:", deliveryDetails);
      //console.log("Delivery Details Items:", deliveryDetails[0].items);
    }
  }, [deliveryDetails]);

  useEffect(() => {
    console.log("Is Modal Open:", isModalOpen);
  }, [isModalOpen]);

  useEffect(() => {
    console.log("Selected Delivery:", selectedDelivery);
  }, [selectedDelivery]);

  const router = useRouter();

  /*Checks*/

  var backLink2;

  if (actualCurrentUserRole == "admin") {
    backLink2 = (
      <Link className="text-black" href={URL.DeliveryList}>
        🔙 Back to Admin
      </Link>
    );
  } else if (actualCurrentUserRole == "customer") {
    backLink2 = (
      <Link className="text-black" href={URL.Delivery}>
        🔙 Back to User
      </Link>
    );
  } else {
    //alert(actualCurrentUserRole)
  }

  return (
    <div
      className="chatroom-container"
      style={{
        maxWidth: "600px",
        margin: "auto",
        marginTop: "50px",
        overflowY: "auto",
      }}
    >
      <div className="chatroom-header">
        <div className="flex flex-col cursor-default">{backLink2}</div>
        <h1 className="text-slate-800 dark:text-slate-200">
          Chat Room for Delivery #{deliveryId}
        </h1>
        <button onClick={() => openModal(deliveryDetails)}>View Details</button>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Delivery Details
            </ModalHeader>
            <ModalBody>
              {selectedDelivery && (
                <>
                  <h5 className="card-title">
                    Delivery #{selectedDelivery[0].deliveryId}
                  </h5>
                  <p>
                    <strong>Estimated Delivery Date:</strong>{" "}
                    {new Date(selectedDelivery[0].deliveryTime).toDateString()}
                  </p>
                  <p className="card-text">
                    Address: {selectedDelivery[0].deliveryAddress}
                  </p>
                  <p className="card-text">
                    Time:{" "}
                    {new Date(
                      selectedDelivery[0].deliveryTime
                    ).toLocaleTimeString()}
                  </p>
                  <p className="card-text">
                    Status: {selectedDelivery[0].deliveryStatusDetail}
                  </p>
                  <Progress
                    label={`${getProgressValue(
                      selectedDelivery[0].deliveryStatusDetail
                    )}% ${"Progress"}`}
                    value={getProgressValue(
                      selectedDelivery[0].deliveryStatusDetail
                    )}
                    className="max-w-md"
                  />

                  <p className="card-text">
                    Tracking Number: {selectedDelivery[0].trackingNumber}
                  </p>

                  <h6>Items:</h6>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedDelivery[0].items.map(
                      (item: any, index: number) => (
                        <div key={index} className="text-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-w-full h-auto mb-2"
                          />
                          <p className="mb-2">
                            {item.name} x {item.quantity}
                          </p>
                          <p className="mb-2">
                            {item.colour}, {item.size}
                          </p>
                          <p>${item.price}</p>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => setIsModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      <div className="chatroom-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message`}
            style={{
              backgroundColor:
                actualCurrentUserId == message.speakerid
                  ? "lightgreen"
                  : "lightblue",
            }}
          >
            <span className="message-text">{message.text}</span>
            {message.messagedatetime && (
              <span className="message-timestamp relative bottom-0 left-2 text-xs text-gray-500">
                {message.messagedatetime.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="chatroom-input">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoomPage;
