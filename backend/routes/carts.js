// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

// CA2

const express = require("express");
const validateFn = require("../middlewares/validateToken");
const refreshFn = require("../middlewares/refreshToken");
const cartModel = require("../models/carts");
const productModel = require("../models/products");
const imageModel = require("../models/images");
const datatimeFunc = require("../functions/datetime");
const { errorMessages, successMessages } = require("../errors");

const router = express.Router();

// signed in user
router.get("/cart", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  return cartModel.getCart(id).then((cart) => {
    if (cart && cart.length > 0) {
      cart = cart.map((c) => ({ productdetailid: c.productdetailid, qty: c.qty }));
      return res.status(200).json({ data: cart });
    } else {
      return res.status(200).json({ data: [] });
    }
  });
});

// public user
router.post("/cart/detail/product", (req, res) => {
  let cart = req.body.cart || [];

  // checking cart data is empty
  if (cart.length === 0) {
    return res.status(400).json({ error: errorMessages.EMPTY_CART });
  }

  // checking cart data contains productdetailid and qty
  const isValid = cart.every((item) => {
    return item.productdetailid !== undefined && item.qty !== undefined && !isNaN(item.productdetailid) && !isNaN(item.qty);
  });

  // if the data (productdetailid, qty) is missing
  if (!isValid) {
    return res.status(400).json({ error: errorMessages.INVALID_CART });
  } else {
    // removing duplicate productdetailid in cart
    cart = cart.filter((item, index) => cart.findIndex((i) => i.productdetailid === item.productdetailid) === index);
  }

  // getting all productdetailid from cart
  const productDetailIDArr = cart.map((c) => c.productdetailid);

  // getting product information based on productdetailid
  return productModel
    .getProductByProductDetailIDArr(productDetailIDArr)
    .then((product) => {
      // sort the product based on productid
      product = product.sort((a, b) => a.productid - b.productid);
      let productIDArr = product.map((p) => p.productid);

      // removing product from cart that does not exist in database
      cart = cart.filter((c) => product.findIndex((p) => p.productdetailid === c.productdetailid) !== -1);

      // syncing cart with product array so that they correspond to each other
      cart = product.map((item) => cart.find((c) => item.productdetailid === c.productdetailid)).filter(Boolean);

      // getting product detail information and image
      return Promise.all([productModel.getProductDetailByProductIDArr(productIDArr), imageModel.getImageByProductIDArr(productIDArr)]).then(([detail, image]) => {
        for (let i = 0; i < product.length; i++) {
          // adding all detail information into product and removing productid from detail
          product[i].detail = detail.filter((d) => d.productid === product[i].productid).map((d) => ({ ...d, productid: undefined }));
        }

        // checking whether cart qty is more than product qty
        // if it is more, set to 1
        cart = cart.map((c, i) => {
          const productItem = product.find((p) => p.detail.some((d) => d.productdetailid === c.productdetailid));
          if (productItem) {
            const productDetail = productItem.detail.find((d) => d.productdetailid === c.productdetailid);
            if (productDetail) {
              if (c.qty > productDetail.qty) {
                c.qty = 1;
              }
            }
          }
          return { ...c };
        });

        // removing productdetailid from product
        product = product.map((p) => ({ ...p, productdetailid: undefined }));

        // adding image urls to product
        product = product.map((p) => ({ ...p, url: image.filter((i) => i.productid === p.productid).map((i) => i.url) }));

        return res.status(200).json({ data: product, cart: cart });
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// signed in user
router.post("/cart/detail", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  let tempCart = req.body.cart || [];

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  // getting current cart data from database
  return cartModel
    .getCart(id)
    .then((cart) => {
      // checking tempcart data contains productdetailid and qty
      const isValid = tempCart.every((item) => {
        return item.productdetailid !== undefined && item.qty !== undefined && !isNaN(item.productdetailid) && !isNaN(item.qty);
      });

      let newCart = [];

      // if the data (productdetailid, qty) is not missing
      if (isValid) {
        // removing duplicate cart data
        tempCart = tempCart.filter((item, index) => tempCart.findIndex((i) => i.productdetailid === item.productdetailid) === index);
        newCart = [...cart, ...tempCart];
        newCart = newCart.reduce((arr, item) => {
          // if duplicate, take the one from database
          const existingIndex = arr.findIndex((i) => i.productdetailid === item.productdetailid);
          if (existingIndex === -1) {
            arr.push(item);
          } else if (item.cartid) {
            arr[existingIndex] = item;
          }
          return arr;
        }, []);
      }

      if (newCart && newCart.length > 0) {
        // getting all productdetailid from cart
        const productDetailIDArr = newCart.map((c) => c.productdetailid);

        return productModel.getProductByProductDetailIDArr(productDetailIDArr).then((product) => {
          product = product.sort((a, b) => a.productid - b.productid);
          let productIDArr = product.map((p) => p.productid);

          // removing product from cart that does not exist in database
          newCart = newCart.filter((c) => product.findIndex((p) => p.productdetailid === c.productdetailid) !== -1);

          // syncing cart with product array so that they correspond to each other
          product = newCart.map((item) => product.find((p) => item.productdetailid === p.productdetailid)).filter(Boolean);

          return Promise.all([productModel.getProductDetailByProductIDArr(productIDArr), imageModel.getImageByProductIDArr(productIDArr)]).then(async ([detail, image]) => {
            for (let i = 0; i < product.length; i++) {
              // adding all detail information into product and removing productid from detail
              product[i].detail = detail.filter((d) => d.productid === product[i].productid).map((d) => ({ ...d, productid: undefined }));
            }

            let cartIDArr = [];

            // checking whether cart qty is more than product qty
            // if it is more, set to 1
            newCart = newCart.map((item) => {
              const productItem = product.find((p) => p.detail.some((d) => d.productdetailid === item.productdetailid));
              if (productItem) {
                const productDetail = productItem.detail.find((d) => d.productdetailid === item.productdetailid);
                if (productDetail) {
                  if (item.qty > productDetail.qty) {
                    item.qty = 1;
                    if (item.cartid !== undefined) {
                      cartIDArr.push(item.cartid);
                    }
                  }
                }
              }
              return { ...item };
            });

            // preparing for cart data for insert
            tempCart = newCart.filter((n) => !n.cartid);
            tempCart = tempCart.map((t) => ({ ...t, cartid: datatimeFunc.generateDateTimeID() }));

            // removing productdetailid from product
            product = product.map((p) => ({ ...p, productdetailid: undefined }));

            // adding image urls to product
            product = product.map((p) => ({ ...p, url: image.filter((i) => i.productid === p.productid).map((i) => i.url) }));

            // removing other information from newCart
            newCart = newCart.map((c) => ({ productdetailid: c.productdetailid, qty: c.qty }));

            if (tempCart && tempCart.length > 0) {
              // adding new cart data to database and updating cart qty for unavailable product
              if (cartIDArr.length > 0) {
                return Promise.all([cartModel.insertCart(id, tempCart), cartModel.updateCartQty(id, cartIDArr)]).then(([insertCount, updateCount]) => {
                  if (insertCount !== tempCart.length || updateCount !== cartIDArr.length) {
                    return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
                  } else {
                    return res.status(200).json({ data: product, cart: newCart });
                  }
                });
              } else {
                return cartModel.insertCart(id, tempCart).then((insertCount) => {
                  if (insertCount !== tempCart.length) {
                    return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
                  }
                  return res.status(200).json({ data: product, cart: newCart });
                });
              }
            } else {
              if (cartIDArr.length > 0) {
                return cartModel.updateCartQty(id, cartIDArr).then((updateCount) => {
                  if (updateCount !== cartIDArr.length) {
                    return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
                  }
                  return res.status(200).json({ data: product, cart: newCart });
                });
              }
              return res.status(200).json({ data: product, cart: newCart });
            }
          });
        });
      } else {
        return res.status(200).json({ data: [], cart: [] });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// signed in user
router.put("/cart/:productdetailid", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productDetailID = req.params.productdetailid;
  const cart = req.body.cart;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  if (productDetailID === undefined || isNaN(productDetailID) || productDetailID <= 0) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }

  if (!cart || cart.qty === undefined || isNaN(cart.qty) || cart.productdetailid === undefined || isNaN(cart.productdetailid)) {
    return res.status(400).json({ error: errorMessages.INVALID_INPUT });
  }

  if (cart.qty <= 0) {
    return res.status(400).json({ error: errorMessages.ZERO_QTY });
  }

  return Promise.all([productModel.getProductDetailByProductDetailID(productDetailID), cartModel.getCartByProductDetailID(id, productDetailID), cartModel.getCartByProductDetailID(id, cart.productdetailid)]).then(([result1, result2, result3]) => {
    if (result3 > 0) {
      if (result2 > 0 && cart.productdetailid != productDetailID) {
        return cartModel.deleteCartByProductDetailID(id, cart.productdetailid).then((result) => {
          if (result === 1) {
            return res.status(200).json({ message: successMessages.UPDATE_SUCCESS });
          } else {
            return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
          }
        });
      } else {
        if (result1) {
          if (cart.qty > result1.qty) {
            cart.qty = 1;
          }
          return cartModel.updateCartByProductDetailID(id, productDetailID, cart).then((rowCount) => {
            if (rowCount === 1) {
              return res.status(200).json({ message: successMessages.UPDATE_SUCCESS });
            } else {
              return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
            }
          });
        } else {
          return res.status(400).json({ error: errorMessages.PRODUCT_NOT_FOUND });
        }
      }
    } else {
      return res.status(400).json({ error: errorMessages.INVALID_INPUT });
    }
  });
});

// signed in user
router.delete("/cart/:productdetailid", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productDetailID = req.params.productdetailid;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  if (productDetailID === undefined || isNaN(productDetailID)) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }

  return cartModel.deleteCartByProductDetailID(id, productDetailID).then((deleteCount) => {
    if (deleteCount === 1) {
      return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
    } else {
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
  });
});

// admin

router.get("/cart/admin", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role !== "admin") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  const tempOffset = req.query.offset;
  const tempLimit = req.query.limit;
  const offset = tempOffset !== undefined && !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
  const limit = tempLimit !== undefined && !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

  return cartModel
    .getCartByAdmin(offset, limit)
    .then((cart) => {
      return productModel
        .getFullProductInfoByProductDetailIDArr(cart.map((c) => c.productdetailid))
        .then((product) => {
          for (let i = 0; i < cart.length; i++) {
            let selectedProduct = product.find((p) => p.productdetailid === cart[i].productdetailid);
            if (selectedProduct) {
              cart[i].product = selectedProduct;
            }
          }
          return res.status(200).json({ data: cart });
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

router.get("/cart/count/admin", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role !== "admin") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  return cartModel
    .getCartCount()
    .then((count) => {
      return res.status(200).json({ count: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.delete("/cart/:cartid/admin", validateFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role !== "admin") {
    return res.status(403).json({ error: errorMessages.UNAURHOTIZED });
  }

  const cartID = req.params.cartid;
  if (cartID === undefined || isNaN(cartID)) {
    return res.status(400).json({ error: errorMessages.INVALID_ID });
  }

  return cartModel.deleteCartByCartID(cartID).then((deleteCount) => {
    if (deleteCount === 1) {
      return res.status(200).json({ message: successMessages.DELETE_SUCCESS });
    } else {
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    }
  });
});

// admin

module.exports = router;
