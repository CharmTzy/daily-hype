function loadTable(className, headers = [], data = []) {
    const table = document.getElementsByClassName(className)[0];
    let htmlStr = '<tr>';
    headers.forEach((text) => {
        htmlStr += `<th>${text}</th>`;
    });
    htmlStr += '</tr>';
    data.forEach((item) => {
        htmlStr += `<tr>`;
        item.forEach((text) => {
            htmlStr += `<td>${text}</td>`;
        });
        htmlStr += `</tr>`;
    });
    if (data.length <= 0) {
        htmlStr += `<tr><td colspan="${headers.length}">No Data Found!</td></tr>`;
    }
    table.innerHTML = htmlStr;
}
