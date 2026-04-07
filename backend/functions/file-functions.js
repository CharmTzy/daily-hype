// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const { errorMessages } = require("../errors");

module.exports.deleteAllFilesFolders = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        this.deleteAllFilesFolders(currentPath);
      } else {
        fs.unlinkSync(currentPath);
        console.log("File Deleted: " + currentPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log("Folder Deleted: " + folderPath);
  }
};

module.exports.createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
};

module.exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    } else {
      reject(errorMessages.FILE_NOT_FOUND);
    }
  });
};

module.exports.deleteFolder = (folderPath) => {
  return new Promise((resolve, reject) => {
    if (fsExtra.existsSync(folderPath)) {
      fsExtra.remove(folderPath, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    } else {
      reject(errorMessages.FOLDER_NOT_FOUND);
    }
  });
};

module.exports.checkFileExistsInFolder = (folderPath) => {
  return new Promise((resolve, reject) => {
    return fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(errorMessages.FOLDER_NOT_FOUND);
      } else {
        if (files.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
};

module.exports.checkFolderExists = (folderPath) => {
  return fs.existsSync(folderPath);
};
