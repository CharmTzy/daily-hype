/* Name: Wai Yan Aung
Admin No: 2234993
Date: 2.11.2023 */

const bcrypt = require("bcrypt");
const { query } = require("../database");
const { EMPTY_RESULT_ERROR, SQL_ERROR_CODE } = require("../errors");
const cloudinary = require("../cloudinary");

module.exports.checkLogin = function checkLogin(loginEmail, loginPassword) {
  const sql = `
        SELECT u.email, u.userID, u.name, u.password, i.url, r.rolename, u.verified_email, u.method
        FROM appuser u
        LEFT JOIN image i ON i.imageid= u.imageid
        JOIN role r ON u.roleid = r.roleid
        WHERE u.email = $1 AND u.status= 'active' AND method='normal'`;
  return query(sql, [loginEmail]).then(function (result) {
    const rows = result.rows;

    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`Email ${loginEmail} not found!`);
    }

    const retrievedPasswordHash = rows[0].password;

    return bcrypt.compare(loginPassword, retrievedPasswordHash).then(function (isMatch) {
      const isVerifiedEmail = rows[0].verified_email;
      if (!isMatch) {
        throw new Error("Incorrect password");
      } else if (!isVerifiedEmail) {
        throw new Error("Email not verified");
      }
      return rows[0];
    });
  });
};

module.exports.updatePassword = function updatePassword(email, newPassword) {
  return bcrypt.hash(newPassword, 10).then(function (hashedPassword) {
    const sql = `
      UPDATE appuser 
      SET password = $1
      WHERE email = $2 AND method = 'normal'
      RETURNING *`;

    return query(sql, [hashedPassword, email])
      .then((result) => {
        if (result.rows.length > 0) {
          return result.rows[0];
        } else {
          // Handle the case when the user with the given email does not exist
          throw new Error("User not found");
        }
      })
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.signup = function signup(name, email, password, phone, gender) {
  const defaultRole = "customer";
  const defaultStatus = "active";
  const method = 'normal';
  return bcrypt.hash(password, 10).then(function (hashedPassword) {
    const checkRoleQuery = "SELECT roleid FROM role WHERE rolename = $1 ";

    return query(checkRoleQuery, [defaultRole])
      .then((result) => {
        let roleId;

        if (result.rows.length > 0) {
          roleId = result.rows[0].roleid;

          const sql = `
            INSERT INTO appuser (createdat, name, email, password, phone, gender, roleid, status, method)
            VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`;

          return query(sql, [name, email, hashedPassword, phone, gender, roleId, defaultStatus,method]).catch(function (error) {
            throw error;
          });
        } else {
          // Handle the case when the role does not exist
          throw new Error("Role does not exist");
        }
      })
      .catch((error) => {
        throw error;
      });
  });
};

module.exports.saveVerificationCode = function saveVerificationCode(code, email) {
  const sql = "UPDATE appuser SET code = $1, createdcodeat = NOW() WHERE email = $2 AND method = 'normal' RETURNING *";
  return query(sql, [code, email]).catch(function (error) {
    throw error;
  });
};

module.exports.verification = function verification(code, email) {
  const sql = `SELECT u.email, u.userID, u.name, i.url, r.rolename, u.code, u.method
      FROM appuser u
      JOIN role r ON r.roleid = u.roleid 
      LEFT JOIN image i ON i.imageid= u.imageid
      WHERE u.roleid = r.roleid
      AND u.email = $1 AND method = 'normal'
  `;
  return query(sql, [email]).then(function (result) {
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    const storedCode = result.rows[0].code;

    if (storedCode == code) {
      // Update verified_email to true in the database
      const updateSql = "UPDATE appuser SET verified_email = true WHERE email = $1";
      return query(updateSql, [email])
        .then(function () {
          return result.rows[0];
        })
        .catch(function (updateError) {
          console.error("Error updating verified_email:", updateError);
          throw new Error("Error updating verified_email");
        });
    } else {
      return null;
    }
  });
};

module.exports.signupGoogle = function signupGoogle(id, name, email, verified_email, picture) {
  function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    return formattedDateTime;
  }
  const currentDateTime = getCurrentDateTime();
  const defaultStatus = "active";
  const method = 'google';
  const sql = `WITH inserted_user AS (
        INSERT INTO appuser(createdat, userid, name, email, verified_email, roleid, imageid,status,method)
        VALUES(NOW(), $1, $2, $3, $4, 3 , $5 , $7 , $8)
        RETURNING *
      )
      INSERT INTO image(imageid, imagename, url)
      VALUES ($5, 'Google Photo' , $6)
      RETURNING *;`;
  return query(sql, [id, name, email, verified_email, currentDateTime, picture, defaultStatus,method]).catch(function (error) {
    throw error;
  });
};
/* 
module.exports.loginGoogle = function loginGoogle(email) {
  const sql = "SELECT * FROM appuser WHERE email = $1 AND status = 'active' AND method = 'google'";
  return query(sql, [email])
    .then(function (result) {
      const rows = result.rows;

      if (rows.length === 0) {
        throw new EMPTY_RESULT_ERROR(`Email ${email} not found or user is not active!`);
      }

      return rows[0];
    })
    .catch(function (error) {
      throw error;
    });
}; */
module.exports.signupFacebook = function signupFacebook(id, name, email, verified_email, picture) {
  function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    return formattedDateTime;
  }
  const currentDateTime = getCurrentDateTime();
  const defaultStatus = "active";
  const method = 'facebook';
  const sql = `
  WITH inserted_user AS (
        INSERT INTO appuser(createdat, userid, name, email, verified_email, roleid, imageid,status, method)
        VALUES(NOW(), $1, $2, $3, $4, 3 , $5 , $7, $8)
        RETURNING *
      )
      INSERT INTO image(imageid, imagename, url)
      VALUES ($5, 'Facebook Photo' , $6)
      RETURNING *;`;
  return query(sql, [id, name, email, verified_email, currentDateTime, picture, defaultStatus,method]).catch(function (error) {
    throw error;
  });
};

module.exports.checkExistingUser = function checkExistingUser(email, method) {
  const sql = `SELECT u.*, r.rolename, i.url FROM appuser u
            LEFT JOIN image i ON i.imageid= u.imageid
            JOIN role r on r.roleid = u.roleid
            WHERE email = $1 AND status = 'active' AND method = $2`;

  return query(sql, [email, method])
    .then(function (result) {
      const rows = result.rows;
      if (rows.length === 0) {
        return null;
      } else {
        return rows[0];
      }
    })
    .catch(function (error) {
      throw new Error("Error checking for existing user: " + error.message);
    });
};

//ADMIN PART
module.exports.getUserByAdmin = (offset, limit) => {
  const sql = `
      SELECT a.userid, i.url, a.name, a.email, a.phone, a.createdat, r.rolename, ad.building, ad.street,ad.unit_no, ad.postal_code, ad.region, a.status
      FROM appuser a
      LEFT JOIN image i ON i.imageid = a.imageid
      JOIN role r ON a.roleid = r.roleid 
      LEFT JOIN address ad ON a.userid = ad.userid AND ad.is_default = true
      ORDER BY a.userid
      LIMIT $1 OFFSET $2
    `;

  return query(sql, [limit, offset]).then((result) => result.rows);
};

module.exports.getUserCountByAdmin = () => {
  const sql = `
        SELECT COUNT(*) AS count FROM appuser 
    `;

  return query(sql, []).then((result) => result.rows[0].count);
};

/* 
module.exports.getUserByAdmin = function getUserByAdmin(offset) {
  const sql = `
    SELECT a.userid, i.url, a.name, a.email, a.phone, a.address, a.region, a.createdat, a.updatedat
    FROM appuser a
    LEFT JOIN image i ON i.imageid = a.imageid
    WHERE a.role = 'customer'
    ORDER BY userid
    OFFSET $1
    `;

  return query(sql, [offset]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`User Not Found`);
    }
    return rows;
  });
}; */

module.exports.createUser = function createUser(user) {
  const { name, email, password, phone, gender, role, photoUrl } = user;
  console.log("THIS IS USER");

  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return formattedDateTime;
  }

  const currentDateTime = getCurrentDateTime();
  const status = "active";
  const method = "normal";
  const verified_email = true;
  const saltRounds = 10;

  if (!photoUrl) {

    return bcrypt.hash(password, saltRounds)
      .then((hashedPassword) => {
        const sqlUserWithoutImage = `
        WITH role_info AS (
          SELECT roleid FROM role WHERE rolename = $6
        ),
        inserted_user AS (
          INSERT INTO appuser (name, email, password, phone, gender, roleid, status, method,verified_email)
          SELECT $1, $2, $3, $4, $5, role_info.roleid, $7, $8,$9
          FROM role_info
          RETURNING userid
        )
        SELECT inserted_user.userid
        FROM inserted_user;
      `;
      const valuesUserWithoutImage = [name, email, hashedPassword, phone, gender, role, status, method, verified_email];
        return query(sqlUserWithoutImage, valuesUserWithoutImage)
          .then((result) => {
            const { userid } = result.rows[0];
            return { userid };
          })
          .catch((error) => {
            console.error("Error inserting user without image:", error);
            throw error;
          });
      })
      .catch((hashError) => {
        console.error("Error hashing password:", hashError);
        throw hashError;
      });
  } else {
    return bcrypt.hash(password, saltRounds)
      .then((hashedPassword) => {
        const sqlUserWithImage = `
          WITH role_info AS (
            SELECT roleid FROM role WHERE rolename = $6
          ),
          inserted_user AS (
            INSERT INTO appuser (name, email, password, phone, gender, roleid, status, method, imageid,verified_email)
            SELECT $1, $2, $3, $4, $5, role_info.roleid, $7, $8, $9,$11
            FROM role_info
            RETURNING userid
          ),
          inserted_image AS (
            INSERT INTO image (imageid, imagename, url)
            VALUES ($9, 'User Photo', $10)
            RETURNING imageid
          )
          SELECT inserted_user.userid, inserted_image.imageid
          FROM inserted_user, inserted_image;
        `;
        const valuesUserWithImage = [name, email, hashedPassword, phone, gender, role, status, method, currentDateTime, photoUrl, verified_email];

        return query(sqlUserWithImage, valuesUserWithImage)
          .then((result) => {
            const { userid, imageid } = result.rows[0];
            return { userid, imageid };
          })
          .catch((error) => {
            console.error("Error inserting user and image:", error);
            throw error;
          });
      })
      .catch((hashError) => {
        console.error("Error hashing password:", hashError);
        throw hashError;
      });
  }
};

module.exports.fetchUserData= function fetchUserData(userId,callback) {
  const sql = `
      SELECT a.userid, a.name, a.email, a.phone, a.gender, a.roleid, r.rolename, a.status
      FROM appuser a
      JOIN role r ON a.roleid = r.roleid
      WHERE a.userid = $1
    `;

  query(sql, [userId])
    .then((result) => {
      if (result.rows.length === 0) {
        callback(null, null); // User not found
      } else {
        const userData = {
          userId: result.rows[0].userid,
          email: result.rows[0].email,
          name: result.rows[0].name,
          phone: result.rows[0].phone,
          gender: result.rows[0].gender,
          role: result.rows[0].rolename,
          status: result.rows[0].status
        };
        callback(null, userData); // User data fetched successfully
      }
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
      callback(error, null); // Error fetching user data
    });
};

module.exports.getRoleID = (rolename) => {
  const sql = `
      SELECT * FROM role WHERE rolename = $1
  `;

  return query(sql, [rolename]).then((result) => result.rows[0])
  .catch((error) => {
    console.error(error);
    throw error;
  });
}

module.exports.updateUserData = function updateUserData(userId, updatedUserData, roleid, callback) {
  const { name, email, phone, gender, role, status } = updatedUserData;

  console.log("role", role);
  console.log(status);
  const sql = `
    UPDATE appuser SET name = $1, phone = $2, gender = $3, roleid = $4, status = $5
    WHERE userid = $6
    RETURNING *
  `;

  query(sql, [name, phone, gender, roleid, status, userId])
    .then((result) => {
      console.log(result);
      if (result.rows.length === 0) {
        callback(null, null);
      } else {
        const updatedUser = {
          userId: result.rows[0].userid,
          email: result.rows[0].email,
          name: result.rows[0].name,
          phone: result.rows[0].phone,
          gender: result.rows[0].gender,
          status: result.rows[0].status
        };
        callback(null, updatedUser); // User data updated successfully
      }
    })
    .catch((error) => {
      console.error('Error updating user data:', error);
      callback(error, null); // Error updating user data
    });
};


module.exports.deleteUser = function deleteUser(userid) {
  const sql = `UPDATE appuser SET status = 'deleted' WHERE userid = $1 RETURNING *`;

  return query(sql, [userid]).then((result) => {
    const deletedUser = result.rows[0];

    if (!deletedUser) {
      throw new EMPTY_RESULT_ERROR("User not found");
    }

    return deletedUser;
  });
};

module.exports.updateUserImage = function updateUserImage(imageid, email) {
  const sql = `
        UPDATE appuser SET imageid = $1 WHERE email = $2
    `;

  return query(sql, [imageid, email]).then((result) => {
    const rows = result.rowCount;
    if (rows === 0) {
      throw new EMPTY_RESULT_ERROR(`User Image Update Failed`);
    }
    return rows;
  });
};

module.exports.getTotalUserByAdmin = function getTotalUserByAdmin(startDate, endDate) {
  const sql = `
        SELECT COUNT(userid) 
        FROM appuser 
        WHERE createdat >= $1 AND createdat <= $2::timestamp + interval '1 day';
    `;

  return query(sql, [startDate, endDate]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`There is no user in the database`);
    }
    return rows;
  });
};

module.exports.getUserCreationData = function getUserCreationData(startDate, endDate) {
  const sql = `
        SELECT
            TO_CHAR(createdat, 'YYYY-MM-DD') AS creation_day,
            COUNT(userid) AS user_count
        FROM
            appuser
        WHERE
            createdat >= $1 AND createdat <= $2::timestamp + interval '1 day'
        GROUP BY
            creation_day
        ORDER BY
            creation_day;
    `;

  return query(sql, [startDate, endDate]).then(function (result) {
    const rows = result.rows;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`No user creation data available for the specified date range`);
    }
    return rows;
  });
};

module.exports.getGenderStatistics = function (callback) {
  const sqlMale = `SELECT COUNT(*) as gender FROM appuser WHERE gender = 'M'`;

  query(sqlMale, [], (error, maleResults) => {
    if (error) {
      return callback(error, null);
    }

    const maleCount = maleResults.rows[0].gender;

    // Perform another query for female count
    const sqlFemale = `SELECT COUNT(*) as gender FROM appuser WHERE gender = 'F'`;

    query(sqlFemale, [], (error, femaleResults) => {
      if (error) {
        return callback(error, null);
      }

      const femaleCount = femaleResults.rows[0].gender;

      const statistics = {
        male: maleCount,
        female: femaleCount,
      };

      callback(null, statistics);
    });
  });
};

/**
 * retrieves user revenue statistics grouped by quarter, year, and gender.
 * @param {number} year - the specific year for which you want to generate the report
 * @param {number} gender - the gender filter for the report
 * @returns {Object[]} - returns order revenue reports for each quarter, year and gender
 */
module.exports.getUserRevenueStatByQuarter = (year) => {
  const sql = `
    SELECT
      EXTRACT(QUARTER FROM u.createdat) AS quarter,
      EXTRACT(YEAR FROM u.createdat) AS year,
      COUNT(u.userid) AS revenue,
      u.gender
    FROM
      appuser u
    WHERE
      EXTRACT(YEAR FROM u.createdat) = $1
    GROUP BY quarter, year, u.gender ORDER BY year, quarter;
  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      throw error;
    });
};

module.exports.getUserStatByMonth = (year) => {
  const sql = `
      SELECT
      EXTRACT(MONTH FROM u.createdat) AS month,
      EXTRACT(YEAR FROM u.createdat) AS year,
      COUNT(u.userid) AS revenue,
      u.gender
    FROM
      appuser u
    WHERE
      EXTRACT(YEAR FROM u.createdat) = $1
    GROUP BY month, year, u.gender
    ORDER BY year, month;

  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      throw error;
    });
};

//END OF ADMIN PART
//ADDRESS BOOK
const postalCodeRegions = [
  {
    region: "Business District",
    postalCodes: ["01XXXX", "02XXXX", "03XXXX", "04XXXX", "05XXXX", "06XXXX", "07XXXX", "08XXXX", "17XXXX"],
  },
  { region: "Central South", postalCodes: ["14XXXX", "15XXXX", "16XXXX"] },
  { region: "South", postalCodes: ["09XXXX", "10XXXX"] },
  { region: "South West", postalCodes: ["11XXXX", "12XXXX", "13XXXX"] },
  { region: "City", postalCodes: ["18XXXX", "19XXXX"] },
  {
    region: "Central",
    postalCodes: ["20XXXX", "21XXXX", "22XXXX", "23XXXX", "24XXXX", "25XXXX", "26XXXX", "27XXXX", "28XXXX", "29XXXX", "30XXXX", "31XXXX", "32XXXX", "33XXXX"],
  },
  {
    region: "Central East",
    postalCodes: ["34XXXX", "35XXXX", "36XXXX", "37XXXX", "38XXXX", "39XXXX", "40XXXX", "41XXXX"],
  },
  {
    region: "East Coast",
    postalCodes: ["42XXXX", "43XXXX", "44XXXX", "45XXXX", "46XXXX", "47XXXX", "48XXXX"],
  },
  { region: "Upper East Coast", postalCodes: ["49XXXX", "50XXXX", "81XXXX"] },
  { region: "North East", postalCodes: ["53XXXX", "54XXXX", "55XXXX", "82XXXX"] },
  { region: "Central North", postalCodes: ["56XXXX", "57XXXX"] },
  { region: "Central West", postalCodes: ["58XXXX", "59XXXX"] },
  { region: "Far West", postalCodes: ["60XXXX", "61XXXX", "62XXXX", "63XXXX", "64XXXX"] },
  { region: "North West", postalCodes: ["65XXXX", "66XXXX", "67XXXX", "68XXXX"] },
  { region: "Far North West", postalCodes: ["69XXXX", "70XXXX", "71XXXX"] },
  { region: "Far North", postalCodes: ["72XXXX", "73XXXX", "75XXXX", "76XXXX"] },
  { region: "North", postalCodes: ["77XXXX", "78XXXX"] },
  { region: "North East", postalCodes: ["79XXXX", "80XXXX", "51XXXX", "52XXXX"] },
];
// Reference: https://danielchoy.blogspot.com/2017/03/singapore-postal-codes-and-district.html

const getRegionByPostalCode = (postalCode) => {
  const firstTwoDigits = postalCode.substring(0, 2);

  const foundRegion = postalCodeRegions.find(({ postalCodes }) => postalCodes.some((code) => code.startsWith(firstTwoDigits)));
  return foundRegion ? foundRegion.region : null;
};

module.exports.addNewAddress = function addNewAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userid, is_default) {
  const region = getRegionByPostalCode(postal_code);

  if (!region) {
    return Promise.reject(new Error("Invalid postal code"));
  }

  return query("UPDATE address SET is_default = false WHERE userid = $1 AND is_default = true", [userid])
    .then(() => {
      let sql = `
        INSERT INTO address (fullname, phone, postal_code, block_no, street, building, unit_no, region, userid, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING address_id`;

      return query(sql, [fullname, phone, postal_code, block_no, street, building, unit_no, region, userid, is_default]);
    })
    .catch((error) => {
      console.error("Error creating address:", error);

      throw error;
    });
};

module.exports.checkExistingAddress = function checkExistingAddress(fullname, phone, postal_code,block_no, street, building, unit_no, userid) {
  const sql = `
    SELECT a.*
    FROM address a
    WHERE fullname = $1
      AND phone = $2
      AND postal_code = $3
      AND block_no = $4
      AND street = $5
      AND building = $6
      AND unit_no = $7
      AND userid = $8
  `;

  return query(sql, [fullname, phone, postal_code, block_no, street, building, unit_no, userid])
    .then(function (result) {
      const rows = result.rows;
      if (rows.length === 0) {
        return null;
      } else {
        return rows[0];
      }
    })
    .catch(function (error) {
      throw new Error("Error checking for existing address: " + error.message);
    });
};

/**
 * get all address by userid
 * @param {*} userId - user id of the user (int)
 * @returns - array of objects [{address_id, postal_code, street, building, unit_no, region, userid, fullname, phone, is_default}]
 */
module.exports.getAllAddressesByUserId = function getAllAddressesByUserId(userId) {
  const addressSql = `SELECT * FROM address WHERE userid = $1`;

  return query(addressSql, [userId])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.deleteAddress = function deleteAddress(addressId, userId) {
  console.log(userId);
  const deleteAddressSql = `
    DELETE FROM address
    WHERE address_id = $1 AND userid = $2
    RETURNING address_id`;

  return query(deleteAddressSql, [addressId, userId])
    .then((result) => {
      const deletedAddressId = result.rows[0]?.address_id;
      return deletedAddressId;
    })
    .catch((error) => {
      console.error("Error deleting address:", error);
      throw error;
    });
};

module.exports.getAddressDetails = function getAddressDetails(addressId, userId) {
  const addressSql = `
    SELECT *
    FROM address
    WHERE userid = $1 AND address_id = $2 `;

  return query(addressSql, [userId, addressId])
    .then((addressResult) => {
      const address = addressResult.rows[0];
      return address;
    })
    .catch((error) => {
      console.error("Error fetching address details:", error);
      throw error;
    });
};

module.exports.editAddress = function editAddress(addressId, userId, fullname, phone, postal_code, block_no, street, building, unit_no, is_default) {
  const Edit_region = getRegionByPostalCode(postal_code);
  console.log("MODEL", addressId, userId, fullname, phone, postal_code, street, building, unit_no, Edit_region, is_default);
  let sql = `
    UPDATE address
    SET fullname = $3, phone = $4, postal_code = $5, block_no = $6, street = $7, building = $8, unit_no = $9, region = $10
    WHERE address_id = $1 AND userid = $2
    RETURNING *`;

  return query(sql, [addressId, userId, fullname, phone, postal_code,block_no, street, building, unit_no, Edit_region])
    .then((result) => {
      const updatedAddress = result.rows[0];

      if (is_default) {
        sql = `
          UPDATE address
          SET is_default = false
          WHERE userid = $1 AND address_id != $2`;

        return query(sql, [userId, addressId])
          .then(() => {
            sql = `
              UPDATE address
              SET is_default = true
              WHERE address_id = $1`;

            return query(sql, [addressId])
              .then(() => updatedAddress)
              .catch((error) => {
                console.error("Error updating address with default:", error);
                throw error;
              });
          })
          .catch((error) => {
            console.error("Error updating addresses to set default:", error);
            throw error;
          });
      } else {
        return updatedAddress;
      }
    })
    .catch((error) => {
      console.error("Error updating address:", error);
      throw error;
    });
};

//END OF ADDRESS BOOK WYA

// Name: Zay Yar Tun

module.exports.getUserByUserID = function getUserByUserID(userID) {
  const sql = `
    SELECT u.*, r.rolename FROM appuser u, role r WHERE u.roleid = r.roleid AND u.userid = $1
  `;

  return query(sql, [userID]).then((result) => {
    const rows = result.rows;
    return rows[0];
  });
};

module.exports.getUserAddressByIdEmail = function getUserAddressByIdEmail(userID, email) {
  const sql = `
        SELECT address FROM AppUser WHERE userID = $1 AND email = $2
    `;

  return query(sql, [userID, email])
    .then(function (result) {
      const rows = result.rows;
      if (rows.length === 0) {
        throw new Error("User Not Found");
      }
      return rows[0];
    })
    .catch(function (error) {
      console.error(error);
      throw new Error("Unknown Error");
    });
};

/**
 * get refresh token from database
 * @param {*} userID - user id of the user (int)
 * @returns - refresh token (string)
 */
module.exports.getRefreshToken = (userID) => {
  const sql = `
        SELECT refreshtoken FROM appuser WHERE userid = $1
    `;

  return query(sql, [userID])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

/**
 * store refresh token in database
 * @param {*} userID - user id of the user (int)
 * @param {*} refreshToken - refresh token for the user (string)
 * @returns - updated record count (int)
 */
module.exports.storeRefreshToken = (userID, refreshToken) => {
  const sql = `
    UPDATE appuser SET refreshtoken = $1 WHERE userid = $2
  `;

  return query(sql, [refreshToken, userID])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// Name: Zay Yar Tun
