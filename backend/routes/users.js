/* Name: Wai Yan Aung
Admin No: 2234993
Date: 2.11.2023
Description: Login Page  */

const express = require("express");

const router = express.Router();
const multer = require("multer");
const path = require("path");
const cookieFunctions = require("../functions/cookies");
const userModel = require("../models/users");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR, errorMessages } = require("../errors");
const cloudinary = require("../cloudinary");
const jwtFunctions = require("../functions/jwt-token");
const mailFunctions = require("../functions/send-mail");
const fileFn = require("../functions/file-functions");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  return userModel
    .checkLogin(email, password)
    .then(function (user) {
      delete user.password;

      const authToken = jwtFunctions.generateAuthToken({ email: user.email, userId: user.userid, role: user.rolename }, process.env.JWT_SECRET_KEY);

      const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);

      return userModel
        .storeRefreshToken(user.userid, refreshToken)
        .then((result) => {
          cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
          return res.status(200).json({ user: user });
        })
        .catch((error) => {
          throw error;
        });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(401).json({ error: "User not found" });
      } else if (error instanceof DUPLICATE_ENTRY_ERROR) {
        return res.status(409).json({ error: "Duplicate entry" });
      } else if (error.message === "Email not verified") {
        return res.status(401).json({ error: "Email not verified. Please verify your email before logging in." });
      } else if (error.message == "Incorrect password") {
        return res.status(401).json({ error: "Invalid email or password" });
      } else {
        return res.status(401).json({ error: "Unknown Error" });
      }
    });
});

router.post("/forgot-password", (req, res) => {
  const email = req.body.email;
  let IPAddress = req.ip;
  if (IPAddress === "::1") {
    IPAddress = "127.0.0.1";
  }

  // Check if the user exists
  return userModel
    .checkExistingUser(email, "normal")
    .then((existingUser) => {
      if (!existingUser) {
        // User not found
        return res.status(404).json({ success: false, message: "User not found." });
      } else {
        // User exists, proceed with sending the verification code
        const generatedCode = Math.floor(100000 + Math.random() * 900000);
        return Promise.all([mailFunctions.sendEmailVerificationCode(IPAddress, generatedCode, email), userModel.saveVerificationCode(generatedCode, email)]);
      }
    })
    .then(([result1, result2]) => {
      return res.status(200).json({ success: true, message: "Verification code stored successfully." });
    })
    .catch((error) => {
      console.error("Error in forgot-password endpoint:", error);
    });
});

router.post("/password-reset", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  userModel
    .updatePassword(email, password)
    .then(() => {
      return res.status(200).json({ success: true, message: "Password reset successful." });
    })
    .catch((error) => {
      console.error("Error in password-reset endpoint:", error);
    });
});

router.post("/signup", (req, res) => {
  const { name, email, password, phone, gender } = req.body;
  let IPAddress = req.ip;
  if (IPAddress === "::1") {
    IPAddress = "127.0.0.1";
  }

  //Sequential Requests and Concurrent Requests
  return userModel
    .checkExistingUser(email, "normal")
    .then(function (existingUser) {
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      } else {
        userModel
          .signup(name, email, password, phone, gender)
          .then(function (newUser) {
            const generatedCode = Math.floor(100000 + Math.random() * 900000);
            return Promise.all([mailFunctions.sendEmailVerificationCode(IPAddress, generatedCode, email), userModel.saveVerificationCode(generatedCode, email)])
              .then(([result1, result2]) => {
                return res.status(200).json({ success: true, message: "Verification code stored successfully." });
              })
              .catch((error) => {
                throw new Error(error);
              });
          })
          .catch((error) => {
            console.error("Error storing verification code:", error);
            res.status(500).json({ success: false, message: "Internal server error." });
          });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ error: "Unknown Error" });
    });
});

router.post("/loginVerificationCode", (req, res) => {
  let IPAddress = req.ip;
  if (IPAddress === "::1") {
    IPAddress = "127.0.0.1";
  }
  const generatedCode = Math.floor(100000 + Math.random() * 900000);
  console.log(generatedCode);
  const email = req.body.email;
  return Promise.all([mailFunctions.sendEmailVerificationCode(IPAddress, generatedCode, email), userModel.saveVerificationCode(generatedCode, email)])
    .then(([result1, result2]) => {
      if (result1.success && result2.success) {
        return res.status(200).json({ success: true, message: "Verification code stored successfully." });
      } else {
        return res.status(500).json({ success: false, message: "Failed to send email or save verification code." });
      }
    })
    .catch((error) => {
      console.error("Error in loginVerificationCode route:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    });
});

router.post("/verify", (req, res) => {
  const { code, email } = req.body;
  console.log(code, email);
  return userModel
    .verification(code, email)
    .then(function (user) {
      if (!user) {
        return res.status(401).json({ error: "Invalid verification code" });
      } else {
        delete user.code;

        const authToken = jwtFunctions.generateAuthToken({ email: user.email, userId: user.userid, role: user.rolename }, process.env.JWT_SECRET_KEY);

        const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);

        return userModel
          .storeRefreshToken(user.userid, refreshToken)
          .then((result) => {
            cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
            return res.status(200).json({ user: user });
          })
          .catch((error) => {
            throw error;
          });
      }
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.post("/signupGoogle", (req, res) => {
  const { res_id, res_name, res_email, res_verified_email, res_picture } = req.body;
  const email = res_email;
  const id = res_id;
  const name = res_name;
  const verified_email = res_verified_email;
  const picture = res_picture;

  return userModel
    .checkExistingUser(email, "google")
    .then(function (existingUser) {
      if (existingUser) {
        const authToken = jwtFunctions.generateAuthToken({ email: existingUser.email, userId: existingUser.userid, role: existingUser.rolename }, process.env.JWT_SECRET_KEY);
        const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);
        return userModel.storeRefreshToken(existingUser.userid, refreshToken).then((result) => {
          cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
          return res.status(200).json({ user: existingUser });
        });
      } else {
        userModel
          .signupGoogle(id, name, email, verified_email, picture)
          .then(function () {
            const newUser = { email: email, id: id, role: "customer", url: picture, name: name, method: "google" };
            const authToken = jwtFunctions.generateAuthToken({ email: newUser.email, userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET_KEY);
            const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);
            return userModel.storeRefreshToken(newUser.id, refreshToken).then((result) => {
              cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
              return res.status(200).json({ user: newUser });
            });
          })
          .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: "Error creating user" });
          });
      }
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.post("/signupFacebook", (req, res) => {
  const { res_id, res_name, res_email, res_verified_email, res_picture } = req.body;
  const email = res_email;
  const id = res_id;
  const name = res_name;
  const verified_email = res_verified_email;
  const picture = res_picture;

  return userModel
    .checkExistingUser(email, "facebook")
    .then(function (existingUser) {
      if (existingUser) {
        const authToken = jwtFunctions.generateAuthToken({ email: existingUser.email, userId: existingUser.userid, role: existingUser.rolename }, process.env.JWT_SECRET_KEY);
        const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);
        return userModel.storeRefreshToken(existingUser.userid, refreshToken).then((result) => {
          cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
          return res.status(200).json({ user: existingUser });
        });
      } else {
        userModel
          .signupFacebook(id, name, email, verified_email, picture)
          .then(function () {
            const newUser = { email: email, id: id, role: "customer", url: picture, name: name, method: "facebook" };
            const authToken = jwtFunctions.generateAuthToken({ email: newUser.email, userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET_KEY);
            const refreshToken = jwtFunctions.generateRefreshToken({ lastcreatedat: new Date().toISOString() }, process.env.JWT_REFRESH_KEY);
            return userModel.storeRefreshToken(newUser.id, refreshToken).then((result) => {
              cookieFunctions.setHttpOnlyCookieHeader("authToken", authToken, res);
              return res.status(200).json({ user: newUser });
            });
          })
          .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: "Error creating user" });
          });
      }
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.post("/sendmail", async (req, res) => {
  let IPAddress = req.ip;
  if (IPAddress === "::1") {
    IPAddress = "127.0.0.1";
  }

  try {
    const email = req.body.email;
    console.log(email);
    const generatedCode = Math.floor(100000 + Math.random() * 900000);
    const info = await mailFunctions.sendEmailVerificationCode(IPAddress, generatedCode, email);
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/checkExistingUser", (req, res) => {
  const { email } = req.body;
  console.log(email);
  userModel
    .checkExistingUser(email, "normal")
    .then((existingUser) => {
      if (existingUser) {
        // User already exists
        res.status(409).json({ message: "User already exists" });
      } else {
        // User does not exist
        res.status(200).json({ message: "User does not exist" });
      }
    })
    .catch((error) => {
      console.error("Error checking existing user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// Admin part

router.get("/user/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const offset = req.query.offset && !isNaN(req.query.offset) ? req.query.offset : 0;
  const limit = req.query.limit && !isNaN(req.query.limit) ? req.query.limit : 0;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return userModel
    .getUserByAdmin(offset, limit)
    .then(function (order) {
      return res.json({ data: order });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/user/count/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  console.log(id, email, role);
  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return userModel
    .getUserCountByAdmin()
    .then((count) => {
      return res.json({ data: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/getAllUserByAdmin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  let offset = req.query.offset;
  if (!offset || isNaN(offset)) {
    offset = 0;
  }

  userModel
    .getUserByAdmin(offset)
    .then(function (users) {
      return res.json({ users });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/user/:userId", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const userId = req.params.userId;

  Promise.all([
    fetchUserData(userId),
    getAllAddressesByUserId(userId)
  ])
  .then(([userData, addresses]) => {
    if (!userData) {
      res.status(404).json({ error: 'User not found' });
    } else {

      const userDataWithAddresses = {
        ...userData,
        addresses: addresses
      };
      res.status(200).json(userDataWithAddresses);
    }
  })
  .catch(error => {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// Function to fetch user data
const fetchUserData = (userId) => {
  return new Promise((resolve, reject) => {
    userModel.fetchUserData(userId, (error, userData) => {
      if (error) {
        reject(error);
      } else {
        resolve(userData);
      }
    });
  });
};

// Function to fetch all addresses by user ID
const getAllAddressesByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    userModel.getAllAddressesByUserId(userId)
      .then(addresses => resolve(addresses))
      .catch(error => reject(error));
  });
};

router.put("/user/:userId", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const userId = req.params.userId;
  const userData = req.body.userData;
  return userModel.getRoleID(userData.role).then((roleData) => {
    if(roleData) {
      return userModel.updateUserData(userId, userData, roleData.roleid, (error, updatedUser) => {
        if (error) {
          console.error('Error updating user data:', error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
          } else {
            updatedUser.role = roleData.rolename;
            res.status(200).json(updatedUser);
          }
        }
      })
    }
  })

});

router.put("/deleteUser/:userId", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const userId = req.params.userId;

  userModel
    .deleteUser(userId)
    .then(() => {
      res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting user:", error);

      if (error instanceof EMPTY_RESULT_ERROR) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Error deleting user" });
      }
    });
});

router.get("/user/stat/revenue/quarter", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  console.log(id, email, role, tempYear, year);
  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return userModel
    .getUserRevenueStatByQuarter(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});


router.get("/user/stat/monthly", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  console.log(id, email, role, tempYear, year);
  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return userModel
    .getUserStatByMonth(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, "../uploads");
    fileFn.createFolder(folderPath);
    cb(null, path.join(__dirname, `../uploads/`));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/create-user", validationFn.validateToken, refreshFn.refreshToken, upload.single("photo"), (req, res) => {
  try {
    const { name, email, password, phone, gender, role } = req.body;
    const file = req.file;

    console.log("This is route" + name);
    if(file){
    const uploadPhoto = () => {

      console.log("Hello there");
      return cloudinary.uploader
        .upload(file.path, { folder: "Design" })
        .then((photoResult) => {photoResult
          const uploadFolder = path.join(__dirname, "../uploads");
          fileFn.deleteFile(path.join(uploadFolder, file.filename));
        })
        .catch((uploadError) => {
          console.error("Error uploading photo to Cloudinary:", uploadError);
          return null;
        });
    };

    const createUserInDatabase = (photoResult) => {
      console.log("This is " + photoResult);
      const photoUrl = photoResult ? photoResult.secure_url : null;
      console.log("This is photoURL" + photoUrl);

      return userModel.createUser({ name, email, password, phone, gender, role, photoUrl })
        .then(() => {
          // Return a promise to ensure proper chaining
          return Promise.resolve();
        })
        .catch((dbError) => {
          console.error("Error creating user in the database:", dbError);
          throw dbError; // Rethrow error to be caught in the main catch block
        });
    };
    uploadPhoto()
      .then(photoResult => createUserInDatabase(photoResult))
      .catch(error => {
        console.error("Error in create-user endpoint:", error);
        res.status(500).json({ error: "Error creating user" });
      });
    }else{
      return userModel.createUser({ name, email, password, phone, gender, role })
      .then(() => {
        return Promise.resolve();
      })
      .catch(dbError => {
        console.error("Error creating user in the database:", dbError);
        throw dbError; 
      });
    }
  } catch (error) {
    console.error("Error in create-user endpoint:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});


router.get("/getTotalUserByAdmin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    console.log(startDate, endDate);
    userModel
      .getTotalUserByAdmin(startDate, endDate)
      .then((users) => {
        return res.json({ users });
      })
      .catch((error) => {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
          return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: "Unknown Error" });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unknown Error" });
  }
});

router.get("/getUserCreationData", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    console.log(startDate, endDate);
    // Call the model to get user creation data
    userModel
      .getUserCreationData(startDate, endDate)
      .then((data) => {
        return res.json(data);
      })
      .catch((error) => {
        console.error(error);
        if (error instanceof EMPTY_RESULT_ERROR) {
          return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: "Unknown Error" });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unknown Error" });
  }
});

router.get("/getgenderStatistics", (req, res) => {
  userModel.getGenderStatistics((error, statistics) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(statistics);
  });
});
//END OF ADMIN PART

// ADDRESS BOOK WYA
router.post("/addAddress", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const { fullname, phone, postal_code, block_no, street, building, unit_no, is_default } = req.body;
  const userId = req.body.id;
  //Sequential Request WYA
  return userModel
    .checkExistingAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userId)
    .then(function (existingAddress) {
      if (existingAddress) {
        console.log("This is workinf");
        return res.status(400).json({ error: "Address already exists" });
      } else {
        return userModel.addNewAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userId, is_default).then(function () {
          return res.status(200).json({ message: "Address added successfully" });
        });
      }
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.post("/addAddressAdmin", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const { fullname, phone, postal_code, block_no, street, building, unit_no, is_default } = req.body;
  const userId = req.body.userid;
  //Sequential Request WYA
  return userModel
    .checkExistingAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userId)
    .then(function (existingAddress) {
      if (existingAddress) {
        console.log("This is workinf");
        return res.status(400).json({ error: "Address already exists" });
      } else {
        return userModel.addNewAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userId, is_default).then(function () {
          return res.status(200).json({ message: "Address added successfully" });
        });
      }
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/getAllAddresses", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const userId = req.body.id;
  return userModel
    .getAllAddressesByUserId(userId)
    .then(function (addresses) {
      return res.status(200).json({ addresses });
    })
    .catch(function (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
});

router.delete("/deleteAddress", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const userId = req.body.id;
  const addressId = req.body.address_id;
  console.log("HIIII" + userId, addressId);
  console.log(req.body);

  return userModel
    .deleteAddress(addressId, userId)
    .then((deletedAddressId) => {
      if (deletedAddressId !== null) {
        res.status(200).json({ success: true, message: "Address deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Address not found or not authorized to delete" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    });
});

router.delete("/deleteAddressAdmin", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const userId = req.body.userid;
  const addressId = req.body.address_id;
  console.log("HIIII" + userId, addressId);

  return userModel
    .deleteAddress(addressId, userId)
    .then((deletedAddressId) => {
      if (deletedAddressId !== null) {
        res.status(200).json({ success: true, message: "Address deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Address not found or not authorized to delete" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    });
});

router.get("/getAddress/:address_id", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const addressId = req.params.address_id;
  const userId = req.body.id;
  console.log("UII", addressId, userId);

  return userModel
    .getAddressDetails(addressId, userId)
    .then((address) => {
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      return res.status(200).json({ address });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
router.put("/editAddress", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const addressId = req.body.address_id;
  const userId = req.body.id;

  const { fullname, phone, postal_code, block_no, street, building, unit_no, region, is_default } = req.body;

  console.log("UII123", addressId, userId, fullname, phone, postal_code, block_no, street, building, unit_no, region, is_default);

  return userModel
    .checkExistingAddress(fullname, phone, postal_code, block_no, street, building, unit_no, userId)
    .then((existingAddress) => {
      if (existingAddress && existingAddress.address_id !== addressId) {
        return res.status(400).json({ error: "Address already exists" });
      } else {
        return userModel.editAddress(addressId, userId, fullname, phone, postal_code, block_no, street, building, unit_no, region, is_default).then((updatedAddress) => {
          if (!updatedAddress) {
            return res.status(404).json({ error: "Address not found" });
          }

          return res.status(200).json({ address: updatedAddress });
        });
      }
    })

    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
//END OF ADDRESS BOOK

// CA2
// Name: Zay Yar Tun

router.post("/signout", (req, res) => {
  cookieFunctions.clearHttpOnlyCookieHeader("authToken", res);
  return res.status(200).json({ success: true });
});
// Name: Zay Yar Tun

module.exports = router;
