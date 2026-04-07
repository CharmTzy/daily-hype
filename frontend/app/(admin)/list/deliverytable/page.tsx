// App.js
"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MapComponent from "./viewlocation/mapcomponent";

require("dotenv").config();

//import DatePicker from 'react-datepicker'; // Replace 'your-date-picker-library' with the actual library you are using

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Progress,
} from "@nextui-org/react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Link,
} from "@nextui-org/react";

import { Pagination } from "@nextui-org/react";

import { Card, CardBody } from "@nextui-org/react";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
//import { useRouter } from "next/router";

import {
  getAllDeliveries,
  getCurrentUserId,
  updatechatleavestatus,
} from "@/functions/deliv-functions";

import {
  getAllDeliveriesAdmin,
  handleDeleteDeliverySequentially,
  updateSingleDeliveryCA2,
} from "@/functions/delivadmin-functions";

interface Category {
  categoryid: number;
  categoryname: string;
}

interface Shipper {
  shipId: number;
  name: string;
}

interface LocState {
  deliveryAddress: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  weatherData: any; // Adjust the type according to your weather data structure
}

const initialLocState: LocState = {
  deliveryAddress: "",
  postalCode: "",
  latitude: null,
  longitude: null,
  weatherData: null,
};

export default function Page() {
  const router = useRouter();

  const { setCurrentActivePage } = useAppState();

  const [actualCurrentUserId, setUserId] = useState(null);
  const [userrole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUserId = await getCurrentUserId();
        setUserId(fetchedUserId[0]);
        console.log("User ID:", fetchedUserId[0]);

        console.log("User Role:", fetchedUserId[1]);
        setUserRole(fetchedUserId[1].rolename);

        // Do other things with the user ID or perform actions based on it
      } catch (error) {
        console.error("Error in ChatRoomPage:", error);
        // Handle the error as needed
      }
    };

    fetchData();
  }, []);

  console.log("CURRENT USER ID IS " + actualCurrentUserId);

  const filterOptionsDefault = {
    startDate: null,
    endDate: null,
    startOrderDate: null,
    endOrderDate: null,
    statusDetail: null,
    createdAtSortOrder: null,
    deliveryDateSortOrder: null,
    limit: 10,
    offset: 0,
    chatunread: null,
    username: null,
    product: null,
    userRegion: null,
    address: null,
    searchShipper: null,
    searchCategory: null,
  };

  const [filterOptions, setFilterOptions] = useState(filterOptionsDefault);

  const handleFilterChange = (filterName: any, value: any) => {
    console.log("Value selected: " + value);
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [filterName]: value,
    }));
  };

  const handleApplyFilters = (filterOptions: any) => {
    // Fetch deliveries based on filter options
    console.log("Filter options are");
    console.log(filterOptions);
    getAllDeliveriesAdmin(actualCurrentUserId, filterOptions)
      .then((data) => {
        console.log("Filtered delivery data:", data);
        setDeliveryData(data);
        // Adjusted the date format to match the format used in renderTileContent
        setSelectedDates(
          data.map(
            (item: any) =>
              new Date(item.deliveryTime).toISOString().split("T")[0]
          )
        );
      })
      .catch((error) => {
        // Handle error if needed
        console.error(error);
      });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.AllDelivery);
    //setCurrentActivePage(CurrentActivePage.DeliveryList);
  }, []);

  const navigateToChatRoom = async (userid: any, delivery: any, role: any) => {
    try {
      console.log("Going to chat, role is " + role);
      // Make a request to the backend endpoint to get the roomId using the Fetch API
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/getRoomId?userUserID=${userid}&deliveryID=${delivery.deliveryId}&role=${role}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      // Check if the request was successful (status code in the range 200-299)
      if (response.ok) {
        // Assuming the response is JSON, parse it
        const responseData = await response.json();

        // Assuming the response is an object with a 'room_Id' property
        const roomId = responseData.room_Id;

        // Assume '/chat/[roomId]' is the route for the chat room
        const chatRoomUrl = `/chatfolder/chat/${roomId}?data=${delivery.deliveryId}`;

        // Navigate to the chat room
        router.push(chatRoomUrl);
      } else {
        // Handle non-successful response (e.g., show an error message)
        console.error("Error getting roomId:", response.statusText);
      }
    } catch (error) {
      // Handle error, e.g., log it or show a notification
      console.error("Error getting roomId:", error);
    }
  };

  // Function to extract the 6-digit postal code from a string
  function getSixDigitPostalCode(str: string) {
    // Define a regular expression pattern to match a 6-digit postal code
    var pattern = /\b\d{6}\b/; // \b represents word boundaries, \d represents digits, {6} means exactly 6 digits
    // Use the match method to extract the matched 6-digit postal code
    var match = str.match(pattern);
    // If a match is found, return the first match (6-digit postal code), otherwise return null
    return match ? match[0] : null;
  }

  // Function to fetch coordinates and weather data based on the postal code

  async function fetchDataFromPostalCode(postalCode: string) {
    try {
      // Fetch coordinates using OpenStreetMap Nominatim API
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=Singapore&format=json`
      );

      // Extract latitude and longitude from the first result
      const { lat, lon } = nominatimResponse.data[0];

      // Fetch weather data using the coordinates
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_APP_WEATHER_URL}`
      );

      // Return the coordinates and weather data
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        weatherData: weatherResponse.data,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Data Fetch Failed");
      return null;
    }
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [date, setDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [deliveryData, setDeliveryData] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  //const [usernames, setUsernames] = useState<string[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);

  const [product, setProduct] = useState<string[]>([]);
  const [address, setAddress] = useState<string[]>([]);

  const [selectedDeliveriesTransfer, setSelectedDeliveriesTransfer] = useState<
    number[]
  >([]);

  useEffect(() => {
    console.log(
      "Selected Deliveries have changed:",
      selectedDeliveriesTransfer
    );
  }, [selectedDeliveriesTransfer]); // Only re-run the effect if selectedDeliveriesTransfer changes

  const handleDeliveryIdTransfer = (e: any) => {
    console.log("Transfer button pressed");

    const joinForDelivery = selectedDeliveriesTransfer.join(",");

    if (joinForDelivery == "") {
      alert("Please check one or more deliveries");
      return;
    }

    console.log("Join Ids: " + joinForDelivery);

    const deliveryTransferURL = `/list/deliveryinsertdelete?deliveries=${joinForDelivery}`;

    // Navigate to the chat room
    router.push(deliveryTransferURL);
  };

  // Function to handle delivery selection for transfer
  const handleSelectDeliveryTransfer = (deliveryId: number) => {
    setSelectedDeliveriesTransfer((prevSelected) => {
      if (prevSelected.includes(deliveryId)) {
        // If already selected, remove from the list
        return prevSelected.filter((id) => id !== deliveryId);
      } else {
        // If not selected, add to the list

        return [...prevSelected, deliveryId];
      }
    });
  };

  const handleSelectAllDeliveriesTransfer = () => {
    // Implement your logic to select/deselect all deliveries for transfer
    // For example, you can check if all are currently selected and then toggle
    // the selection accordingly.
    const allSelected =
      selectedDeliveriesTransfer.length === deliveryData.length;
    if (allSelected) {
      // If all selected, deselect all
      setSelectedDeliveriesTransfer([]);
    } else {
      // If not all selected, select all
      const allDeliveryIds = deliveryData.map(
        (delivery) => delivery.deliveryId
      );
      console.log("All delivery Ids " + allDeliveryIds);
      setSelectedDeliveriesTransfer(allDeliveryIds);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/categoriesForDelivery`
        );
        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this effect runs once on component mount

  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/shippersForDelivery`
        );
        const data = await response.json();

        setShippers(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchShippers();
  }, []);

  useEffect(() => {
    const fetchUserRegions = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/userRegionsForDelivery`
        );
        const data = await response.json();

        // Assuming the response is an array of objects with 'region' property
        const regionNames = data.map(
          (regionObj: { region: string }) => regionObj.region
        );

        setRegions(regionNames);
      } catch (error) {
        console.error("Error fetching user regions:", error);
      }
    };

    fetchUserRegions();
  }, []); // Empty dependency array means this effect runs once on component mount

  useEffect(() => {
    const fetchUserNames = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/userNameForDelivery`
        );
        const data = await response.json();

        // Assuming the response is an array of objects with 'username' property
        const usernameList = data.map(
          (userObj: { username: string }) => userObj.username
        );

        setUsernames(usernameList);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };

    fetchUserNames();
  }, []);

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/productForDelivery`
        );
        const data = await response.json();

        // Assuming the response is an array of objects with 'username' property
        const productList = data.map(
          (prodObj: { productname: string }) => prodObj.productname
        );

        setProduct(productList);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchproduct();
  }, []);

  useEffect(() => {
    const fetchaddress = async () => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/addressForDelivery`
        );
        const data = await response.json();

        // Assuming the response is an array of objects with 'username' property
        const addressList = data.map(
          (addObj: { addressname: string }) => addObj.addressname
        );

        setAddress(addressList);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchaddress();
  }, []);

  //productForDelivery

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setDate(value);
    }
  };

  const [forceRerender, setForceRerender] = useState(false);

  useEffect(() => {
    getAllDeliveriesAdmin(1, filterOptions)
      .then((data) => {
        console.log("Received delivery data:", data);

        // Check if 'data' is defined before using it
        if (data && Array.isArray(data)) {
          setDeliveryData(data);
          // Adjusted the date format to match the format used in renderTileContent
          setSelectedDates(
            data.map(
              (item: any) =>
                new Date(item.deliveryTime).toISOString().split("T")[0]
            )
          );
        } else {
          console.error("Data is undefined or not an array:", data);
        }
      })
      .catch((error) => {
        // Handle error if needed
        console.error(error);
      });
  }, [forceRerender]);

  // Fetch current user ID
  useEffect(() => {
    const updateLeaveStatus = async () => {
      try {
        const roomIdUpdateLeave = await updatechatleavestatus(0, false);
        // Do something with roomIdUpdateLeave if needed
      } catch (error) {
        console.error("Error in ChatRoomPage:", error);
      }
    };
    // Call the updateLeaveStatus function when the component mounts
    updateLeaveStatus();
    return () => {};
  }, []);

  const renderTileContent = ({ date, view }: any) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(date.getDate() + 1); // Subtract one day
    const dateString = adjustedDate.toISOString().split("T")[0]; // Use the same format as setSelectedDates

    const isGreenCircle = selectedDates.includes(dateString);
    const isBlueCircle = selectedDateFilters.includes(dateString);

    return (
      <div
        className="circle-container"
        onClick={() => toggleDateSelection(dateString)}
      >
        {isGreenCircle && <div className="green-circle"></div>}
        {isBlueCircle && <div className="blue-circle"></div>}
      </div>
    );
  };

  const toggleDateSelection = (dateString: string) => {
    if (selectedDateFilters.includes(dateString)) {
      // Deselect the date
      setSelectedDateFilters((prevFilters) =>
        prevFilters.filter((filter) => filter !== dateString)
      );
    } else {
      // Select the date
      setSelectedDateFilters((prevFilters) => [...prevFilters, dateString]);
    }
  };

  const renderDeliveryTable = () => {
    // Filter deliveryData based on selectedDateFilters
    const filteredData =
      selectedDateFilters.length > 0
        ? deliveryData.filter((item) =>
            selectedDateFilters.includes(item.deliveryTime.split("T")[0])
          )
        : deliveryData;

    return (
      <table className="table w-full border border-neon-blue">
        <thead>
          <tr className="bg-neon-blue">
            {/* Add a checkbox for selection */}
            <th className="p-2">
              <input
                type="checkbox"
                checked={
                  selectedDeliveriesTransfer.length === filteredData.length
                }
                onChange={() => handleSelectAllDeliveriesTransfer()}
              />
            </th>
            <th className="p-2">Order ID</th>
            <th className="p-2">Delivery ID</th>
            <th className="p-2">Tracking Number</th>
            <th className="p-2">Bought On</th>
            <th className="p-2">Estimated Delivery Date</th>
            <th className="p-2">Address</th>
            <th className="p-2">Time</th>
            <th className="p-2">Status</th>
            <th className="p-2">Unread Messages</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((delivery) => (
            <tr key={delivery.deliveryId} className="border-t border-neon-blue">
              {/* Add a checkbox for each delivery */}
              <td className="p-2">
                {/* Add a checkbox for each delivery */}
                <input
                  type="checkbox"
                  checked={selectedDeliveriesTransfer.includes(
                    delivery.deliveryId
                  )}
                  onChange={() =>
                    handleSelectDeliveryTransfer(delivery.deliveryId)
                  }
                />
              </td>
              <td className="p-2">{delivery.orderId}</td>
              <td className="p-2">{delivery.deliveryId}</td>
              <td className="p-2">{delivery.trackingNumber}</td>
              <td className="p-2">
                {new Date(delivery.orderDate).toDateString()}
              </td>
              <td className="p-2">
                {new Date(delivery.deliveryTime).toDateString()}
              </td>
              <td className="p-2">{delivery.deliveryAddress}</td>
              <td className="p-2">
                {new Date(delivery.deliveryTime).toLocaleTimeString()}
              </td>
              <td className="p-2">{delivery.deliveryStatusDetail}</td>
              <td className="p-2">
                {delivery.unreadMessageCount > 0 ? (
                  <span className="text-neon-green">
                    🔔 {delivery.unreadMessageCount} message(s) unread 🔔
                  </span>
                ) : (
                  <span>No new message</span>
                )}
              </td>
              <td className="p-2">
                <button
                  type="button"
                  className="btn btn-primary mr-2 border border-neon-blue hover:bg-neon-blue hover:text-orange text-gray-900 dark:text-white"
                  onClick={() => openModal(delivery)}
                >
                  View Details
                </button>
                <button
                  type="button"
                  className="btn btn-success border border-neon-green hover:bg-neon-green hover:text-green text-gray-900 dark:text-white"
                  onClick={() =>
                    navigateToChatRoom(actualCurrentUserId, delivery, userrole)
                  }
                >
                  Chat
                </button>

                <button
                  type="button"
                  className="btn btn-success border border-neon-green hover:bg-neon-green hover:text-green text-gray-900 dark:text-white"
                  onClick={() => openModalLoc(delivery.deliveryAddress)}
                >
                  View Location
                </button>

                {/* Add "edit" and "delete" buttons here */}
                <button
                  type="button"
                  className="btn btn-warning border border-yellow hover:bg-yellow hover:text-blue text-gray-900 dark:text-white"
                  onClick={() => openModalEdit(delivery)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger border border-red hover:bg-red hover:text-green text-gray-900 dark:text-white"
                  onClick={() => openModalDelete(delivery.deliveryId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const openModal = (delivery: any) => {
    setSelectedDelivery(delivery);
    onOpen();
  };

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

  const [page, setPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(3);

  const handleChangePage = (e: any) => {
    console.log("old page", e);
    setPage(e);
    //console.log('page', page)
  };

  const handleChangeLimit = (e: any) => {
    const newLimit = parseInt(e.target.value, 10); // Convert the value to an integer
    if (!isNaN(newLimit) && newLimit > 0) {
      setSelectedLimit(newLimit);
      setPage(1); // Reset page to 1 when changing the limit
    }
  };

  useEffect(() => {
    const offsetTar = (page - 1) * selectedLimit;

    console.log("page:", page);
    console.log("selectedLimit:", selectedLimit);

    Promise.resolve()
      .then(() => {
        const newFilterOptions = {
          ...filterOptions, // Assuming you have filterOptions defined somewhere
          limit: selectedLimit,
          offset: offsetTar,
        };
        setFilterOptions(newFilterOptions);
        return newFilterOptions;
      })
      .then((updatedFilterOptions) => {
        handleApplyFilters(updatedFilterOptions);
      });

    console.log("offset is " + offsetTar);
  }, [page, selectedLimit]);

  // Part 4 - Update and Delete

  const [SelectedDeliveryID2, setSelectedDeliveryID2] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<LocState>(initialLocState);

  //const [SelectedDelivery2, setSelectedDelivery2] = useState<any[]>([]);
  //const [deliveryData, setDeliveryData] = useState<any[]>([]);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLocationModalOpen, setLocModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState<any>(null);

  /*const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
  });*/

  const openModalEdit = (delivery: any) => {
    setEditFormData(delivery);
    setEditModalOpen(true);
  };

  const openModalDelete = (deliveryid: any) => {
    setSelectedDeliveryID2(deliveryid);
    setDeleteModalOpen(true);
  };

  const handleCloseModalsEdit = () => {
    console.log("Edit Model Closed");
    setEditModalOpen(false);
  };

  const handleCloseModalsDel = () => {
    console.log("Del Model Closed");
    setDeleteModalOpen(false);
  };

  // Function to handle opening the modal with calculated data
  const openModalLoc = async (deliveryAddress: string) => {
    // Extract the 6-digit postal code from the delivery address
    //const postalCode = "680121";
    const postalCode = getSixDigitPostalCode(deliveryAddress);

    if (!postalCode) {
      console.error("Could not extract postal code from delivery address");
      alert("Invalid postal code");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_APP_WEATHER_URL || "";

    // Fetch coordinates and weather data based on the postal code
    const data = await fetchDataFromPostalCode(postalCode);

    console.log("Final Data is ");
    console.log(data);

    if (!data) {
      console.error("Error fetching data");
      alert("Postal code of " + postalCode + " valid but not found in API");
      return;
    }

    // Pass all the data to setSelectedLoc
    setSelectedLoc({
      deliveryAddress: deliveryAddress,
      postalCode: postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      weatherData: data.weatherData,
    });

    setLocModalOpen(true);
  };

  /*const openModalLoc = (deliveryaddress: any) => {
    setSelectedLoc(deliveryaddress);
    
  };*/

  const handleCloseModalsLoc = () => {
    console.log("Loc Model Closed");
    setLocModalOpen(false);
  };

  //const [forceRerender, setForceRerender] = useState(false);

  const handleEditReal = async (editFormData: any) => {
    try {
      console.log("Edited Data:", editFormData);

      console.log(editFormData);

      // Call the API to update deliveries in batch
      //const deliveryIdToUpdate = 'your_delivery_id';
      await updateSingleDeliveryCA2(editFormData);

      setForceRerender((prevState) => !prevState);
    } catch (error) {
      console.error(`Failed to handle edit.`);
      // Handle errors appropriately
    }

    onClose();
  };

  const handleDeleteReal = async (SelectedDeliveryID2: any) => {
    try {
      console.log("Edited Data:", editFormData);
      const deletionSuccessful = await handleDeleteDeliverySequentially(
        SelectedDeliveryID2
      );

      if (deletionSuccessful) {
        setForceRerender((prevState) => !prevState);
        onClose();
      } else {
        console.error("Deletion failed or stopped");
      }
    } catch (error) {
      console.error("Error occurred while handling deletion:", error);
    }
  };

  const handleViewMap = async (overviewOrNot: boolean) => {
    try {
      let latitude, longitude;

      // Use the current location to navigate
      if (overviewOrNot) {
        // Get the user's current location
        if ("geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          console.log(
            "My current location is at " + latitude + ", " + longitude
          );
          //alert("My current location is at " + latitude + ", " + longitude)
        } else {
          throw new Error("Geolocation is not supported by this browser.");
        }
        router.push(
          `/list/deliverytable/viewlocation?latitude=${latitude}&longitude=${longitude}`
        );
      } else {
        // Add your existing code for handling the else condition here
        router.push(
          `/list/deliverytable/viewlocation?latitude=${selectedLoc.latitude}&longitude=${selectedLoc.longitude}`
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      // Handle error here, such as displaying an alert or error message
    }
  };

  function formatDateWithTime(isoDate: any) {
    const dateObject = new Date(isoDate);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    console.log("editFormData:", editFormData);
  }, [editFormData]);

  return (
    <div className="container">
      <h2 className="text-center mb-5">Delivery Details 🚚</h2>

      <div className="flex flex-wrap">
        <div className="w-full flex justify-center">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center mb-5">Filter Options 🔎</h5>

              {/* Date filters */}

              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2">
                    <label htmlFor="startDate">
                      Start Date (Delivery Target):
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="endDate">End Date (Delivery Target):</label>
                    <input
                      type="date"
                      id="endDate"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="startOrderDate">
                      Start Date (Ordered):
                    </label>
                    <input
                      type="date"
                      id="startOrderDate"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("startOrderDate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="endOrderDate">End Date (Ordered):</label>
                    <input
                      type="date"
                      id="endOrderDate"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("endOrderDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Status and other filters */}
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="statusDetail">Status Detail:</label>
                    <select
                      id="statusDetail"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("statusDetail", e.target.value)
                      }
                    >
                      <option value="">All Status</option>
                      <option value="Order confirmed">Order confirmed</option>
                      <option value="Ready for pickup by company">
                        Ready for pickup by company
                      </option>
                      <option value="On the way">On the way</option>
                      <option value="Product delivered">
                        Product delivered
                      </option>
                    </select>
                  </div>
                </div>

                {/* CreatedAtSortOrder dropdown */}
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="createdAtSortOrder">
                      Created At Sort Order:
                    </label>
                    <select
                      id="createdAtSortOrder"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("createdAtSortOrder", e.target.value)
                      }
                    >
                      <option value="Default">Default</option>
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="deliveryDateSortOrder">
                      Delivery Date Sort Order:
                    </label>
                    <select
                      id="deliveryDateSortOrder"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange(
                          "deliveryDateSortOrder",
                          e.target.value
                        )
                      }
                    >
                      <option value="Default">Default</option>
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                {/* Status and other filters */}
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="searchCategory">Search Category:</label>
                    <select
                      id="searchCategory"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("searchCategory", e.target.value)
                      }
                    >
                      <option value="Default">All Categories</option>
                      {categories.map((category) => (
                        <option
                          key={category.categoryid}
                          value={category.categoryname}
                        >
                          {category.categoryname}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="userRegion">User Region:</label>
                    <select
                      id="userRegion"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("userRegion", e.target.value)
                      }
                    >
                      <option value="Default">All Regions</option>
                      {regions.map((region, index) => (
                        <option key={index} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="chatunread">Chat Read Filter:</label>
                    <select
                      id="chatunread"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("chatunread", e.target.value)
                      }
                    >
                      <option value="AllChats">All Chats</option>
                      <option value="UnreadChats">Unread Chats</option>
                    </select>
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="username">Search Delivery of User:</label>
                    <Select
                      id="username"
                      className="form-control text-black"
                      isClearable
                      options={usernames.map((username) => ({
                        value: username,
                        label: username,
                      }))}
                      onChange={(selectedOption) =>
                        handleFilterChange(
                          "username",
                          selectedOption?.value || null
                        )
                      }
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4 ">
                    <label htmlFor="product">
                      Search Delivery Containing Product:
                    </label>
                    <Select
                      id="product"
                      className="form-control text-black"
                      isClearable
                      options={product.map((productname) => ({
                        value: productname,
                        label: productname,
                      }))}
                      onChange={(selectedOption) =>
                        handleFilterChange(
                          "product",
                          selectedOption?.value || null
                        )
                      }
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4 ">
                    <label htmlFor="address">Search Delivery of Address:</label>
                    <Select
                      id="address"
                      className="form-control text-black"
                      isClearable
                      options={address.map((addressname) => ({
                        value: addressname,
                        label: addressname,
                      }))}
                      onChange={(selectedOption) =>
                        handleFilterChange(
                          "address",
                          selectedOption?.value || null
                        )
                      }
                    />
                  </div>
                </div>

                {/* Status and other filters */}
                <div className="w-full md:w-1/2 lg:w-1/4 px-2">
                  <div className="border border-gray-700 p-2 mb-4">
                    <label htmlFor="searchShipper">Search Shipper:</label>
                    <select
                      id="searchShipper"
                      className="form-control"
                      onChange={(e) =>
                        handleFilterChange("searchShipper", e.target.value)
                      }
                    >
                      <option value="Default">All Shippers</option>
                      {shippers.map((shipper) => (
                        <option key={shipper.shipId} value={shipper.name}>
                          {shipper.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Apply filters button */}
              <button
                type="button"
                className="btn btn-primary mb-2 border border-gray-700 p-2 mb-4 mx-5 text-gray-900 dark:text-white"
                onClick={handleChangePage}
              >
                Apply Filters
              </button>

              <button
                type="button"
                className="btn btn-primary mb-2 border border-gray-700 p-2 mb-4 mx-5 text-gray-900 dark:text-white"
                onClick={handleDeliveryIdTransfer}
              >
                Bulk Update/Delete
              </button>

              <button
                type="button"
                className="btn btn-primary mb-2 border border-gray-700 p-2 mb-4 mx-5 text-gray-900 dark:text-white"
                onClick={() => handleViewMap(true)}
              >
                View Current Location
              </button>
            </div>
          </div>
        </div>

        <div
          className="col-md-6"
          style={{ height: "700px", overflow: "auto", marginLeft: "20px" }}
        >
          <h2 id="cardsMainHeader"></h2>
          {renderDeliveryTable()}

          <div className="relative h-32 w-37">
            <div className="mb-2">
              <span>Items per page:</span>
              <select value={selectedLimit} onChange={handleChangeLimit}>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>

            <Pagination
              color="primary"
              size="sm"
              total={30}
              onChange={handleChangePage}
              className="mb-20 absolute bottom-0 right-0"
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedDelivery(null);
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delivery Details
              </ModalHeader>
              <ModalBody>
                {selectedDelivery && (
                  <>
                    <h5 className="card-title">
                      Delivery #{selectedDelivery.deliveryId}
                    </h5>
                    <p>
                      <strong>User:</strong> {selectedDelivery.appuser}
                    </p>
                    <p>
                      <strong>Estimated Delivery Date:</strong>{" "}
                      {new Date(selectedDelivery.deliveryTime).toDateString()}
                    </p>
                    <p className="card-text">
                      Address: {selectedDelivery.deliveryAddress}
                    </p>
                    <p className="card-text">
                      Time:{" "}
                      {new Date(
                        selectedDelivery.deliveryTime
                      ).toLocaleTimeString()}
                    </p>
                    <p className="card-text">
                      Status: {selectedDelivery.deliveryStatusDetail}
                    </p>
                    <Progress
                      label={`${getProgressValue(
                        selectedDelivery.deliveryStatusDetail
                      )}% ${"Progress"}`}
                      value={getProgressValue(
                        selectedDelivery.deliveryStatusDetail
                      )}
                      className="max-w-md"
                    />

                    <p className="card-text">
                      Tracking Number: {selectedDelivery.trackingNumber}
                    </p>

                    <h6>Items:</h6>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedDelivery.items.map(
                        (item: any, index: number) => (
                          <div key={item.createtime} className="text-center">
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
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    setSelectedDelivery(null);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseModalsEdit}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Delivery of #{editFormData.deliveryId}
              </ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-4">
                <div>
                  <label>Order ID:</label>
                  <input
                    type="text"
                    value={editFormData.orderId}
                    readOnly
                    className={`w-full ${
                      editFormData.orderId ? "readonly" : ""
                    }`}
                  />
                </div>
                <div>
                  <label>Delivery ID:</label>
                  <input
                    type="text"
                    value={editFormData.deliveryId}
                    readOnly
                    className={`w-full ${
                      editFormData.deliveryId ? "readonly" : ""
                    }`}
                  />
                </div>
                <div>
                  <label>Tracking Number:</label>
                  <input
                    type="text"
                    value={editFormData.trackingNumber}
                    readOnly
                    className={`w-full ${
                      editFormData.trackingNumber ? "readonly" : ""
                    }`}
                  />
                </div>
                <div>
                  <label>Delivery Address:</label>
                  <textarea
                    value={editFormData.deliveryAddress}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deliveryAddress: e.target.value,
                      })
                    }
                    className={`w-full ${
                      editFormData.deliveryAddress ? "readonly" : ""
                    }`}
                  />
                </div>
                <div>
                  <label>Delivery Status Detail:</label>
                  <select
                    value={editFormData.deliveryStatusDetail}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deliveryStatusDetail: e.target.value,
                      })
                    }
                    className="w-full"
                  >
                    <option value="Order confirmed">Order confirmed</option>
                    <option value="Ready for pickup by company">
                      Ready for pickup by company
                    </option>
                    <option value="On the way">On the way</option>
                    <option value="Product delivered">Product delivered</option>
                  </select>
                </div>
                <div>
                  <label>Delivery Date and Time:</label>
                  <input
                    type="datetime-local"
                    id="deliveryDateTime"
                    className={`form-control w-full ${
                      editFormData.deliveryTime ? "readonly" : ""
                    }`}
                    value={
                      editFormData.deliveryTime
                        ? formatDateWithTime(editFormData.deliveryTime)
                        : ""
                    }
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deliveryTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Shipper Name:</label>
                  <select
                    value={editFormData.shipping.carrier}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        shipping: { carrier: e.target.value },
                      })
                    }
                    className="w-full"
                  >
                    {shippers.map((shipper) => (
                      <option key={shipper.shipId} value={shipper.name}>
                        {shipper.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add other input fields as needed */}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
                    handleEditReal(editFormData);
                    handleCloseModalsEdit();
                  }}
                >
                  Save Changes
                </Button>
                <Button color="secondary" onPress={handleCloseModalsEdit}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModalsDel}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Are you sure you want to delete delivery #{SelectedDeliveryID2}?
              </ModalHeader>
              <ModalBody>
                <p>This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={() => {
                    handleDeleteReal(SelectedDeliveryID2);
                    handleCloseModalsDel();
                  }}
                >
                  Delete Delivery
                </Button>
                <Button color="secondary" onPress={handleCloseModalsDel}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isLocationModalOpen} onClose={handleCloseModalsLoc}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div>Delivery Location Details</div>
                <div>Delivery Address: {selectedLoc.deliveryAddress}</div>
              </ModalHeader>
              <ModalBody>
                <div>Postal Code: {selectedLoc.postalCode}</div>
                <div>Latitude: {selectedLoc.latitude}</div>
                <div>Longitude: {selectedLoc.longitude}</div>

                {selectedLoc.weatherData && (
                  <>
                    <div>Weather Data:</div>

                    <p>Temperature: {selectedLoc.weatherData.main.temp} K</p>
                    <p>
                      Minimum Temperature:{" "}
                      {selectedLoc.weatherData.main.temp_min} K
                    </p>
                    <p>
                      Maximum Temperature:{" "}
                      {selectedLoc.weatherData.main.temp_max} K
                    </p>
                    <p>Pressure: {selectedLoc.weatherData.main.pressure} hPa</p>
                    <p>Humidity: {selectedLoc.weatherData.main.humidity} %</p>
                    <p>
                      Weather: {selectedLoc.weatherData.weather[0].description}
                    </p>
                    <p>Cloudiness: {selectedLoc.weatherData.clouds.all}%</p>
                    <p>Wind Speed: {selectedLoc.weatherData.wind.speed} m/s</p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => handleViewMap(false)}>
                  View Map
                </Button>
                <Button color="secondary" onPress={handleCloseModalsLoc}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
