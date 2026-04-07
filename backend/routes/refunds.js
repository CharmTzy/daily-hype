// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const express = require("express");
const validateFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const path = require("path");
const fileFn = require("../functions/file-functions");
const ordersModel = require("../models/orders");
const imagesModel = require("../models/images");
const refundsModel = require("../models/refunds");
const productsModel = require("../models/products");
const { errorMessages, successMessages } = require("../errors");
const { formatDecimalNumber } = require("../functions/number-formatter");

const router = express.Router();

// signed in user

router.post("/refund/:orderid/:productdetailid", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  const orderID = req.params.orderid;
  const productDetailID = req.params.productdetailid;

  if (!orderID || isNaN(orderID) || !productDetailID || isNaN(productDetailID)) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }

  const { images, reason, qty } = req.body;
  const tempCategory = req.body.category;

  if (!images || !reason || !tempCategory || images.length <= 0 || images.length > 9 || reason.length <= 0 || reason.length > 500 || !qty || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: errorMessages.INVALID_REQUEST });
  }

  let category = "Missing Quantity";
  if (tempCategory === 2) {
    category = "Received wrong item";
  } else if (tempCategory === 3) {
    category = "Damaged item";
  } else if (tempCategory === 4) {
    category = "Faulty product";
  } else if (tempCategory === 5) {
    category = "Counterfeit product";
  }

  return Promise.all([ordersModel.checkOrderItemExists(orderID, productDetailID), refundsModel.checkRefundExists(orderID, productDetailID), ordersModel.checkOrderStatus(orderID, "received")])
    .then(async ([orderItem, refundItem, orderStatus]) => {
      if (orderItem && orderStatus) {
        if (!refundItem || refundItem.refundqty + qty <= orderItem.qty) {
          const filePaths = images.map((image) => path.join(__dirname, "../uploads/" + id + "/" + image));
          return imagesModel
            .uploadMultipleImagesToCloudinary(filePaths)
            .then(async (results) => {
              await fileFn.deleteFolder(path.join(__dirname, "../uploads/" + id));
              const imageArr = results.map((r) => ({ imageid: r.public_id, imagename: r.original_filename, url: r.secure_url }));
              const refundID = Date.now().toString() + Math.floor(Math.random() * 1000);

              return Promise.all([imagesModel.createBatchImage(imageArr), refundsModel.createRefund(refundID, formatDecimalNumber(orderItem.unitprice * qty, 2), orderID, productDetailID, category, reason, qty)])
                .then(([imageCount, refundCount]) => {
                  if (imageCount === imageArr.length && refundCount === 1) {
                    return refundsModel
                      .createRefundImage(
                        refundID,
                        imageArr.map((image) => image.imageid)
                      )
                      .then((count) => {
                        if (count === imageArr.length) {
                          return res.json({ message: successMessages.CREATE_SUCCESS });
                        } else {
                          throw new Error(errorMessages.INTERNAL_SERVER_ERROR);
                        }
                      })
                      .catch((error) => {
                        console.error(error);
                        return refundsModel.deleteRefundImages(refundID).finally(() => {
                          return Promise.all([imagesModel.deleteMultipleImagesFromCloudinary(results.map((r) => r.public_id)), refundsModel.deleteRefund(refundID)]).finally(() => {
                            return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
                          });
                        });
                      });
                  } else {
                    return Promise.all([imagesModel.deleteMultipleImagesFromCloudinary(results.map((r) => r.public_id)), refundsModel.deleteRefund(refundID)]).finally(() => {
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
        } else {
          await fileFn.deleteFolder(path.join(__dirname, "../uploads/" + id));
          return res.status(400).json({ error: errorMessages.INVALID_REQUEST });
        }
      } else {
        await fileFn.deleteFolder(path.join(__dirname, "../uploads/" + id));
        return res.status(404).json({ error: errorMessages.NOT_FOUND });
      }
    })
    .catch(async (error) => {
      await fileFn.deleteFolder(path.join(__dirname, "../uploads/" + id));
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// signed in user

// admin

router.get("/refund/count/admin", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || (role !== "admin" && role !== "manager")) {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  return refundsModel
    .getRefundCountByAdmin()
    .then((count) => {
      return res.status(200).json({ count: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/refund/admin", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || (role !== "admin" && role !== "manager")) {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  const tempOffset = req.query.offset;
  const tempLimit = req.query.limit;
  const offset = tempOffset !== undefined && !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
  const limit = tempLimit !== undefined && !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

  return refundsModel
    .getRefundByAdmin(offset, limit)
    .then((refund) => {
      return productsModel
        .getFullProductInfoByProductDetailIDArr(refund.map((r) => r.productdetailid))
        .then((product) => {
          refund.forEach((item) => {
            const productItem = product.find((p) => p.productdetailid === item.productdetailid);
            item.productname = productItem.productname;
            item.colourname = productItem.colourname;
            item.sizename = productItem.sizename;
            item.url = productItem.url;
          });
          return res.status(200).json({ data: refund });
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

// admin
module.exports = router;
