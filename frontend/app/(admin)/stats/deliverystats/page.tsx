"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Bar } from "react-chartjs-2";
import { CategoryScale, Chart, registerables } from "chart.js";
import { Button, Chip } from "@nextui-org/react";

// Register necessary modules from Chart.js
Chart.register(...registerables);

import { retrieveArrayChartJS } from "@/functions/delivadmin-functions";
//retrieveArrayChartJS

interface Category {
  id: number;
  categoryname: string;
}

interface UserRegion {
  region: string;
}

interface Row {
  deliveryid: number;
  trackingnumber: string;
  deliverystatusdetail: string;
  name: string;
  deliveryaddress: string;
  currentstagenum: string;
  deliverydate: string;
  diff_ab_hours: number;
  diff_bc_hours: number;
  diff_cd_hours: number;
  totalNum: number;
}

interface Delivery {
  deliveryid: number;
  rows: Row[];
}

interface CategoryData {
  category: string;
  deliveries: Delivery[];
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [userRegions, setUserRegions] = useState<UserRegion[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedFilterOption, setSelectedFilterOption] = useState("general");

  const [selectedCategory, setSelectedCategory] = useState<string | number>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedGeneral, setSelectedGeneral] = useState<string>("");

  const [selectedDataSpecific, setSelectedDataSpecific] = useState<any[]>([]);

  const [isTableOpen, setIsTableOpen] = useState(true); // State to control table visibility

  const [Chart0OpenClose, setChart0OpenClose] = useState(false);
  const [Chart1OpenClose, setChart1OpenClose] = useState(false);
  const [Chart2OpenClose, setChart2OpenClose] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 1;

  // Calculate index range for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatDateToString = (date: Date | null): string => {
    return date ? date.toISOString().split("T")[0] + " 00:00:00+00" : "";
  };

  const [chartDataStore1, setChartData1] = useState<{
    chartName: "Delivery Stage Interval";
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      data: number[];
    }[];
  }>({
    chartName: "Delivery Stage Interval",
    labels: [],
    datasets: [],
  });

  const [chartDataStore2, setChartData2] = useState<{
    chartName: "Late Delivery Hours";
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      data: number[];
    }[];
  }>({
    chartName: "Late Delivery Hours",
    labels: [],
    datasets: [],
  });

  const [chartDataStore0, setChartData0] = useState<{
    chartName: "Number At Each Stage";
    labels: string[];
    datasets: {
      label: string;
      backgroundColor: string;
      data: number[];
    }[];
  }>({
    chartName: "Number At Each Stage",
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Fetch categories
    fetch(`${process.env.BACKEND_URL}/api/categoriesForDelivery`)
      .then((response) => response.json())
      .then((data: Category[]) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));

    // Fetch user regions
    fetch(`${process.env.BACKEND_URL}/api/userRegionsForDelivery`)
      .then((response) => response.json())
      .then((data: UserRegion[]) => setUserRegions(data))
      .catch((error) => console.error("Error fetching user regions:", error));
  }, []);

  const handleFilterClick = async () => {
    if (selectedFilterOption == "general") {
      if (selectedGeneral == null || selectedGeneral == "") {
        //setSelectedGeneral("Default");
        console.log("Selected General2:", selectedGeneral);
        alert("Please select a field to search for");
        return;
      }
    }

    if (selectedFilterOption == "category") {
      if (selectedCategory == null) {
        //setSelectedCategory("Default");
        alert("Please select a field to search for");
        return;
      }
    }

    if (selectedFilterOption == "region") {
      if (selectedRegion == null) {
        //setSelectedRegion("Default");
        alert("Please select a field to search for");
        return;
      }
    }

    if (startDate == null) {
      const initialDate = new Date("2000-01-01");
      setStartDate(initialDate);
      alert("Start date cannot be empty, initalised");
      return;
    }

    if (endDate == null) {
      const LastDate = new Date("2050-01-01");
      setEndDate(LastDate);
      alert("End date cannot be empty, initalised. You may now press filter");
      return;
    }

    if (startDate != null && startDate != null) {
      const threeDaysLater = new Date(startDate!);
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      if (endDate! < threeDaysLater) {
        alert("End date must be at least 3 days later than the start date.");
        return;
      }
    }

    console.log("Selected General:", selectedGeneral);
    console.log("Selected Category:", selectedCategory);
    console.log("Selected Region:", selectedRegion);
    console.log("Selected Start Date:", startDate);
    console.log("Selected End Date:", endDate);

    console.log("Selected Start Date 2:", formatDateToString(startDate));
    console.log("Selected End Date 2:", formatDateToString(endDate));

    switch (selectedFilterOption) {
      case "category":
        console.log("Category filter selected");
        retrieveChart(
          selectedCategory,
          2,
          formatDateToString(startDate),
          formatDateToString(endDate)
        );
        break;
      case "region":
        console.log("Region filter selected");
        retrieveChart(
          selectedRegion,
          3,
          formatDateToString(startDate),
          formatDateToString(endDate)
        );
        break;
      case "general":
        console.log("General filter selected");
        if (selectedGeneral === "DayParts") {
          console.log("Going to 4th option");
          retrieveChart(
            selectedGeneral,
            4,
            formatDateToString(startDate),
            formatDateToString(endDate)
          );
        } else {
          console.log("Going to 1st option");
          retrieveChart(
            selectedGeneral,
            1,
            formatDateToString(startDate),
            formatDateToString(endDate)
          );
        }
        break;
      default:
        console.log("No filter selected");
        break;
    }

    async function retrieveChart(
      vartarget: any,
      choiceNumPara: any,
      startDate: any,
      endDate: any
    ) {
      if (vartarget == "RegPlaceholder" || vartarget == "CatPlaceholder") {
        alert("Please select a valid search value");
        return;
      }

      const selectedDropdownValueForm = vartarget;
      const choiceNum = choiceNumPara;
      const date1 = startDate;
      const date2 = endDate;

      const result = await retrieveArrayChartJS(
        selectedDropdownValueForm,
        choiceNum,
        date1,
        date2
      );

      console.log("Final Results: " + result);

      if (!result) {
        return;
      }

      if (result.length > 1) {
        setResultData(result);
      }
    }
  };

  const [resultData, setResultData] = useState<any[][]>([]);

  useEffect(() => {
    console.log("Reconfirm again");

    // Process data for the first chart (Multi-Bar Chart)
    const processedChartData1 = {
      labels: resultData[2]?.map((item) => item.category) || [],
      datasets: [
        {
          label: "Order Confirmed to Picked by Courier",
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          data: resultData[0]?.map((item: any) => item.diff_ab_hours) || [],
          stack: "stack1", // Set a common stack name
          additionalNote: "Delivery Stage Interval",
          //additionalNote: resultData[0]?.map((item: any) => item.diff_ab_hours)
        },
        {
          label: "Picked by Courier to On the Way",
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          data: resultData[0]?.map((item: any) => item.diff_bc_hours) || [],
          stack: "stack1", // Set the same stack name
          additionalNote: "Delivery Stage Interval",
          //additionalNote: resultData[0]?.map((item: any) => item.diff_bc_hours)
        },
        {
          label: "On the Way to Product delivered",
          backgroundColor: "rgba(255, 206, 86, 0.7)",
          data: resultData[0]?.map((item: any) => item.diff_cd_hours) || [],
          stack: "stack1", // Set the same stack name
          additionalNote: "Delivery Stage Interval",
          //additionalNote: resultData[0]?.map((item: any) => item.diff_cd_hours)
        },
      ],
    };

    setChartData1({
      chartName: "Delivery Stage Interval", // Provide a default value if the chartName is not available
      labels: processedChartData1.labels,
      datasets: processedChartData1.datasets,
    });

    // Process data for the second chart (Single Bar Chart)
    const processedChartData2 = {
      labels: resultData[1]?.map((item: any) => item.name) || [],
      datasets: [
        {
          label: "Hour Difference",
          data: resultData[1]?.map((item: any) => item.hour_difference) || [],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          additionalNote: "Late Delivery Hours",
        },
      ],
    };

    setChartData2({
      chartName: "Late Delivery Hours", // Provide a default value if the chartName is not available
      labels: processedChartData2.labels,
      datasets: processedChartData2.datasets,
    });

    const processedChartData0 = {
      labels: resultData[4]?.map((item: any) => item.currentstagenum) || [], // Sample stage names
      datasets: [
        {
          label: "Number At Each Stage",
          data: resultData[4]?.map((item: any) => item.totalNum) || [],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          additionalNote: "Number At Each Stage",
        },
      ],
    };

    setChartData0({
      chartName: "Number At Each Stage",
      labels: processedChartData0.labels,
      datasets: processedChartData0.datasets,
    });

    //setChartData2(processedChartData2);
  }, [resultData]);

  const chartOptions = {
    maintainAspectRatio: true, // Set to false to allow manual sizing
    responsive: true,

    onClick: (event: any, chartElements: any) => {
      if (chartElements && chartElements.length > 0) {
        console.log(chartElements);
        console.log(chartElements[0]);
        console.log(chartElements[0].element.$context.raw);

        //Check which chart
        var checkwhichchart =
          chartElements[0].element.$context.dataset.additionalNote;

        var index = chartElements[0].index;
        console.log("index is " + index);

        setChart0OpenClose(true);
        setChart1OpenClose(true);
        setChart2OpenClose(true);

        if (checkwhichchart == "Delivery Stage Interval") {
          const clickedCategory = chartDataStore1.labels[index];
          console.log("clickedCategory is " + clickedCategory);
          var clickedCategoryDeliveries = resultData[2].find(
            (category) => category.category === clickedCategory
          )?.deliveries;

          setChart1OpenClose(false);
        } else if (checkwhichchart == "Late Delivery Hours") {
          const clickedCategory = chartDataStore2.labels[index];
          console.log("clickedCategory is " + clickedCategory);

          var clickedCategoryDeliveries = resultData[3].find(
            (category) => category.category === clickedCategory
          )?.deliveries;

          setChart2OpenClose(false);
        } else if (checkwhichchart == "Number At Each Stage") {
          const clickedCategory = chartDataStore0.labels[index];
          var clickedCategoryDeliveries = resultData[4].find(
            (currentstagenum) =>
              currentstagenum.currentstagenum === clickedCategory
          )?.deliveries;

          setChart0OpenClose(false);
        }

        console.log("VERDICT");
        console.log(clickedCategoryDeliveries);
        console.log(clickedCategoryDeliveries.length);

        setSelectedDataSpecific(clickedCategoryDeliveries);
      }
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4 mt-5">
        Delivery Statistics
      </h1>
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Dropdown for Time */}
        <div>
          <label
            htmlFor="allDropdown"
            className="block text-sm font-medium text-gray-700"
          >
            Select Period:
          </label>
          <select
            id="allDropdown"
            disabled={selectedFilterOption !== "general"}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            onChange={(e) => setSelectedGeneral(e.target.value)}
          >
            <option value="Default">All</option>
            <option value="Category">All Categories</option>
            <option value="Region">All Regions</option>
            <option value="Gender">Gender</option>
            <option value="DayParts">Morning, Afternoon, Evening</option>
            <option value="Shipper">All Shippers</option>
          </select>
        </div>

        {/* Dropdown for Categories */}
        <div>
          <label
            htmlFor="categoryDropdown"
            className="block text-sm font-medium text-gray-700"
          >
            Select Category:
          </label>
          <select
            id="categoryDropdown"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            disabled={selectedFilterOption !== "category"}
            value={selectedFilterOption === "category" ? selectedCategory : ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="CatPlaceholder">Select a Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryname}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown for User Regions */}
        <div>
          <label
            htmlFor="regionDropdown"
            className="block text-sm font-medium text-gray-700"
          >
            Select User Region:
          </label>
          <select
            id="regionDropdown"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            disabled={selectedFilterOption !== "region"}
            value={selectedFilterOption === "region" ? selectedRegion : ""}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="RegPlaceholder">Select a Region</option>

            {userRegions.map((region) => (
              <option key={region.region} value={region.region}>
                {region.region}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <div>
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy/MM/dd"
              isClearable
              placeholderText="  Select Start Date"
            />
          </div>

          <div className="mt-2">
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy/MM/dd"
              isClearable
              placeholderText="  Select End Date"
            />
          </div>
        </div>

        {/* Radio Buttons for Filter Options */}

        <div className="flex items-center mt-5 mx-5">
          <input
            type="radio"
            id="generalFilter"
            name="filterOption"
            value="general"
            checked={selectedFilterOption === "general"}
            onChange={() => setSelectedFilterOption("general")}
          />
          <label htmlFor="generalFilter" className="ml-2">
            General
          </label>

          <input
            type="radio"
            id="categoryFilter"
            name="filterOption"
            value="category"
            className="ml-3"
            checked={selectedFilterOption === "category"}
            onChange={() => setSelectedFilterOption("category")}
          />
          <label htmlFor="categoryFilter" className="ml-2">
            Category
          </label>

          <input
            type="radio"
            id="regionFilter"
            name="filterOption"
            value="region"
            checked={selectedFilterOption === "region"}
            onChange={() => setSelectedFilterOption("region")}
            className="ml-4"
          />
          <label htmlFor="regionFilter" className="ml-2">
            Region
          </label>
        </div>
      </div>

      <div className="text-center">
        {/* Button to toggle table visibility */}
        <button
          className="bg-green-500 ml-4 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring focus:border-blue-700 my-4"
          onClick={() => {
            setIsTableOpen(!isTableOpen);
            if (!isTableOpen) {
              setSelectedDataSpecific([]); // Clear the data when closing the table
            }
          }}
        >
          {isTableOpen ? "Close All Table" : "Allow Tables"}
        </button>

        <button
          className="bg-blue-500 ml-4 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-700 my-4"
          onClick={handleFilterClick}
        >
          Filter
        </button>

        <h1 className="text-3xl font-bold my-4">
          Statistics: Current Deliveries at Each Delivery Stage
        </h1>
        <p>
          Taking the number of deliveries at each of the 4 delivery stages, and
          their urgency level
        </p>
        <div className="my-4">
          <Bar data={chartDataStore0} options={chartOptions} />
        </div>

        {/* Display table when selectedData is not empty */}
        {selectedDataSpecific.length > 0 &&
          isTableOpen &&
          !Chart0OpenClose &&
          Chart1OpenClose &&
          Chart2OpenClose && (
            <div className="flex justify-center">
              <table className="border-collapse border border-black">
                <thead>
                  <tr>
                    <th className="border border-black p-2">Delivery ID</th>
                    <th className="border border-black p-2">Tracking Number</th>
                    <th className="border border-black p-2">
                      Delivery Status Detail
                    </th>
                    <th className="border border-black p-2">Shipper</th>
                    <th className="border border-black p-2">
                      Delivery Address
                    </th>
                    <th className="border border-black p-2">Delivery Date</th>
                    <th className="border border-black p-2">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDataSpecific.map((delivery: any) => (
                    <tr key={delivery.deliveryid}>
                      <td className="border border-black p-2">
                        {delivery.deliveryid}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.trackingnumber}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.deliverystatusdetail}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.carrier}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.deliveryaddress}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.deliverytime}
                      </td>
                      <td className="border border-black p-2">
                        {delivery.currentstagenum}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        <h1 className="text-3xl font-bold my-4">
          Statistics: Times Taken between Delivery Stages
        </h1>
        <p>Comparing time interval between the 4 main delivery stages</p>
        <div className="my-4">
          <Bar data={chartDataStore1} options={chartOptions} />
        </div>

        {/* Display table when selectedData is not empty */}
        {selectedDataSpecific.length > 0 &&
          isTableOpen &&
          Chart0OpenClose &&
          !Chart1OpenClose &&
          Chart2OpenClose && (
            <div className="flex justify-center">
              <table className="border-collapse border border-black">
                <thead>
                  <tr>
                    <th className="border border-black p-2">Delivery ID</th>
                    <th className="border border-black p-2">Tracking Number</th>
                    <th className="border border-black p-2">
                      Delivery Status Detail
                    </th>
                    <th className="border border-black p-2">Shipper</th>
                    <th className="border border-black p-2">
                      Delivery Address
                    </th>
                    <th className="border border-black p-2">Delivery Date</th>
                    <th className="border border-black p-2">
                      Confirm to Pickup (hrs)
                    </th>
                    <th className="border border-black p-2">
                      Pickup to On The Way (hrs)
                    </th>
                    <th className="border border-black p-2">
                      On The Way to Delivered (hrs)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDataSpecific.map((delivery: any) =>
                    delivery.rows.map((row: any) => {
                      // Check if all required attributes are present
                      if (
                        "diff_ab_hours" in row &&
                        "diff_bc_hours" in row &&
                        "diff_cd_hours" in row
                      ) {
                        return (
                          <tr key={row.deliveryid}>
                            <td className="border border-black p-2">
                              {row.deliveryid}
                            </td>
                            <td className="border border-black p-2">
                              {row.trackingnumber}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliverystatusdetail}
                            </td>
                            <td className="border border-black p-2">
                              {row.name}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliveryaddress}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliverydate}
                            </td>
                            <td className="border border-black p-2">
                              {row.diff_ab_hours}
                            </td>
                            <td className="border border-black p-2">
                              {row.diff_bc_hours}
                            </td>
                            <td className="border border-black p-2">
                              {row.diff_cd_hours}
                            </td>
                            {/* Add other table cells based on your data structure */}
                          </tr>
                        );
                      } else {
                        return null; // Skip rendering the row if any of the required attributes are missing
                      }
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

        <h1 className="text-3xl font-bold my-4">
          Statistics: Time Late for Delivery
        </h1>
        <p>
          Comparing Updated delievered time to the estimated delivery datetime
        </p>
        <div className="my-4">
          <Bar data={chartDataStore2} options={chartOptions} />
        </div>

        {/* Display table when selectedData is not empty */}
        {selectedDataSpecific.length > 0 &&
          isTableOpen &&
          Chart0OpenClose &&
          Chart1OpenClose &&
          !Chart2OpenClose && (
            <div className="flex justify-center">
              <table className="border-collapse border border-black mb-5">
                <thead>
                  <tr>
                    <th className="border border-black p-2">Delivery ID</th>
                    <th className="border border-black p-2">Tracking Number</th>
                    <th className="border border-black p-2">
                      Delivery Status Detail
                    </th>
                    <th className="border border-black p-2">Shipper</th>
                    <th className="border border-black p-2">
                      Delivery Address
                    </th>
                    <th className="border border-black p-2">Delivery Date</th>
                    <th className="border border-black p-2">Hours Late</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDataSpecific.map((delivery: any) =>
                    delivery.rows.map((row: any) => {
                      // Check if hour_difference is present and not null or undefined
                      if (
                        "hour_difference" in row &&
                        row.hour_difference !== null &&
                        row.hour_difference !== undefined
                      ) {
                        return (
                          <tr key={row.deliveryid}>
                            <td className="border border-black p-2">
                              {row.deliveryid}
                            </td>
                            <td className="border border-black p-2">
                              {row.trackingnumber}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliverystatusdetail}
                            </td>
                            <td className="border border-black p-2">
                              {row.name}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliveryaddress}
                            </td>
                            <td className="border border-black p-2">
                              {row.deliverydate}
                            </td>
                            <td className="border border-black p-2">
                              {row.hour_difference}
                            </td>
                          </tr>
                        );
                      } else {
                        return null; // Skip rendering the row if hour_difference is missing or null/undefined
                      }
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
