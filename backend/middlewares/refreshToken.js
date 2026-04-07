// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const userModel = require("../models/users");
const jwtFunctions = require("../functions/jwt-token");
const cookieFunctions = require("../functions/cookies");
const { errorMessages } = require("../errors");

module.exports.refreshToken = (req, res, next) => {
  const userID = req.body.id;
  if (userID === null) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  // if token is expired, refresh the token
  if (req.body.tokenExpired) {
    delete req.body.tokenExpired;
    console.log("\nExpired Token");
    Promise.all([userModel.getRefreshToken(userID), userModel.getUserByUserID(userID)])
      .then(([result1, result2]) => {
        jwtFunctions.verifyJWTToken(result1.refreshtoken, process.env.JWT_REFRESH_KEY, (err, data) => {
          if (err) {
            console.error(`\n${err}`);
            if (err.name === "TokenExpiredError") {
              return res.status(401).send({ error: errorMessages.TOKEN_EXPIRED });
            } else {
              return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
            }
          } else {
            const lastCreatedAt = new Date(data.lastcreatedat);
            lastCreatedAt.setDate(lastCreatedAt.getDate() + 7);
            const diff = Math.floor((lastCreatedAt - new Date()) / (1000 * 60));
            const newAuthToken = jwtFunctions.generateAuthToken({ email: result2.email, userId: result2.userid, role: result2.rolename }, process.env.JWT_SECRET_KEY);

            if (diff < 0) {
              return res.status(403).send({ error: errorMessages.TOKEN_EXPIRED });
            }

            req.body.email = result2.email;
            req.body.role = result2.rolename;
            if (diff > 0 && diff < 60 * 24) {
              // generate a new refresh token if two days left
              const newRefreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);
              userModel
                .storeRefreshToken(result2.userid, newRefreshToken)
                .then((result) => {
                  if (result === 1) {
                    cookieFunctions.setHttpOnlyCookieHeader("authToken", newAuthToken, res);
                    next();
                  } else {
                    return res.status(500).send({ error: errorMessages.UNKNOWN_ERROR });
                  }
                })
                .catch((error) => {
                  console.error(`\n${error}`);
                  return res.status(500).send({ error: errorMessages.UNKNOWN_ERROR });
                });
            } else {
              cookieFunctions.setHttpOnlyCookieHeader("authToken", newAuthToken, res);
              next();
            }
          }
        });
      })
      .catch((error) => {
        console.error(`\n${error}`);
        return res.status(500).send({ error: errorMessages.UNKNOWN_ERROR });
      });
  } else {
    delete req.body.tokenExpired;
    next();
  }
};
