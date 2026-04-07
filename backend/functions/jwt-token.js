const jwt = require("jsonwebtoken");

module.exports.generateRefreshToken = (obj, secretKey) => {
  return jwt.sign(obj, secretKey, { expiresIn: "7d" });
};

module.exports.generateAuthToken = (obj, secretKey) => {
  return jwt.sign(obj, secretKey, { expiresIn: "30m" });
};

module.exports.verifyJWTToken = (token, secretKey, callback) => {
  jwt.verify(token, secretKey, (err, data) => {
    if (err) {
      return callback(err, null);
    } else {
      return callback(null, data);
    }
  });
};

module.exports.decodeJWTToken = (token) => {
  return jwt.decode(token);
};
