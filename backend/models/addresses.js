const { query } = require("../database");

// Name: Zay Yar Tun

module.exports.getAddresses = (addressID, userID) => {
  const sql = `
        SELECT * FROM address WHERE address_id = $1 AND userid = $2
    `;

  return query(sql, [addressID, userID])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// Name: Zay Yar Tun
