const cloudinary = require("cloudinary").v2;

const isConfigured = Boolean(process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
}

cloudinary.isConfigured = isConfigured;
cloudinary.getFolder = (...segments) => {
  const folderSegments = [process.env.CLOUDINARY_FOLDER || "daily-hype", ...segments]
    .flat()
    .filter(Boolean)
    .map((segment) => `${segment}`.trim().replace(/^\/+|\/+$/g, ""));

  return folderSegments.join("/");
};

module.exports = cloudinary;
