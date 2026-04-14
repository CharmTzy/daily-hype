const token = localStorage.getItem('token');
function loadProductStats() {
    return fetch(`/api/productStat`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => response.json())
        .then((result) => {
        return result.stat;
    })
        .catch((error) => {
        console.error(error);
        alert("Error in getting product stats");
    });
}
function updateChart(data) {
    const newData = [];
    const labels = [];
    data.forEach((item) => {
        labels.push(item.categoryname);
        newData.push(item.count);
    });
    chart.data.labels = labels;
    chart.data.datasets = [];
    if (newData.length > 0) {
        chart.data.datasets.push({
            label: 'Category Name',
            data: newData,
            borderWidth: 1
        });
    }
    chart.update();
}
