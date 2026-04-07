// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 1.12.2023
// Description: This is the collection of frontend functions for order statistics

const token = localStorage.getItem('token');

function loadCategory() {
    return fetch(`/api/distinctcategory`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            return result.category;
        })
        .catch((error) => {
            console.error(error);
            alert("Error in getting category name");
        })
}

function loadProduct() {
    return fetch(`/api/distinctproduct`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            return result.product;
        })
        .catch((error) => {
            console.error(error);
            alert("Error in getting product name");
        })
}

function getStatisticsData() {
    fetch(`/api/orderstats?startdate=${startdate.value}&enddate=${enddate.value}&region=${cboregion.value}&productid=${cboproduct.value}&categoryid=${cbocategory.value}&gender=${cbogender.value}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((data) => {
            updateChart(data.stat);
        })
}

function updateChart(data) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    console.log(data);

    const maleData = [];
    const femaleData = [];
    const labels = [];

    data.forEach((item) => {
        if (!labels.includes(months[item.month - 1])) {
            labels.push(months[item.month - 1]);
            maleData.push(0);
            femaleData.push(0);
        }
    })

    data.forEach((item) => {
        for (let i = 0; i < labels.length; i++) {
            if (months[item.month - 1] === labels[i]) {
                if (item.gender.toLowerCase() === 'm') {
                    maleData[i] = item.count;
                    break;
                }
                if (item.gender.toLowerCase() === 'f') {
                    femaleData[i] = item.count;
                    break;
                }
            }
        }
    })

    chart.data.labels = labels;
    chart.data.datasets = [];

    if (maleData.length > 0) {
        chart.data.datasets.push({
            label: 'Male',
            data: maleData,
            borderWidth: 1
        })
    }

    if (femaleData.length > 0) {
        chart.data.datasets.push({
            label: 'Female',
            data: femaleData,
            borderWidth: 1
        })
    }

    chart.update();
}

function handleClick(event, elements) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    console.log(elements);
    if (elements.length > 0) {
        const datasetindex = elements[0].datasetIndex;
        const dataindex = elements[0].index;
        const clickedData = chart.data.labels[dataindex];
        let index = months.findIndex(m => m === clickedData);
        const datasetLabel = chart.data.datasets[datasetindex].label;
        if (index !== -1) {
            index++;
            getOrderByMonth(index, datasetLabel)
                .then((result) => {
                    if (result && result.length > 0) {
                        const newData = [];
                        result.forEach((item) => {
                            if (item.gender.toLowerCase() === 'm') {
                                newData.push([item.orderid, item.name, "Male", item.totalqty, '$' + parseFloat(item.totalamount).toFixed(2)]);
                            }
                            else {
                                newData.push([item.orderid, item.name, "Female", item.totalqty, '$' + parseFloat(item.totalamount).toFixed(2)]);
                            }
                        })
                        loadTable("orderreporttable", headers, newData);
                    }
                })
        }
    }
}

function getOrderByMonth(month, gender) {
    console.log(gender);
    return fetch(`/api/orderStatsByMonth?month=${month}&gender=${gender}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
            return result.stat;
        })
}