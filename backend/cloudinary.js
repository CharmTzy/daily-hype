const cloudinary = require("cloudinary").v2;
const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;
const isConfigured = Boolean(cloudinaryUrl || (cloudName && apiKey && apiSecret));
if (isConfigured) {
    cloudinary.config(cloudinaryUrl
        ? {
            cloudinary_url: cloudinaryUrl,
        }
        : {
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
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
