// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const { errorMessages } = require("../errors");
const jwtFunctions = require("../functions/jwt-token");
const { parse } = require("cookie");

module.exports.validateToken = (req, res, next) => {
  let token = parse(req.headers.cookie || "").authToken;

  if (token) {
    jwtFunctions.verifyJWTToken(token, process.env.JWT_SECRET_KEY, (err, data) => {
      if (err) {
        console.error(`\n${err}`);
        if (err.name === "TokenExpiredError") {
          try {
            const decoded = jwtFunctions.decodeJWTToken(token);
            req.body.id = decoded.userId;
            req.headers.userid = decoded.userId;
            req.body.tokenExpired = true;
            next();
          } catch (error) {
            console.error(`\n${error}`);
            return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
          }
        } else if (err.name === "JsonWebTokenError") {
          return res.status(401).send({ error: errorMessages.INVALID_TOKEN });
        } else {
          return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
        }
      } else {
        req.body.id = data.userId;
        req.body.role = data.role;
        req.body.email = data.email;
        req.headers.userid = data.userId;
        
        if (req.body.id === undefined || req.body.role === undefined || req.body.email === undefined) {
          req.body.tokenExpired = true;
        } else {
          req.body.tokenExpired = false;
        }

        next();
      }
    });
  } else {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }
};
