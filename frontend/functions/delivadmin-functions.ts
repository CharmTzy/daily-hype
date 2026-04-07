// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

interface Row {
  deliveryid: number;
  trackingnumber: string;
  deliverystatusdetail: string;
  name: string;
  deliveryaddress: string;
  deliverydate: string;
  diff_ab_hours: string;
  diff_bc_hours: string;
  diff_cd_hours: string;
  hour_difference: string;
}

interface Delivery {
  deliveryid: number;
  rows: Row[];
}

interface CategoryData {
  deliveries: Delivery[];
}

type InputData = {
  [category: string]: CategoryData;
};

export async function getAllDeliveriesAdmin(userId: any, filterOptions: any) {
  try {
    const {
      startDate,
      endDate,
      startOrderDate,
      endOrderDate,
      statusDetail,
      createdAtSortOrder,
      deliveryDateSortOrder,
      chatunread,
      username,
      product,
      userRegion,
      searchCategory,
      address,
      searchShipper,
      limit,
      offset,
    } = filterOptions;

    console.log("shipper BACKEND is " + searchShipper);

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
      chatunread: chatunread || "",
      username: username || "",
      product: product || "",
      userRegion: userRegion || "",
      searchCategory: searchCategory || "",
      address: address || "",
      shipper: searchShipper || "",
    }).toString();

    console.log("Final Filter QueryString:", queryString);

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/AlldeliveriesPageAdmin/user/${userId}?${queryString}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      // Handle non-successful response (e.g., throw an error, handle differently)
      throw new Error(`Failed to fetch deliveries. Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    // Handle errors if needed
    //console.error('Error fetching deliveries:', error.message);
    throw error;
  }
}

export async function handleDeleteDeliverySequentially(deliveryId: any) {
  try {
    // Check if the order is cancelled before proceeding with deletion
    const cancellationResponse = await fetch(
      `${process.env.BACKEND_URL}/api/checkIfOrderCancelled/${deliveryId}`,
      { method: "POST", credentials: "include" }
    );

    if (!cancellationResponse.ok) {
      // If the order is not cancelled, stop the deletion process
      console.error("Deletion stopped: the order is not cancelled");
      alert("Deletion stopped: the order is not cancelled");
      return false;
    }

    alert("Order is cancelled. Proceeding with deletion...");

    // Remove delivery ID from the order
    const removeDeliveryResponse = await fetch(
      `${process.env.BACKEND_URL}/api/removeDeliveryIDFromOrder/${deliveryId}`,
      { method: "POST", credentials: "include" }
    );

    if (!removeDeliveryResponse.ok) {
      // If there's an error removing the delivery ID from the order, handle it appropriately
      console.error("Error occurred while removing delivery ID from order");
      //alert("Error occurred while removing delivery ID from order");
      //return false;
    }

    alert("Delivery ID removed from order");

    const deletionResponse = await fetch(
      `${process.env.BACKEND_URL}/api/deliveriesCA2/${deliveryId}`,
      { method: "DELETE", credentials: "include" }
    );

    if (!deletionResponse.ok) {
      // If there's an error deleting the delivery, handle it appropriately
      console.error("Error occurred while deleting the delivery");
      alert("Error occurred while deleting the delivery");
      return false;
    }

    alert("Delivery deleted successfully");
    return true;

    // Additional client-side logic if needed
  } catch (error) {
    // Handle any unexpected errors that occur during the process
    console.error("Error occurred while handling deletion:", error);
    alert("An unexpected error occurred while handling deletion");
  }
}

export async function updateSingleDeliveryCA2(editFormData: any) {
  try {
    console.log("editFormData");

    console.log(editFormData);

    const deliveryId = editFormData.deliveryId;
    const deliveryAddress = editFormData.deliveryAddress;
    const deliveryDate = editFormData.deliveryTime;
    const deliveryStatusDetail = editFormData.deliveryStatusDetail;
    const deliveryShipper = editFormData.shipping.carrier;

    const data = {
      deliveryId: deliveryId,
      deliveryAddress: deliveryAddress,
      deliveryDate: deliveryDate,
      deliveryStatusDetail: deliveryStatusDetail,
      deliveryShipper: deliveryShipper,
    };

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/updateDeliveryCA2`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error: ${errorMessage}`);
    }

    const result = await response.json();
    console.log(result.message); // Output success message from the server

    // Additional client-side logic if needed
  } catch (error) {
    console.error(`Failed to update deliveries`);
    // Handle errors appropriately
  }
}

export async function retrieveArrayChartJS(
  selectedDropdownValueForm: any,
  choiceNum: any,
  date1False: any,
  date2False: any
) {
  console.log("selectedDropdownValueForm: " + selectedDropdownValueForm);

  const date1True = encodeURIComponent(date1False);
  const date2True = encodeURIComponent(date2False);

  try {
    const url0 = `${process.env.BACKEND_URL}/api/getDeliveriesSortedByStageNumChart0?selectedDropdownValueForm=${selectedDropdownValueForm}&choiceNum=${choiceNum}&date1True=${date1True}&date2True=${date2True}`;
    const url = `${process.env.BACKEND_URL}/api/chartJS1?selectedDropdownValueForm=${selectedDropdownValueForm}&choiceNum=${choiceNum}&date1True=${date1True}&date2True=${date2True}`;

    const [response0, response] = await Promise.all([
      fetch(url0, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }),
      fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }),
    ]);

    if (!response0.ok || !response.ok) {
      throw new Error("Failed to retrieve data");
    }

    const [data0, data] = await Promise.all([
      response0.json(),
      response.json(),
    ]);

    // Process data0
    console.log("data0: " + data0);

    // Process data
    console.log("data: " + data);

    const deliveryIds = data.map(
      (item: { deliveryid: any }) => item.deliveryid
    );
    const chartHeader = data.map(
      (item: { chartHeaderValue: any }) => item.chartHeaderValue
    );

    console.log("Delivery string list is" + deliveryIds);

    const deliveryIdsString = encodeURIComponent(JSON.stringify(deliveryIds));
    const chartHeaderString = encodeURIComponent(JSON.stringify(chartHeader));

    const getChartPart2URLSpecific = `${process.env.BACKEND_URL}/api/chartJSPart2Specific?deliveryIds=${deliveryIdsString}&chartHeaderString=${chartHeaderString}`;
    const getChartPart2URL = `${process.env.BACKEND_URL}/api/chartJSPart2?deliveryIds=${deliveryIdsString}&chartHeaderString=${chartHeaderString}`;

    const [getChartPart2URLResponseSpecific, getChartPart2URLResponse] =
      await Promise.all([
        fetch(getChartPart2URLSpecific, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(getChartPart2URL, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

    if (!getChartPart2URLResponseSpecific.ok || !getChartPart2URLResponse.ok) {
      throw new Error("Failed to retrieve additional data");
    }

    const [additionalDataPart2and3Ids, additionalDataPart2and3] =
      await Promise.all([
        getChartPart2URLResponseSpecific.json(),
        getChartPart2URLResponse.json(),
      ]);

    const groupedDeliveries = data0.reduce((acc: any, obj: any) => {
      const stageNum = obj.currentstagenum;
      const existingGroup = acc.find(
        (group: any) => group.currentstagenum === stageNum
      );

      if (existingGroup) {
        existingGroup.deliveries.push(obj);
        existingGroup.totalNum++;
      } else {
        acc.push({
          currentstagenum: stageNum,
          totalNum: 1,
          deliveries: [obj],
        });
      }

      console.log("For CHART 0 ACC START");
      //console.log(acc)

      return acc;
    }, []);

    // Sorting the grouped deliveries by currentStageNum
    groupedDeliveries.sort(
      (a: any, b: any) => a.currentstageNum - b.currentstageNum
    );
    console.log(groupedDeliveries);

    const additionalDataPart2ids =
      additionalDataPart2and3Ids.stageintervalSpecific;
    const additionalDataPart3ids = additionalDataPart2and3Ids.diffHoursSpecific;
    const additionalDataPart2 = additionalDataPart2and3.averagedDiffHours;
    const additionalDataPart3 = additionalDataPart2and3.summedLateHours;

    console.log("Data:", additionalDataPart2);
    console.log("DataNo2:", additionalDataPart3);
    console.log("DataNo3:", additionalDataPart2ids);
    console.log("DataNo4:", additionalDataPart3ids);

    const additionalDataPart2idsArr = Object.entries(
      additionalDataPart2ids
    ).map(([category, data]) => ({
      category,
      deliveries: (data as CategoryData).deliveries.map(
        (delivery: Delivery) => ({
          deliveryid: delivery.deliveryid,
          rows: delivery.rows.map((row: Row) => ({
            ...row,
            diff_ab_hours: parseFloat(row.diff_ab_hours),
            diff_bc_hours: parseFloat(row.diff_bc_hours),
            diff_cd_hours: parseFloat(row.diff_cd_hours),
          })),
        })
      ),
    }));

    const additionalDataPart3idsArr = Object.entries(
      additionalDataPart3ids
    ).map(([category, data]) => ({
      category,
      deliveries: (data as CategoryData).deliveries.map(
        (delivery: Delivery) => ({
          deliveryid: delivery.deliveryid,
          rows: delivery.rows.map((row: Row) => ({
            ...row,
            hour_difference: parseFloat(row.hour_difference),
          })),
        })
      ),
    }));

    console.log("DataNo3New:", additionalDataPart2idsArr);
    console.log("DataNo4New:", additionalDataPart3idsArr);
    console.log("Grouped Deliveries:", groupedDeliveries);

    return [
      additionalDataPart2,
      additionalDataPart3,
      additionalDataPart2idsArr,
      additionalDataPart3idsArr,
      groupedDeliveries,
    ];
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
}
