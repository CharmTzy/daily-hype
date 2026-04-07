/* Name: Wai Yan Aung
Admin No: 2234993
Date: 19.11.2023
Description: Profile Page  */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const cloudinary = require("../cloudinary");
const profileModel = require("../models/profile");
const imageModel = require("../models/images");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const jwtAuth = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const validationFn = require("../middlewares/validateToken");
const fileFn = require("../functions/file-functions");
express().use(express.static("public"));

router.get("/profile", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
  try {
    const email = req.body.email;
    const id = req.body.id;
    const role = req.body.role;
    if (!id || !email || !role || role != "customer") {
      return res.status(403).send({ error: "Unauthorized Access" });
    }
    console.log(id, email, role);
    profileModel
      .retrieveProfileData(email)
      .then((userData) => {
        res.status(200).json(userData);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Error retrieving user profile data" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error decoding token or retrieving user profile data" });
  }
});

router.post("/update-profile",validationFn.validateToken, jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
    const { name, gender, phone} = req.body;
    profileModel
      .updateProfile(req.body.email, { name, gender, phone })
      .then(() => {
        res.status(200).json({ message: "Profile updated successfully" });
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Error updating profile" });
      });
  });

router.post("/update-password", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.body.email;

    profileModel
      .checkAndUpdatePassword(email, oldPassword, newPassword)
      .then(() => {
        res.status(200).json({ message: "Password updated successfully" });
      })
      .catch((error) => {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Error updating password" });
      });
  } catch (error) {
    console.error("Error in update-password endpoint:", error);
    res.status(500).json({ error: "Error updating password" });
  }
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

router.post("/upload-photo", jwtAuth.validateToken, refreshFn.refreshToken, upload.single("photo"), (req, res) => {
  const email = req.body.email;
  const file = req.file;
  console.log("UPLOADING");

  console.log("Received photo upload request:", { email, file });


  if (!file) {
    console.error("No file provided");
    return res.status(400).json({ error: "No file provided" });
  }
  //Concurrent requests
  return Promise.all([imageModel.uploadCloudinaryPhoto(email, file), profileModel.retrieveProfileData(email)])
    .then(([result, user]) => {
      const uploadFolder = path.join(__dirname, "../uploads");
      fileFn.deleteFile(path.join(uploadFolder, file.filename));
      console.log(result);
      if (result && user) {
        console.log(user);
        console.log(user.imageid);
        if (user.imageid) {
          //Concurrent requests
          return Promise.all([imageModel.createImage(result.public_id, result.original_filename, result.url), imageModel.deleteCloudinaryImage(user.imageid)]).then(([result1, result2]) => {
            if (result2.result === "ok" && result1 === 1) {
              return userModel.updateUserImage(result.public_id, email).then((updateCount) => {
                if (updateCount === 1) {
                  return imageModel.deleteUserImage(user.imageid).then((deleteCount) => {
                    return res.status(201).status({ message: "Update Success" });
                  });
                } else {
                  throw new Error("Image Update Error");
                }
              });
            } else {
              throw new Error("Image Error");
            }
          });
        } else {
          console.log(result.public_id);
          return imageModel.createImage(result.public_id, result.original_filename, result.url).then((result2) => {
            if (result2 === 1) {
              return userModel.updateUserImage(result.public_id, email).then((updateCount) => {
                if (updateCount === 1) {
                  return res.status(201).status({ message: "Update Success" });
                } else {
                  throw new Error("Image Update Error");
                }
              });
            } else {
              throw new Error("Image Error");
            }
          });
        }
      } else {
        throw new Error("ERror");
      }
    })
  
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/getPhoto", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
  try {
    const email = req.body.email;
    const id = req.body.id;
    const role = req.body.role;
    if (!id || !email || !role || role != "customer") {
      return res.status(403).send({ error: "Unauthorized Access" });
    }

    profileModel
      .retrievePhoto(email)
      .then((url) => {
        res.status(200).json({ url: url });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Error retrieving user profile photo" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error decoding token or retrieving user profile data" });
  }
});

router.put("/deleteAccount", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  const email = req.body.email;

  console.log("LEE"+id,password,email);
  if (!id || !email) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  profileModel
    .deleteAccount(id, password)
    .then(() => {
      res.status(200).json({ message: "Account deleted successfully" });
    })
    .catch((error) => {
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else if (error.message === "Incorrect password") {
        res.status(401).json({ error: "Incorrect password" });
      } else {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Error deleting account" });
      }
    });
});

module.exports = router;
