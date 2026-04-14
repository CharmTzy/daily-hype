function loadPagination(total = 0, current = 1, func = null) {
    const pagination = document.getElementsByClassName('pagination')[0];
    pagination.innerHTML = '';
    const maxButtons = 4;
    if (isNaN(total)) {
        total = 0;
    }
    if (isNaN(current)) {
        current = 0;
    }
    if (total <= 0) {
        pagination.style.display = "none";
    }
    else {
        pagination.style.display = "flex";
    }
    let buttons = [];
    if (total > maxButtons) {
        let start = Math.max(1, current - 2);
        let end = Math.min(total, start + maxButtons);
        let diff = maxButtons - (end - start);
        if (diff !== 0) {
            start -= diff;
        }
        for (let i = start; i <= end; i++) {
            buttons.push(i);
        }
        if (start > 1) {
            buttons.splice(0, -1, "...");
        }
        if (end < total) {
            buttons.splice(buttons.length, 1, "...");
        }
    }
    else {
        for (let i = 1; i <= total; i++) {
            buttons.push(i);
        }
    }
    buttons.forEach((page) => {
        const button = document.createElement('button');
        button.textContent = page;
        if (page === '...') {
            button.classList.add('dot');
        }
        else if (page === current) {
            button.classList.add('active');
        }
        else {
            if (func === null) {
                button.onclick = () => changePage(total, page);
            }
            else {
                button.onclick = () => changePage(total, page, func);
            }
        }
        pagination.appendChild(button);
    });
}
function changePage(total = 0, current = 1, func = null) {
    if (func !== null) {
        func(current);
    }
    loadPagination(total, current, func);
}
