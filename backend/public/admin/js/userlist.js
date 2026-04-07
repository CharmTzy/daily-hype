function getUserData() {
    const token = localStorage.getItem('token');

    return fetch(`/api/getAllUserByAdmin?offset=${0}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('User data:', data.users);
            console.log(data.users);
            const newResult = [];
            if (data.users) {
                data.users.forEach((user) => {
                    newResult.push([user.userid, `<img src="${user['url']}" alt="User Image" style="width: 60px; height: 60px; border-radius:50%; object-fit:cover"></img>`, user.name, user.email, user.phone, user.address, user.region, user.createdat, user.updatedat, `<button class="btn btn-primary" onclick="editUser(${user.userid})">Edit</button> <button class="btn btn-danger" onclick="deleteUser(${user.userid})">Delete</button>`]);
                })
            }
            return newResult;
        })
        .catch((error) => {
            console.error(error);
            alert("Unknown Error");
            return [];
        });
}

