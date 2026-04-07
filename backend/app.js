const express = require("express");
const path = require("path");
const cors = require("cors");
const createHttpError = require("http-errors");
const usersRoute = require("./routes/users");
const ordersRoute = require("./routes/orders");
const productRoute = require("./routes/products");
const cartRoute = require("./routes/carts");
const paymentRoute = require("./routes/payments");
const profileRoute = require("./routes/profile");
const deliveryRoute = require("./routes/delivery");
const reviewRoute = require("./routes/reviews");
const refundRoute = require("./routes/refunds");
const imageRoute = require("./routes/images");
const fileFn = require("./functions/file-functions");

const app = express();

const corsOptions = {
  origin: process.env.FRONT_END_URL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
/* app.set("trust proxy", 1); */
app.use(express.json({ limit: "10mb" })); // to process JSON in request body

const uploadsFolder = path.join(__dirname, "uploads");

fileFn.deleteAllFilesFolders(uploadsFolder);
fileFn.createFolder(uploadsFolder);

// app.use(
//   express.static(path.join(__dirname, "public"), {
//     // Set the MIME type explicitly for .css and .js files
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".css")) {
//         res.setHeader("Content-Type", "text/css");
//       }
//       if (filePath.endsWith(".js")) {
//         res.setHeader("Content-Type", "application/javascript");
//       }
//     },
//   })
// );

app.use("/api", usersRoute);
app.use("/api", ordersRoute);
app.use("/api", cartRoute);
app.use("/api", productRoute);
app.use("/api", paymentRoute);
app.use("/api", profileRoute);
app.use("/api", deliveryRoute);
app.use("/api", reviewRoute);
app.use("/api", imageRoute);
app.use("/api", refundRoute);

app.use(function (req, res, next) {
  return next(createHttpError(404, `Unknown Resource ${req.method} ${req.originalUrl}`));
});

app.use(function (err, req, res, next) {
  return res.status(err.status || 500).json({ error: err.message || "Unknown Server Error!" });
});

module.exports = app;
