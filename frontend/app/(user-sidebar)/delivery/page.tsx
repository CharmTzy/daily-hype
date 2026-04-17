"use client";
import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Progress, } from "@nextui-org/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Link, } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendarstyle.css";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getAllDeliveries, getCurrentUserId, updatechatleavestatus, } from "@/functions/deliv-functions";
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
                setUserRole(fetchedUserId[1].rolename);
            }
            catch (error) {
                console.error("Error in ChatRoomPage:", error);
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
    };
    const [filterOptions, setFilterOptions] = useState(filterOptionsDefault);
    const handleFilterChange = (filterName: any, value: any) => {
        setFilterOptions((prevOptions) => ({
            ...prevOptions,
            [filterName]: value,
        }));
    };
    const handleApplyFilters = (filterOptions: any) => {
        console.log("Filter options are");
        console.log(filterOptions);
        getAllDeliveries(actualCurrentUserId, filterOptions)
            .then((data) => {
            console.log("Filtered delivery data:", data);
            setDeliveryData(data);
            setSelectedDates(data.map((item: any) => new Date(item.deliveryTime).toISOString().split("T")[0]));
        })
            .catch((error) => {
            console.error(error);
        });
    };
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AllDelivery);
    }, []);
    const navigateToChatRoom = async (userid: any, delivery: any, role: any) => {
        try {
            console.log("Going to chat, role is " + role);
            const response = await fetch(`${process.env.BACKEND_URL}/api/getRoomId?userUserID=${userid}&deliveryID=${delivery.deliveryId}&role=${role}`, {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const responseData = await response.json();
                const roomId = responseData.room_Id;
                const chatRoomUrl = `/chatfolder/chat/${roomId}?data=${delivery.deliveryId}`;
                router.push(chatRoomUrl);
            }
            else {
                console.error("Error getting roomId:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error getting roomId:", error);
        }
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [date, setDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [deliveryData, setDeliveryData] = useState<any[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
    const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>([]);
    const handleDateChange = (value: any) => {
        if (value instanceof Date) {
            setDate(value);
        }
    };
    useEffect(() => {
        getAllDeliveries(1, filterOptions)
            .then((data) => {
            console.log("Received delivery data:", data);
            setDeliveryData(data);
            setSelectedDates(data.map((item: any) => new Date(item.deliveryTime).toISOString().split("T")[0]));
        })
            .catch((error) => {
            console.error(error);
        });
    }, []);
    useEffect(() => {
        const updateLeaveStatus = async () => {
            try {
                const roomIdUpdateLeave = await updatechatleavestatus(0, false);
            }
            catch (error) {
                console.error("Error in ChatRoomPage:", error);
            }
        };
        updateLeaveStatus();
        return () => { };
    }, []);
    const renderTileContent = ({ date, view }: any) => {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(date.getDate() + 1);
        const dateString = adjustedDate.toISOString().split("T")[0];
        const isGreenCircle = selectedDates.includes(dateString);
        const isBlueCircle = selectedDateFilters.includes(dateString);
        return (<div className="circle-container" onClick={() => toggleDateSelection(dateString)}>
        {isGreenCircle && <div className="green-circle"></div>}
        {isBlueCircle && <div className="blue-circle"></div>}
      </div>);
    };
    const toggleDateSelection = (dateString: string) => {
        if (selectedDateFilters.includes(dateString)) {
            setSelectedDateFilters((prevFilters) => prevFilters.filter((filter) => filter !== dateString));
        }
        else {
            setSelectedDateFilters((prevFilters) => [...prevFilters, dateString]);
        }
    };
    const renderDeliveryCards = () => {
        const filteredData = selectedDateFilters.length > 0
            ? deliveryData.filter((item) => selectedDateFilters.includes(item.deliveryTime.split("T")[0]))
            : deliveryData;
        return (<div className="row">
        {filteredData.map((delivery) => (<Card key={delivery.createtime} className="col-md-12 mb-4">
            <CardBody>
              {delivery.unreadMessageCount > 0 && (<p className="card-text">
                  🔔 {delivery.unreadMessageCount} message(s) unread 🔔
                </p>)}
              <h5 className="card-title">Order #{delivery.orderId}</h5>
              <h5 className="card-title">Delivery #{delivery.deliveryId}</h5>
              <p>
                <span className="font-bold">Bought On:</span>{" "}
                {new Date(delivery.orderDate).toDateString()}
              </p>
              <p>
                <span className="font-bold">Estimated Delivery Date:</span>{" "}
                {new Date(delivery.deliveryTime).toDateString()}
              </p>
              <p className="card-text">Address: {delivery.deliveryAddress}</p>
              <p className="card-text">
                Time: {new Date(delivery.deliveryTime).toLocaleTimeString()}
              </p>
              <p className="card-text">
                Status: {delivery.deliveryStatusDetail}
              </p>

              <button type="button" className="btn btn-primary mr-2" onClick={() => openModal(delivery)}>
                View Details
              </button>

              
              <button type="button" className="btn btn-success" onClick={() => navigateToChatRoom(actualCurrentUserId, delivery, userrole)}>
                Chat
              </button>
            </CardBody>
          </Card>))}
      </div>);
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
                return 0;
        }
    };
    const [page, setPage] = useState(1);
    const handleChangePage = (e: any) => {
        console.log("old page", e);
        setPage(e);
    };
    useEffect(() => {
        var offsetTar = (page - 1) * 3;
        Promise.resolve()
            .then(() => {
            const newFilterOptions = {
                ...filterOptions,
                limit: 3,
                offset: offsetTar,
            };
            setFilterOptions(newFilterOptions);
            return newFilterOptions;
        })
            .then((updatedFilterOptions) => {
            handleApplyFilters(updatedFilterOptions);
        });
        console.log("offset is " + offsetTar);
    }, [page]);
    return (<div className="container">
      <h2 className="text-center mb-5">Delivery Details 🚚</h2>

      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center mb-5">Calendar 🤩</h5>

              <div style={{ color: "black" }}>
                <Calendar onChange={handleDateChange} value={date} className={`react-calendar text-black text-slate-800`} tileClassName={(value) => selectedDates.includes(new Date(value.date).toISOString().split("T")[0])
            ? "has-delivery"
            : ""} tileContent={renderTileContent}/>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="card">
            <div className="card-body ">
              <h5 className="card-title text-center mb-5">Filter Options 🔎</h5>
              
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="startDate">Start Date (Delivery Target):</label>
                <input type="date" id="startDate" className="form-control" onChange={(e) => handleFilterChange("startDate", e.target.value)}/>
              </div>
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="endDate">End Date (Delivery Target):</label>
                <input type="date" id="endDate" className="form-control" onChange={(e) => handleFilterChange("endDate", e.target.value)}/>
              </div>
              
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="startOrderDate">Start Date (Ordered):</label>
                <input type="date" id="startOrderDate" className="form-control" onChange={(e) => handleFilterChange("startOrderDate", e.target.value)}/>
              </div>
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="endOrderDate">End Date (Ordered):</label>
                <input type="date" id="endOrderDate" className="form-control" onChange={(e) => handleFilterChange("endOrderDate", e.target.value)}/>
              </div>

              
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="statusDetail">Status Detail:</label>
                <select id="statusDetail" className="form-control" onChange={(e) => handleFilterChange("statusDetail", e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Order confirmed">Order confirmed</option>
                  <option value="Ready for pickup by company">
                    Ready for pickup by company
                  </option>
                  <option value="On the way">On the way</option>
                  <option value="Product delivered">Product delivered</option>
                </select>
              </div>

              
              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="createdAtSortOrder">
                  Created At Sort Order:
                </label>
                <select id="createdAtSortOrder" className="form-control" onChange={(e) => handleFilterChange("createdAtSortOrder", e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="mb-2 border border-gray-700 p-2">
                <label htmlFor="deliveryDateSortOrder">
                  Delivery Date Sort Order:
                </label>
                <select id="deliveryDateSortOrder" className="form-control" onChange={(e) => handleFilterChange("deliveryDateSortOrder", e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              
              <button type="button" className="btn btn-primary mb-2 border border-gray-700 p-2" onClick={handleChangePage}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6" style={{ height: "700px", overflow: "auto", marginLeft: "20px" }}>
        <h2 id="cardsMainHeader"></h2>
        {renderDeliveryCards()}

        <div className="relative h-32 w-37">
          <Pagination color="primary" size="sm" total={30} onChange={handleChangePage} className="mb-20 absolute bottom-0 right-0"/>
        </div>
      </div>

      
      <Modal isOpen={isOpen} onClose={() => {
            onClose();
            setSelectedDelivery(null);
        }}>
        <ModalContent>
          {() => (<>
              <ModalHeader className="flex flex-col gap-1">
                Delivery Details
              </ModalHeader>
              <ModalBody>
                {selectedDelivery && (<>
                    <h5 className="card-title">
                      Delivery #{selectedDelivery.deliveryId}
                    </h5>
                    <p>
                      <strong>Estimated Delivery Date:</strong>{" "}
                      {new Date(selectedDelivery.deliveryTime).toDateString()}
                    </p>
                    <p className="card-text">
                      Address: {selectedDelivery.deliveryAddress}
                    </p>
                    <p className="card-text">
                      Time:{" "}
                      {new Date(selectedDelivery.deliveryTime).toLocaleTimeString()}
                    </p>
                    <p className="card-text">
                      Status: {selectedDelivery.deliveryStatusDetail}
                    </p>
                    <Progress label={`${getProgressValue(selectedDelivery.deliveryStatusDetail)}% ${"Progress"}`} value={getProgressValue(selectedDelivery.deliveryStatusDetail)} className="max-w-md"/>

                    <p className="card-text">
                      Tracking Number: {selectedDelivery.trackingNumber}
                    </p>

                    <h6>Items:</h6>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedDelivery.items.map((item: any, index: number) => (<div key={item.createtime} className="text-center">
                            <img src={item.image} alt={item.name} className="max-w-full h-auto mb-2"/>
                            <p className="mb-2">
                              {item.name} x {item.quantity}
                            </p>
                            <p className="mb-2">
                              {item.colour}, {item.size}
                            </p>
                            <p>${item.price}</p>
                          </div>))}
                    </div>
                  </>)}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => {
                onClose();
                setSelectedDelivery(null);
            }}>
                  Close
                </Button>
              </ModalFooter>
            </>)}
        </ModalContent>
      </Modal>
    </div>);
}

