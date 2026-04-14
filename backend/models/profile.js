const { query } = require("../database");
const bcrypt = require('bcrypt');
module.exports.retrieveProfileData = function retrieveProfileData(email) {
    const sql = `SELECT a.email, a.name, a.gender, a.phone, i.url FROM appuser a LEFT JOIN image i ON a.imageid = i.imageid WHERE email = $1`;
    return query(sql, [email]).then(function (result) {
        const rows = result.rows;
        if (rows.length === 0) {
            throw new Error(`User with email ${email} not found!`);
        }
        var userData = {
            email: rows[0].email,
            name: rows[0].name,
            gender: rows[0].gender,
            phone: rows[0].phone,
            address: rows[0].address,
            region: rows[0].region,
            url: rows[0].url
        };
        return userData;
    });
};
module.exports.updateProfile = function updateProfile(email, profileData) {
    const updateProfileQuery = `
        UPDATE appuser
        SET name = $1,  gender = $2, phone = $3 ,updatedat = NOW()
        WHERE email = $4
        RETURNING email
    `;
    const { name, gender, phone } = profileData;
    return query(updateProfileQuery, [name, gender, phone, email])
        .then(updateProfileResult => {
        if (updateProfileResult.rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`User with email ${email} not found!`);
        }
        return updateProfileResult.rows[0].email;
    });
};
module.exports.checkAndUpdatePassword = function checkAndUpdatePassword(email, oldPassword, newPassword) {
    const currentPasswordQuery = `
        SELECT password FROM appuser WHERE email = $1
    `;
    return query(currentPasswordQuery, [email])
        .then(currentPasswordResult => {
        if (currentPasswordResult.rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`User with email ${email} not found!`);
        }
        const hashedCurrentPassword = currentPasswordResult.rows[0].password;
        return bcrypt.compare(oldPassword, hashedCurrentPassword);
    })
        .then(passwordMatch => {
        if (!passwordMatch) {
            console.error('Old password is incorrect');
            throw new Error('Old password is incorrect');
        }
        return bcrypt.hash(newPassword, 10);
    })
        .then(hashedNewPassword => {
        const updatePasswordQuery = `
                UPDATE appuser
                SET password = $1
                WHERE email = $2
                RETURNING email
            `;
        return query(updatePasswordQuery, [hashedNewPassword, email]);
    })
        .then(updatePasswordResult => {
        if (updatePasswordResult.rows.length === 0) {
            throw new EMPTY_RESULT_ERROR(`User with email ${email} not found!`);
        }
        return updatePasswordResult.rows[0].email;
    });
};
module.exports.retrievePhoto = function retrievePhoto(email) {
    const sql = `SELECT i.url FROM image i
               JOIN appuser a ON i.imageid = a.imageid WHERE email = $1`;
    return query(sql, [email])
        .then(function (result) {
        const rows = result.rows;
        if (rows.length === 0) {
            console.log('There is no photo');
            return null;
        }
        return rows[0].url;
    })
        .catch(function (error) {
        console.error(error);
        throw error;
    });
};
module.exports.deleteAccount = function deleteAccount(userid, password) {
    const getPasswordQuery = 'SELECT password FROM appuser WHERE userid = $1';
    return query(getPasswordQuery, [userid])
        .then(result => {
        const user = result.rows[0];
        if (!user) {
            throw new Error('User not found');
        }
        return bcrypt.compare(password, user.password);
    })
        .then(passwordMatch => {
        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }
        const deleteAccountQuery = `UPDATE appuser SET status = 'deleted' WHERE userid = $1`;
        return query(deleteAccountQuery, [userid]);
    });
};
