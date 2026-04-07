// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const imagesModel = require("../models/images");
const validateFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const fileFn = require("../functions/file-functions");
const { errorMessages, successMessages } = require("../errors");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, "../uploads/" + req.headers.userid);
    fileFn.createFolder(folderPath);
    cb(null, path.join(__dirname, `../uploads/${req.headers.userid}/`)); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${Math.ceil(Math.random() * 100000)}_${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage: storage });

router.post("/image/upload/multiple/:width/:height", validateFn.validateToken, refreshFn.refreshToken, upload.array("image"), async (req, res) => {
  const width = req.params.width;
  const height = req.params.height;

  const userFolder = path.join(__dirname, "../uploads/" + req.headers.userid);

  if (width === undefined || isNaN(width) || width < 100 || width > 1920 || height === undefined || isNaN(height) || height < 100 || height > 1920) {
    return res.json({ error: errorMessages.INVALID_DIMENSION });
  }

  const maxWidth = parseInt(width, 10);
  const maxHeight = parseInt(height, 10);

  const processFiles = req.files.map(async (file) => {
    const imageInfo = await sharp(file.path).metadata();
    if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
      const newFile = `${Date.now()}_${Math.ceil(Math.random() * 100000)}_${file.originalname}_resized.jpg`;
      const outputPath = path.join(userFolder, newFile);
      const data = fs.readFileSync(file.path);
      await sharp(data)
        .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize while maintaining aspect ratio
        .toFile(outputPath);
      fs.unlinkSync(file.path);
      return newFile;
    } else {
      return file.filename;
    }
  });

  return Promise.all(processFiles)
    .then((newFileNames) => {
      return res.json({ message: successMessages.UPLOAD_SUCCESS, filenames: newFileNames });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.post("/image/upload/multiple/cloudinary/:width/:height", validateFn.validateToken, refreshFn.refreshToken, upload.array("image"), async (req, res) => {
  const width = req.params.width;
  const height = req.params.height;

  const userFolder = path.join(__dirname, "../uploads/" + req.headers.userid);

  if (width === undefined || isNaN(width) || width < 100 || width > 1920 || height === undefined || isNaN(height) || height < 100 || height > 1920) {
    return res.json({ error: errorMessages.INVALID_DIMENSION });
  }

  const maxWidth = parseInt(width, 10);
  const maxHeight = parseInt(height, 10);

  const processFiles = req.files.map(async (file) => {
    const imageInfo = await sharp(file.path).metadata();
    if (imageInfo.width > maxWidth || imageInfo.height > maxHeight) {
      const newFile = `${Date.now()}_${Math.ceil(Math.random() * 100000)}_${file.originalname}_resized.jpg`;
      const outputPath = path.join(userFolder, newFile);
      const data = fs.readFileSync(file.path);
      await sharp(data)
        .resize({ width: maxWidth, height: maxHeight, fit: "inside" }) // Resize while maintaining aspect ratio
        .toFile(outputPath);
      fs.unlinkSync(file.path);
      return newFile;
    } else {
      return file.filename;
    }
  });

  return Promise.all(processFiles)
    .then((newFileNames) => {
      const filePaths = newFileNames.map((image) => path.join(userFolder, image));
      return imagesModel
        .uploadMultipleImagesToCloudinary(filePaths)
        .then(async (results) => {
          await fileFn.deleteFolder(userFolder);
          const imageArr = results.map((r) => ({ imageid: r.public_id, imagename: r.original_filename, url: r.secure_url }));
          return imagesModel
            .createBatchImage(imageArr)
            .then((imageCount) => {
              if (imageCount === imageArr.length) {
                return res.status(200).json({ message: successMessages.UPLOAD_SUCCESS, images: imageArr });
              } else {
                return imagesModel.deleteMultipleImagesFromCloudinary(results.map((r) => r.public_id)).finally(() => {
                  return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
                });
              }
            })
            .catch((error) => {
              return imagesModel.deleteMultipleImagesFromCloudinary(results.map((r) => r.public_id)).finally(() => {
                return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
              });
            });
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/image/upload/:userid/:filename", (req, res) => {
  const filename = req.params.filename ? req.params.filename : "";
  const userid = req.params.userid;
  if (userid === undefined || isNaN(userid) || userid < 1) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }
  const filePath = path.join(__dirname, "../uploads/" + userid + "/" + filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: errorMessages.FILE_NOT_FOUND });
  }
});

router.delete("/image/upload/:filename", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "customer" && role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const filename = req.params.filename;
  const userFolder = path.join(__dirname, "../uploads/" + req.headers.userid);

  if (filename === undefined) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  const filePath = path.join(userFolder, filename);

  fileFn
    .deleteFile(filePath)
    .then(() => {
      fileFn
        .checkFileExistsInFolder(userFolder)
        .then((result) => {
          if (!result) {
            fileFn.deleteFolder(userFolder);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
        });
    })
    .catch((error) => {
      console.error(error);
      if (error === errorMessages.FILE_NOT_FOUND) {
        return res.status(404).json({ error: errorMessages.FILE_NOT_FOUND });
      }
      return res.status(500).json({ error: errorMessages.FILE_ERROR });
    });
});

router.delete("/image/upload/cloudinary/*", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "customer" && role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const imageid = req.params[0];

  console.log(imageid);

  if (imageid === undefined) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  return imagesModel
    .getImage(imageid)
    .then((result) => {
      if (result) {
        return Promise.all([imagesModel.deleteImage(imageid), imagesModel.deleteSingleImageFromCloudinary(result.imageid)]).then(() => {
          return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
        });
      } else {
        return res.status(404).json({ error: errorMessages.FILE_NOT_FOUND });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// router.delete("/image/upload/all", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
//   const id = req.body.id;
//   const email = req.body.email;
//   const role = req.body.role;

//   // checking whether the user token is valid
//   if (!id || isNaN(id) || !role || !email || (role != "customer" && role !== "admin" && role !== "manager")) {
//     return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
//   }

//   const userFolder = path.join(__dirname, "../uploads/" + req.headers.userid);

//   if (fileFn.checkFolderExists(userFolder)) {
//     return fileFn
//       .deleteFolder(userFolder)
//       .then((result) => {
//         if (result) {
//           return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//       })
//       .finally(() => {
//         return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
//       });
//   } else {
//     return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
//   }
// });

module.exports = router;
