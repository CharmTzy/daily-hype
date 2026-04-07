"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

import React, { useState, useEffect, ChangeEvent } from "react";
import DateTime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Card, CardBody, Button } from "@nextui-org/react";

import { useLocation } from "react-router-dom";

//handleDeleteDeliverySequentially

import { handleDeleteDeliverySequentially } from "@/functions/delivadmin-functions";

interface Tracking {
  deliveryid: number;
  trackingnumber: string;
}

interface DeliveryDetail {
  deliveryId: number;
  estimatedDeliveryDate: Date | null;
  deliveryTime: string;
  deliveryAddress: string;
  shipping: {
    carrier: string;
  };
  orderId: number;
  deliveryStatusDetail: string;
  trackingNumber: string;
}

interface Shipper {
  shipId: number;
  name: string;
}

function formatDateWithTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function Page() {
  const currentUrl = window.location.href;
  const regex = /deliveries=([^&]+)/;
  const match = currentUrl.match(regex);
  const deliveryIdsFromRetrieve = match ? match[1].split(",").map(Number) : [];

  console.log("Fetched delivery ids " + deliveryIdsFromRetrieve);

  const [trackingnumbers, setTrackingNumber] = useState<Tracking[]>([]);
  const [filteredTrackingNumbers, setFilteredTrackingNumbers] = useState<
    Tracking[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null
  );

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetail[]>([]);
  const [addedDeliveryIds, setAddedDeliveryIds] = useState<number[]>([]);

  const [shipperOptions, setShipperOptions] = useState<Shipper[]>([]);

  useEffect(() => {
    const currentUrl = window.location.href;
    const regex = /deliveries=([^&]+)/;
    const match = currentUrl.match(regex);
    const deliveryIdsFromRetrieve = match
      ? match[1].split(",").map(Number)
      : [];

    // Fetch data based on the array of delivery IDs
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${
            process.env.BACKEND_URL
          }/api/deliverydetailsArr?deliveryId=${deliveryIdsFromRetrieve.join(
            ","
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDeliveryDetails(data);
          setAddedDeliveryIds(deliveryIdsFromRetrieve);
        } else {
          console.error(
            "Failed to fetch delivery details:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching delivery details:", error);
      }
    };

    if (deliveryIdsFromRetrieve.length != 0) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    // Fetch tracking numbers
    fetch(`${process.env.BACKEND_URL}/api/trackingnumbers`)
      .then((response) => response.json())
      .then((data: Tracking[]) => {
        setTrackingNumber(data);
        setFilteredTrackingNumbers(data);
      })
      .catch((error) =>
        console.error("Error fetching tracking numbers:", error)
      );

    // Fetch shipper options
    fetch(`${process.env.BACKEND_URL}/api/shippersForDelivery`)
      .then((response) => response.json())
      .then((data: Shipper[]) => {
        setShipperOptions(data);
      })
      .catch((error) => console.error("Error fetching shippers:", error));
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    // Filter tracking numbers based on the entered search term
    const filteredNumbers = trackingnumbers.filter((tracking: Tracking) =>
      tracking.trackingnumber.includes(searchTerm)
    );
    setFilteredTrackingNumbers(filteredNumbers);
  };

  const handleRemoveDetail = async (deliveryIdPara: any) => {
    // Filter out the delivery detail with the specified deliveryId
    const updatedDeliveryDetails = deliveryDetails.filter(
      (detail) => detail.deliveryId !== deliveryIdPara
    );

    // Update the state with the updated delivery details
    setDeliveryDetails(updatedDeliveryDetails);

    // Remove the deliveryIdPara from the addedDeliveryIds array
    setAddedDeliveryIds((prevIds) =>
      prevIds.filter((id) => id !== deliveryIdPara)
    );
  };

  const handleDeleteDetail = async (deliveryIdPara: any) => {
    try {
      // Call the function to delete the delivery sequentially
      const deletionSuccessful = await handleDeleteDeliverySequentially(
        deliveryIdPara
      );

      console.log(`Delivery with ID ${deliveryIdPara} successfully.`);

      if (deletionSuccessful) {
        handleRemoveDetail(deliveryIdPara);
        alert("Delete successful");
      }
    } catch (error) {
      console.error(
        `Error deleting delivery with ID ${deliveryIdPara}:`,
        error
      );
      alert("Delete Failed");
    }
  };

  const handleUpdateAllClick = async () => {
    try {
      // Make a copy of the current state to avoid modifying the state directly
      const updatedDeliveryDetails = [...deliveryDetails];

      // Assuming you want to update all delivery details
      const updatedDeliveryDetailsArray = updatedDeliveryDetails.map(
        (detail) => ({
          deliveryId: detail.deliveryId,
          deliveryStatusDetail: detail.deliveryStatusDetail, // Update with the desired new status
          deliveryDate: detail.estimatedDeliveryDate, // Update with the desired new date
          deliveryAddress: detail.deliveryAddress, // Update with the desired new address
          deliveryShippers: detail.shipping.carrier,
        })
      );

      console.log(updatedDeliveryDetailsArray);

      // Make a PUT request to your backend endpoint with the array of updated delivery details
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/bulkInsertDeliveries`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Include any necessary headers, such as authentication tokens
          },
          credentials: "include",
          body: JSON.stringify(updatedDeliveryDetailsArray),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Bulk update successful:", result);
        // Update the local state with the updated delivery details if needed
        setDeliveryDetails(updatedDeliveryDetails);

        alert("Update successful");
      } else {
        console.error("Bulk update failed:", response.status);
        // Handle error scenarios if needed
      }
    } catch (error) {
      console.error("Bulk update failed:", error);
      alert("Update failed");

      // Handle error scenarios if needed
    }
  };

  const handleAddButtonClick = async () => {
    if (selectedDeliveryId) {
      if (addedDeliveryIds.includes(selectedDeliveryId)) {
        alert("This delivery has already been added.");
        return;
      }
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/AllSingledeliveriesPageAdmin/${selectedDeliveryId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const deliveryData: DeliveryDetail[] = await response.json();
          setDeliveryDetails((prevDetails: DeliveryDetail[]) => [
            ...prevDetails,
            ...deliveryData,
          ]);
          setAddedDeliveryIds((prevIds) => [...prevIds, selectedDeliveryId]);
        } else {
          console.error(
            "Failed to fetch delivery details:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching delivery details:", error);
      }
    } else {
      alert("Please select an option");
    }
  };

  const handleUpdateDetails = (
    updatedDetail: Partial<DeliveryDetail>,
    index: number
  ) => {
    setDeliveryDetails((prevDetails: DeliveryDetail[]) => {
      const updatedDetails = [...prevDetails];
      updatedDetails[index] = { ...updatedDetails[index], ...updatedDetail };
      return updatedDetails;
    });
  };

  useEffect(() => {
    console.log("Delivery Details changed:");
    console.log(deliveryDetails);
  }, [deliveryDetails]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-5">
        Delivery Update and Delete
      </h1>
      <div className="flex items flex items-center justify-center min-h-screen flex-wrap">
        <Card className="mr-4">
          <CardBody>
            <div>
              <label htmlFor="trackingSearch">Search Tracking ID:</label>
              <input
                type="text"
                id="trackingSearch"
                value={searchTerm}
                onChange={handleSearchChange}
                className="border p-2"
              />
            </div>

            <div>
              <label htmlFor="trackingDropdown">Select Tracking ID:</label>
              <select
                id="trackingDropdown"
                className="border p-2"
                onChange={(e) => setSelectedDeliveryId(Number(e.target.value))}
              >
                <option>Select Tracking ID</option>
                {filteredTrackingNumbers.map((tracking: Tracking) => (
                  <option key={tracking.deliveryid} value={tracking.deliveryid}>
                    {tracking.trackingnumber}
                  </option>
                ))}
              </select>

              <Button onClick={handleAddButtonClick} className="ml-4">
                Add
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-wrap mt-4">
          {deliveryDetails.map((detail: DeliveryDetail, index: number) => (
            <Card key={detail.deliveryId} className="m-4 max-w-xs">
              <CardBody>
                <h2>Newly Added Delivery Details:</h2>
                <br></br>
                <h2>Delivery ID: {detail.deliveryId}</h2>
                <br></br>
                <h2>Order ID: {detail.orderId}</h2>
                <br></br>
                <p>Tracking No: {detail.trackingNumber}</p>
                <div>
                  <br></br>
                  <label>Delivery Date and Time:</label>
                  <input
                    type="datetime-local"
                    id="deliveryDateTime"
                    className={`form-control w-full ${
                      detail.deliveryTime ? "readonly" : ""
                    }`}
                    value={
                      detail.deliveryTime
                        ? formatDateWithTime(new Date(detail.deliveryTime))
                        : ""
                    }
                    onChange={(e) =>
                      handleUpdateDetails(
                        { deliveryTime: e.target.value },
                        index
                      )
                    }
                  />
                </div>
                <br></br>

                <div>
                  <label>Delivery Address:</label>
                  <input
                    type="text"
                    value={detail.deliveryAddress}
                    onChange={(e) =>
                      handleUpdateDetails(
                        { deliveryAddress: e.target.value },
                        index
                      )
                    }
                    className="border p-2"
                  />
                </div>

                <div>
                  <label>Shipper Carrier:</label>
                  <select
                    value={detail.shipping.carrier}
                    onChange={(e) =>
                      handleUpdateDetails(
                        { shipping: { carrier: e.target.value } },
                        index
                      )
                    }
                    className="border p-2"
                  >
                    {shipperOptions.map((shipper: Shipper) => (
                      <option key={shipper.shipId} value={shipper.name}>
                        {shipper.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Delivery Status Detail:</label>
                  <select
                    value={detail.deliveryStatusDetail}
                    onChange={(e) =>
                      handleUpdateDetails(
                        { deliveryStatusDetail: e.target.value },
                        index
                      )
                    }
                    className="border p-2"
                  >
                    <option value="Order confirmed">Order confirmed</option>
                    <option value="Ready for pickup by company">
                      Ready for pickup by company
                    </option>
                    <option value="On the way">On the way</option>
                    <option value="Product delivered">Product delivered</option>
                  </select>
                </div>

                {/* Add "Remove" and "Delete" buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleDeleteDetail(detail.deliveryId)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete (DB)
                  </button>
                  <button
                    onClick={() => handleRemoveDetail(detail.deliveryId)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Remove (UI)
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleUpdateAllClick}
            className="bg-green-500 text-white p-2 rounded"
          >
            Update All
          </button>
        </div>
      </div>
    </div>
  );
}
