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
router.get("/profile", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
    try {
        const email = req.body.email;
        const id = req.body.id;
        const role = req.body.role;
        if (!id || !email || !role || role != "customer") {
            return res.status(403).send({ error: "Unauthorized Access" });
        }
        profileModel
            .retrieveProfileData(email)
            .then((userData) => {
            res.status(200).json(userData);
        })
            .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Error retrieving user profile data" });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error decoding token or retrieving user profile data" });
    }
});
router.post("/update-profile", validationFn.validateToken, jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
    const { name, gender, phone } = req.body;
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
    }
    catch (error) {
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
router.post("/upload-photo", jwtAuth.validateToken, refreshFn.refreshToken, upload.single("photo"), async (req, res) => {
    const email = req.body.email;
    const file = req.file;
    if (!file) {
        console.error("No file provided");
        return res.status(400).json({ error: "No file provided" });
    }
    let nextImageId = null;
    try {
        const [result, user] = await Promise.all([imageModel.uploadCloudinaryPhoto(email, file), profileModel.retrieveProfileData(email)]);
        nextImageId = result.public_id;
        const insertCount = await imageModel.createImage(result.public_id, result.original_filename, result.secure_url);
        if (insertCount !== 1) {
            throw new Error("Image Error");
        }
        const updateCount = await userModel.updateUserImage(result.public_id, email);
        if (updateCount !== 1) {
            throw new Error("Image Update Error");
        }
        if (user.imageid && user.imageid !== result.public_id) {
            await Promise.allSettled([imageModel.deleteCloudinaryImage(user.imageid), imageModel.deleteUserImage(user.imageid)]);
        }
        return res.status(201).json({ message: "Update Success", url: result.secure_url, imageid: result.public_id });
    }
    catch (error) {
        if (nextImageId) {
            await Promise.allSettled([imageModel.deleteCloudinaryImage(nextImageId), imageModel.deleteUserImage(nextImageId)]);
        }
        console.error(error);
        return res.status(500).json({ error: "Unknown Error" });
    }
    finally {
        fileFn.deleteFile(file.path);
    }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error decoding token or retrieving user profile data" });
    }
});
router.put("/deleteAccount", jwtAuth.validateToken, refreshFn.refreshToken, (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    const email = req.body.email;
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
        }
        else if (error.message === "Incorrect password") {
            res.status(401).json({ error: "Incorrect password" });
        }
        else {
            console.error("Error deleting account:", error);
            res.status(500).json({ error: "Error deleting account" });
        }
    });
});
module.exports = router;
