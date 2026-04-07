// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 28.11.2023
// Description: To manage all frontend javascript functions related to table (admin)

// generating table data ui
// require => className, headers, data
// className => table classname you give
// headers => an array of string you want to set column headers e.g. ["No.", "Name", ...]
// data => two dimensional array of data e.g. [[1, "Hello", ...], [2, "World", ...], ...]
function loadTable(className, headers = [], data = []) {
    const table = document.getElementsByClassName(className)[0];
    let htmlStr = '<tr>';
    headers.forEach((text) => {
        htmlStr += `<th>${text}</th>`;
    })
    htmlStr += '</tr>';
    data.forEach((item) => {
        htmlStr += `<tr>`;
        item.forEach((text) => {
            htmlStr += `<td>${text}</td>`;
        })
        htmlStr += `</tr>`;
    })
    if (data.length <= 0) {
        htmlStr += `<tr><td colspan="${headers.length}">No Data Found!</td></tr>`;
    }
    table.innerHTML = htmlStr;
}