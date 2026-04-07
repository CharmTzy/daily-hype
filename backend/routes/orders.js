// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// Date: 6.11.2023
// Description: Router for orders

const express = require("express");
const { EMPTY_RESULT_ERROR, DUPLICATE_ENTRY_ERROR, TABLE_ALREADY_EXISTS_ERROR, errorMessages, successMessages } = require("../errors");
const ordersModel = require("../models/orders");
const productsModel = require("../models/products");
const paymentsModel = require("../models/payments");
const addressModel = require("../models/addresses");
const usersModel = require("../models/users");
const validationFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const cartModel = require("../models/carts");

const router = express.Router();

router.get("/orderStatsByMonth", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  let month = req.query.month;
  let gender = req.query.gender;

  if (!gender) {
    gender = "";
  } else {
    if (gender.toLowerCase() === "male") {
      gender = "M";
    } else {
      gender = "F";
    }
  }

  if (!month || isNaN(month)) {
    return res.status(400).json({ error: "Invalid Request" });
  }

  return ordersModel
    .getOrderByMonth(month, gender)
    .then((result) => {
      return res.json({ stat: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/order/detail/:orderid", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const orderid = req.params.orderid;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "customer") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: "Invalid OrderID" });
  }

  return Promise.all([ordersModel.getOrderByIDAdmin(orderid), ordersModel.getOrderDetailByAdmin(orderid)])
    .then(function ([order, orderDetail]) {
      const productIDArr = [];
      orderDetail.forEach((detail) => {
        if (!productIDArr.includes(detail.productid)) productIDArr.push(detail.productid);
      });
      return productsModel.getProductImageByProductIDArr(productIDArr).then((productImages) => {
        for (let i = 0; i < orderDetail.length; i++) {
          for (let j = 0; j < productImages.length; j++) {
            if (orderDetail[i].productid === productImages[j].productid) {
              orderDetail[i].image = productImages[j].url;
              break;
            }
          }
        }
        return res.json({ order: order, orderdetail: orderDetail });
      });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/orderDetailAdmin/:orderid", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const orderid = req.params.orderid;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: "Invalid OrderID" });
  }

  return Promise.all([ordersModel.getOrderByIDAdmin(orderid), ordersModel.getOrderDetailByAdmin(orderid)])
    .then(function ([order, orderDetail]) {
      const productIDArr = [];
      orderDetail.forEach((detail) => {
        if (!productIDArr.includes(detail.productid)) productIDArr.push(detail.productid);
      });
      return productsModel.getProductImageByProductIDArr(productIDArr).then((productImages) => {
        for (let i = 0; i < orderDetail.length; i++) {
          for (let j = 0; j < productImages.length; j++) {
            if (orderDetail[i].productid === productImages[j].productid) {
              orderDetail[i].image = productImages[j].url;
              break;
            }
          }
        }
        return res.json({ order: order, orderdetail: orderDetail });
      });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// // remaining: delete records and add qty if failed
// router.post("/orders", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
//   const id = req.body.id;
//   const role = req.body.role;
//   const email = req.body.email;
//   const { payment, address, order } = req.body;

//   // checking whether the user token is valid
//   if (!id || isNaN(id) || !role || !email || role != "customer") {
//     return res.status(403).send({ error: "Unauthorized Access" });
//   }

//   // checking whether all necessary data are provided
//   if (!payment || !address || !order || !payment.method || !payment.amount || !payment.status || !payment.transactionid) {
//     return res.status(400).json({ error: "Invalid Transaction" });
//   }

//   // inserting productdetailid from order to productIDArr
//   // to get this array format ([1, 2, 3, ...])
//   const productIDArr = order.map((item) => item.productdetailid);

//   // concurrently doing getting user address and getting product qty and price
//   // user address is just for checking whether (need to be changed)
//   // getting qty and price to calculate and check the data sent from the frontend
//   return Promise.all([usersModel.getUserAddressByIdEmail(id, email), productsModel.getProductQtyPriceByIds(productIDArr)])
//     .then(function ([, productResult]) {
//       let totalAmount = 0,
//         totalQty = 0;

//       // checking every order array elements for quantity and product
//       const condition = order.every((item, index) => {
//         // check whether product exists in database by matching with retrieved data
//         const matchedProduct = productResult.find((item2) => item2.productdetailid === item.productdetailid);
//         totalAmount += item.qty * matchedProduct.unitprice;
//         order[index].unitprice = matchedProduct.unitprice;
//         totalQty += item.qty;

//         // check whether the quantity is sufficient
//         return !matchedProduct || item.qty <= matchedProduct.qty;
//       });

//       if (!condition) {
//         return res.status(400).json({ error: "Insufficient Product Quantity" });
//       }

//       // formatting total amount to 2 decimal places
//       totalAmount = parseFloat(totalAmount.toFixed(2));
//       // in case if the total qty and total amount become 0, throw error
//       if (totalQty <= 0 || totalAmount <= 0) {
//         throw new Error("Unknown Error");
//       }

//       return ordersModel
//         .createOrder(totalQty, totalAmount, address, id)
//         .then((orderResult) => {
//           const orderid = orderResult.rows[0].orderid;
//           if (orderResult.rowCount !== 1) {
//             throw new Error("Unknown Error");
//           }

//           return Promise.all([ordersModel.createOrderItems(order, orderid), paymentsModel.insertPayment(orderid, payment)])
//             .then(([orderItemResult, paymentResult]) => {
//               if (orderItemResult === order.length && paymentResult === 1) {
//                 const updateQtyExecute = [];
//                 const updateStatusExecute = [];
//                 order.forEach((item) => {
//                   updateQtyExecute.push(productsModel.reduceProductQtyById(item.qty, item.productdetailid));
//                   updateStatusExecute.push(productsModel.updateProductStatus(item.productdetailid));
//                 });
//                 return Promise.all(updateQtyExecute)
//                   .then((result) => {
//                     // summing all numbers in array
//                     let count = result.reduce((a, b) => a + b, 0);
//                     if (count === order.length) {
//                       return Promise.all(updateStatusExecute).then(() => {
//                         return res.status(201).json({});
//                       });
//                     } else throw new Error("Unknown Error");
//                   })
//                   .catch((error) => {
//                     console.error(error);
//                     throw error;
//                   });
//               } else {
//                 throw new Error("Unknown Error");
//               }
//             })
//             .catch((error) => {
//               console.log("ERROR");
//               console.error(error);
//               throw error;
//             });
//         })
//         .catch((error) => {
//           console.error(error);
//           throw error;
//         });
//     })
//     .catch((error) => {
//       console.error(error);
//       return res.status(500).json({ error: "Unknown Error" });
//     });
// });

// router.put("/orders/:orderid/:status/updateOrderByUser", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
//   const id = req.body.id;
//   const role = req.body.role;
//   const email = req.body.email;
//   const orderid = req.params.orderid;
//   const status = req.params.status;

//   if (!id || !role || !email || role != "customer" || !orderid) {
//     return res.status(403).send({ error: "Unauthorized Access" });
//   }

//   if (!orderid || isNaN(orderid) || !status || (status !== "cancelled" && status !== "received")) {
//     return res.status(400).send({ error: "Invalid Request" });
//   }

//   return ordersModel.getOrderStatusById(orderid).then((orderstatus) => {
//     orderstatus = orderstatus.toLowerCase();
//     if (orderstatus === "in progress" && status === "cancelled") {
//       return Promise.all([ordersModel.updateOrderStatusByUser(orderid, status, id), ordersModel.getOrderItemQtyByOrderId(orderid)])
//         .then(function ([updateStatus, orderitems]) {
//           if (orderitems) {
//             const updateProductQtyExecute = [];
//             const updateProductStatusExecute = [];
//             orderitems.forEach((item) => {
//               updateProductQtyExecute.push(productsModel.increaseProductQtyById(item.qty, item.productdetailid));
//               updateProductStatusExecute.push(productsModel.updateProductStatus(item.productdetailid));
//             });
//             return Promise.all(updateProductQtyExecute)
//               .then(function (result) {
//                 let count = result.reduce((a, b) => a + b, 0);
//                 if (count !== orderitems.length) throw new Error("Unknown Error");
//                 else {
//                   return Promise.all(updateProductStatusExecute).then(() => {
//                     return res.status(201).json({ message: "Update Success" });
//                   });
//                 }
//               })
//               .catch(function (error) {
//                 console.error(error);
//                 throw error;
//               });
//           }
//         })
//         .catch(function (error) {
//           console.error(error);
//           return res.status(500).json({ error: "Unknown Error" });
//         });
//     } else if (orderstatus === "delivered" && status === "received") {
//       return Promise.all([ordersModel.updateOrderStatusByUser(orderid, status, id), productsModel.getProductIDByOrderID(orderid)])
//         .then(([, productResult]) => {
//           if (productResult && productResult.length > 0) {
//             let soldqtyupdate = [];
//             productResult.forEach((product) => {
//               soldqtyupdate.push(productsModel.increaseSoldQty(product.qty, product.productid));
//             });
//             return Promise.all(soldqtyupdate).then(() => {
//               return res.status(201).json({ message: "Update Success" });
//             });
//           } else {
//             throw new Error(`Order Item Retrieve Error`);
//           }
//         })
//         .catch((error) => {
//           console.error(error);
//           return res.status(500).json({ error: "Unknown Error" });
//         });
//     }
//     return res.status(400).json({ error: "Invalid Status" });
//   });
// });

// router.put("/orders/:orderid/:status/updateOrderByAdmin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
//   const id = req.body.id;
//   const email = req.body.email;
//   const role = req.body.role;
//   const orderid = req.params.orderid;
//   const status = req.params.status;

//   if (!id || isNaN(id) || !email || !role || role !== "admin") {
//     return res.status(403).send({ error: "Unauthorized Access" });
//   }

//   if (!orderid || isNaN(orderid) || !status || (status !== "confirmed" && status !== "delivered" && status !== "cancelled")) {
//     return res.status(400).send({ error: "Invalid Request" });
//   }

//   return ordersModel
//     .getOrderStatusById(orderid)
//     .then(function (orderstatus) {
//       orderstatus = orderstatus.toLowerCase();
//       // checking order status before updating status
//       if (orderstatus === "in progress" && status === "confirmed") {
//         return ordersModel.updateOrderStatusByAdmin(orderid, status).then(function (count) {
//           if (count === 1) {
//             return res.sendStatus(201);
//           }
//         });
//       } else if (orderstatus === "in progress" && status === "cancelled") {
//         return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, status), ordersModel.getOrderItemQtyByOrderId(orderid)])
//           .then(function ([updateStatus, orderitems]) {
//             if (orderitems) {
//               const updateProductQtyExecute = [];
//               const updateProductStatusExecute = [];
//               orderitems.forEach((item) => {
//                 updateProductQtyExecute.push(productsModel.increaseProductQtyById(item.qty, item.productdetailid));
//                 updateProductStatusExecute.push(productsModel.updateProductStatus(item.productdetailid));
//               });
//               return Promise.all(updateProductQtyExecute)
//                 .then(function (result) {
//                   let count = result.reduce((a, b) => a + b, 0);
//                   if (count !== orderitems.length) throw new Error("Unknown Error");
//                   else {
//                     return Promise.all(updateProductStatusExecute).then(() => {
//                       return res.status(201).json({ message: "Update Success" });
//                     });
//                   }
//                 })
//                 .catch(function (error) {
//                   console.error(error);
//                   throw error;
//                 });
//             }
//           })
//           .catch(function (error) {
//             console.error(error);
//             return res.status(500).json({ error: "Unknown Error" });
//           });
//       }
//       return res.status(400).json({ error: "Invalid Status" });
//     })
//     .catch(function (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Unknown Error" });
//     });
// });

router.get("/orderstats", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  let productid = req.query.productid;
  let startdate = req.query.startdate;
  let enddate = req.query.enddate;
  let region = req.query.region;
  let gender = req.query.gender;
  let categoryid = req.query.categoryid;
  const regex = /^\d{4}-\d{2}-\d{2}$/; // Assuming a format like YYYY-MM-DD

  if (!id || isNaN(id) || !email || !role || role !== "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  if (!startdate) {
    startdate = "";
  } else {
    if (!(regex.test(startdate) && !isNaN(new Date(startdate)))) {
      startdate = "";
    } else {
      startdate = new Date(startdate).toISOString();
    }
  }

  if (!enddate) {
    enddate = "";
  } else {
    if (!(regex.test(enddate) && !isNaN(new Date(enddate)))) {
      enddate = "";
    } else {
      enddate = new Date(enddate).toISOString();
    }
  }

  if (!productid && isNaN(productid)) {
    productid = 0;
  }

  if (!categoryid && isNaN(categoryid)) {
    categoryid = 0;
  }

  if (!region) {
    region = "";
  } else {
    region = region.toLowerCase();
    if (region === "all") {
      region = "";
    }
    if (!(region === "west" || region === "central" || region === "east" || region === "south" || region === "north")) {
      region = "";
    }
  }

  if (!gender) {
    gender = "";
  } else {
    gender = gender.toUpperCase();
    if (gender !== "M" && gender !== "F") {
      gender = "";
    }
  }

  return ordersModel
    .generateStats(startdate, enddate, region, gender, categoryid, productid)
    .then((result) => {
      return res.status(200).json({ stat: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// ca2

router.get("/order/count", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  let status = req.query.status !== undefined ? req.query.status.toLowerCase() : "";
  let month = req.query.month !== undefined && !isNaN(req.query.month) && req.query.month >= 0 && req.query.month < 13 ? parseInt(req.query.month, 10) : 0;
  let year = req.query.year !== undefined && !isNaN(req.query.year) && req.query.year > 0 ? parseInt(req.query.year, 10) : 0;
  let search = req.query.search !== undefined && req.query.search.trim() !== "" ? req.query.search.trim() : "";

  if (status !== "delivered" && status !== "in progress" && status !== "confirmed" && status !== "received" && status !== "cancelled") {
    status = "";
  }

  return ordersModel
    .getTotalOrderCount(id, status, month, year, search)
    .then((count) => {
      return res.status(200).json({ count: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/order", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  let offset = req.query.offset !== undefined && !isNaN(req.query.offset) && req.query.offset > 0 ? parseInt(req.query.offset, 10) : 0;
  let status = req.query.status !== undefined ? req.query.status.toLowerCase() : "";
  let month = req.query.month !== undefined && !isNaN(req.query.month) && req.query.month >= 0 && req.query.month < 13 ? parseInt(req.query.month, 10) : 0;
  let year = req.query.year !== undefined && !isNaN(req.query.year) && req.query.year > 0 ? parseInt(req.query.year, 10) : 0;
  let search = req.query.search !== undefined && req.query.search.trim() !== "" ? req.query.search.trim() : "";
  let limit = req.query.limit !== undefined && !isNaN(req.query.limit) && req.query.limit > 5 ? parseInt(req.query.limit, 10) : 5;

  if (status !== "delivered" && status !== "in progress" && status !== "confirmed" && status !== "received" && status !== "cancelled") {
    status = "";
  }

  return ordersModel
    .getOrderByIdStatusDate(id, offset, limit, status, month, year, search)
    .then((order) => {
      const orderIDArr = order.map((o) => o.orderid);

      return ordersModel
        .getOrderItemByOrderId(orderIDArr)
        .then((orderitem) => {
          let productIDArr = [];

          orderitem.forEach((item) => {
            let index = order.findIndex((o) => o.orderid === item.orderid);

            if (!productIDArr.includes(item.productid)) {
              productIDArr.push(item.productid);
            }

            let product = {
              productdetailid: item.productdetailid,
              productname: item.productname,
              rating: item.rating,
              qty: item.qty,
              unitprice: item.unitprice,
              colour: item.colourname,
              size: item.sizename,
              productid: item.productid,
            };

            if (index !== -1) {
              if (!order[index].productdetails) {
                order[index].productdetails = [product];
              } else {
                order[index].productdetails.push(product);
              }
            }
          });

          return productsModel
            .getProductImageByProductIDArr(productIDArr)
            .then((productImages) => {
              for (let i = 0; i < order.length; i++) {
                let productDetails = order[i].productdetails;
                for (let j = 0; j < productDetails.length; j++) {
                  for (let k = 0; k < productImages.length; k++) {
                    if (productDetails[j].productid === productImages[k].productid) {
                      order[i].productdetails[j].image = productImages[k].url;
                      break;
                    }
                  }
                }
              }
              return res.status(200).json({ data: order });
            })
            .catch((error) => {
              console.error(error);
              throw error;
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

router.get("/order/item/:orderid", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role !== "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;

  if (!orderid || isNaN(orderid)) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  return ordersModel
    .getOrderItemByOrderIdForRefund(orderid, id)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// router.get("/order/receipt/:orderid", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
//   const id = req.body.id;
//   const email = req.body.email;
//   const role = req.body.role;

//   // checking whether the user token is valid
//   if (!id || isNaN(id) || !role || !email || role !== "customer") {
//     return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
//   }

//   const orderid = req.params.orderid;
// });

router.post("/order/create", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role !== "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const { addressID, cart } = req.body;
  if (addressID === undefined || isNaN(addressID) || cart === undefined || cart.length === 0) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  const productDetailIDArr = cart.map((item) => item.productdetailid);

  return Promise.all([productsModel.getProductQtyPriceByProductDetailID(productDetailIDArr), addressModel.getAddresses(addressID, id)])
    .then(([productResult, addressResult]) => {
      let totalAmount = 0,
        totalQty = 0;

      const condition = cart.every((item, index) => {
        const matchedProduct = productResult.find((item2) => item2.productdetailid === item.productdetailid);
        totalAmount += item.qty * matchedProduct.unitprice;
        cart[index].unitprice = matchedProduct.unitprice;
        totalQty += item.qty;

        return !matchedProduct || item.qty <= matchedProduct.qty;
      });

      if (!condition || addressResult.length === 0) {
        return res.status(400).json({ error: errorMessages.INSUFFICIENT_PRODUCT_QUANTITY });
      }

      let deliveryAddress = "Blk " + addressResult.block_no;
      if (addressResult.street) {
        deliveryAddress += ", " + addressResult.street;
      }
      if (deliveryAddress.unit_no) {
        deliveryAddress += ", " + addressResult.unit_no;
      }
      if (deliveryAddress.building) {
        deliveryAddress += ", " + addressResult.building;
      }
      deliveryAddress += ", Singapore " + addressResult.postal_code;

      totalAmount += totalAmount * 0.09 + 1.5;
      totalAmount = parseFloat(totalAmount.toFixed(2));

      const orderID = Date.now().toString() + Math.floor(Math.random() * 1000);

      return ordersModel
        .createOrder(orderID, totalQty, totalAmount, deliveryAddress, id, 1.5, 9)
        .then((orderCount) => {
          if (orderCount === 1) {
            return ordersModel.createOrderItems(cart, orderID).then((orderItemResult) => {
              if (orderItemResult === cart.length) {
                const executeReduceQty = cart.map((c) => productsModel.reduceProductQtyById(c.qty, c.productdetailid));
                return Promise.all(executeReduceQty).then((result) => {
                  // checking
                  return Promise.all([cartModel.deleteCartByProductDetailIDArr(id, productDetailIDArr), productsModel.updateProductStatus(cart.map((c) => c.productdetailid))])
                    .then((result) => {
                      return res.status(201).json({ orderid: orderID });
                    })
                    .catch((error) => {
                      console.error(error);
                      return res.status(201).json({ orderid: orderID });
                    });
                });
              } else {
                return ordersModel.deleteOrder(orderID).then(() => {
                  throw new Error(errorMessages.UNKNOWN_ERROR);
                });
              }
            });
          } else {
            throw new Error(errorMessages.UNKNOWN_ERROR);
          }
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.put("/order/:orderid/cancel", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || role != "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: errorMessages.INVALID_ID });
  }

  return Promise.all([ordersModel.checkOrderExists(orderid, "in progress", id), paymentsModel.checkPaymentSuccess(orderid), ordersModel.getOrderItemQtyByOrderId(orderid)])
    .then(([orderExists, paymentSuccess, orderItem]) => {
      if (orderExists && orderItem) {
        if (paymentSuccess) {
          const transactionid = paymentSuccess.transactionid;
          return paymentsModel.refundPayment(transactionid).then((result) => {
            if (result) {
              const updateProductQtyExecute = orderItem.map((item) => productsModel.increaseProductQtyById(item.qty, item.productdetailid));
              return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, "cancelled"), ...updateProductQtyExecute])
                .then(([result, ...updateProductQtyResult]) => {
                  if (result === 1 && updateProductQtyResult.every((r) => r === 1)) {
                    return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
                  } else {
                    return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
                  }
                })
                .catch((error) => {
                  console.error(error);
                  throw error;
                });
            } else {
              return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
            }
          });
        } else {
          const updateProductQtyExecute = orderItem.map((item) => productsModel.increaseProductQtyById(item.qty, item.productdetailid));
          return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, "cancelled"), ...updateProductQtyExecute])
            .then(([result, ...updateProductQtyResult]) => {
              if (result === 1 && updateProductQtyResult.every((r) => r === 1)) {
                return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
              } else {
                return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
              }
            })
            .catch((error) => {
              console.error(error);
              throw error;
            });
        }
      } else {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.put("/order/:orderid/received", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || role != "customer") {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: errorMessages.INVALID_ID });
  }

  return Promise.all([ordersModel.checkOrderExists(orderid, "delivered", id), ordersModel.getOrderItemProductIDByOrderId(orderid)])
    .then(([orderExists, orderItem]) => {
      if (orderExists && orderItem) {
        const updateSoldQtyExecute = orderItem.map((item) => productsModel.increaseSoldQty(item.qty, item.productid));

        return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, "received"), ...updateSoldQtyExecute])
          .then(([result, ...updateProductQtyResult]) => {
            if (result === 1 && updateProductQtyResult.every((r) => r === 1)) {
              return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
            } else {
              return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
            }
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      } else {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// admin

router.get("/order/item/:orderid/:userid/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;
  const userid = req.params.userid;

  if (!orderid || isNaN(orderid) || !userid || isNaN(userid)) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  return ordersModel
    .getOrderItemByOrderIdForRefund(orderid, userid)
    .then((result) => {
      return productsModel
        .getProductImageByProductIDArr(result.map((item) => item.productid))
        .then((productImages) => {
          for (let i = 0; i < result.length; i++) {
            let selectedImage = productImages.find((item) => item.productid === result[i].productid);
            if (selectedImage) {
              result[i].url = selectedImage.url;
            }
          }
          return res.status(200).json({ data: result });
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

router.get("/order/count/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return ordersModel
    .getOrderCountByAdmin()
    .then((count) => {
      return res.json({ data: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.get("/order/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempOffset = req.query.offset;
  const tempLimit = req.query.limit;
  const offset = tempOffset !== undefined && !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
  const limit = tempLimit !== undefined && !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

  return ordersModel
    .getOrderByAdmin(offset, limit)
    .then(function (order) {
      return paymentsModel
        .getPaymentByOrderID(order.map((o) => o.orderid))
        .then((payment) => {
          payment.forEach((p) => {
            let index = order.findIndex((o) => o.orderid === p.orderid);
            if (index !== -1) {
              order[index].paymentstatus = p.paymentstatus;
            }
          });
          return res.json({ data: order });
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

router.put("/order/:orderid/confirm/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: errorMessages.INVALID_ID });
  }

  return Promise.all([ordersModel.checkOrderExists(orderid, "in progress"), paymentsModel.checkPaymentSuccess(orderid)])
    .then(([orderExists, paymentSuccess]) => {
      if (orderExists && paymentSuccess) {
        return ordersModel.updateOrderStatusByAdmin(orderid, "confirmed").then((result) => {
          if (result === 1) {
            return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
          } else {
            return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
          }
        });
      } else {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.put("/order/:orderid/cancel/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const orderid = req.params.orderid;

  if (!orderid || isNaN(orderid)) {
    return res.status(400).send({ error: errorMessages.INVALID_ID });
  }

  return Promise.all([ordersModel.checkOrderExists(orderid, "in progress"), paymentsModel.checkPaymentSuccess(orderid), ordersModel.getOrderItemQtyByOrderId(orderid)])
    .then(([orderExists, paymentSuccess, orderItem]) => {
      if (orderExists && orderItem) {
        if (paymentSuccess) {
          const transactionid = paymentSuccess.transactionid;
          return paymentsModel.refundPayment(transactionid).then((result) => {
            if (result) {
              const updateProductQtyExecute = orderItem.map((item) => productsModel.increaseProductQtyById(item.qty, item.productdetailid));
              return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, "cancelled"), ...updateProductQtyExecute])
                .then(([result, ...updateProductQtyResult]) => {
                  if (result === 1 && updateProductQtyResult.every((r) => r === 1)) {
                    return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
                  } else {
                    return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
                  }
                })
                .catch((error) => {
                  console.error(error);
                  throw error;
                });
            } else {
              return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
            }
          });
        } else {
          const updateProductQtyExecute = orderItem.map((item) => productsModel.increaseProductQtyById(item.qty, item.productdetailid));
          return Promise.all([ordersModel.updateOrderStatusByAdmin(orderid, "cancelled"), ...updateProductQtyExecute])
            .then(([result, ...updateProductQtyResult]) => {
              if (result === 1 && updateProductQtyResult.every((r) => r === 1)) {
                return res.status(201).json({ message: successMessages.UPDATE_SUCCESS });
              } else {
                return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
              }
            })
            .catch((error) => {
              console.error(error);
              throw error;
            });
        }
      } else {
        return res.status(400).json({ error: errorMessages.INVALID_ID });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/order/stat/revenue/quarter", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  return ordersModel
    .getOrderRevenueStatByQuarter(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/order/stat/revenue/quarter/detail", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token j  vfvg is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempQuarter = req.query.quarter;
  const tempGender = req.query.gender;
  const tempYear = req.query.year;
  const past10YearDate = new Date();
  past10YearDate.setFullYear(new Date().getFullYear() - 10);
  const past10Year = past10YearDate.getFullYear();

  if (tempQuarter === undefined || isNaN(tempQuarter) || !(tempQuarter > 0 && tempQuarter < 5)) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }
  if (tempGender === undefined || !(tempGender === "m" || tempGender === "f")) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }
  if (tempYear === undefined || isNaN(tempYear) || tempYear < past10Year) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  const quarter = tempQuarter;
  const gender = tempGender;
  const year = tempYear;

  return Promise.all([ordersModel.getUserOrderRevenueQuarterDetail(quarter, gender.toUpperCase(), year), ordersModel.getProductOrderRevenueQuarterDetail(quarter, gender.toUpperCase(), year)])
    .then(([result1, result2]) => {
      return res.status(200).json({ user: result1, product: result2 });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/order/stat/revenue/month", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  return ordersModel
    .getOrderRevenueStatByMonth(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/order/stat/revenue/month/detail", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempMonth = req.query.month;
  const tempGender = req.query.gender;
  const tempYear = req.query.year;
  const past10YearDate = new Date();
  past10YearDate.setFullYear(new Date().getFullYear() - 10);
  const past10Year = past10YearDate.getFullYear();

  if (tempMonth === undefined || isNaN(tempMonth) || !(tempMonth > 0 && tempMonth < 13)) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }
  if (tempGender === undefined || !(tempGender === "m" || tempGender === "f")) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }
  if (tempYear === undefined || isNaN(tempYear) || tempYear < past10Year) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  const month = tempMonth;
  const gender = tempGender;
  const year = tempYear;

  return Promise.all([ordersModel.getUserOrderRevenueMonthDetail(month, gender.toUpperCase(), year), ordersModel.getProductOrderRevenueMonthDetail(month, gender.toUpperCase(), year)])
    .then(([result1, result2]) => {
      return res.status(200).json({ user: result1, product: result2 });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// admin

// ca2
module.exports = router;
