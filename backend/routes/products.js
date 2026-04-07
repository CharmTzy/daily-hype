//Name: Thu Htet San
//Admin No: 2235022
//Class: DIT/FT/2B/02
//Date: 16.11.2023
//Description: router for products

const bodyParser = require("body-parser");
const express = require("express");
const { EMPTY_RESULT_ERROR, errorMessages, successMessages } = require("../errors");
const productsModel = require("../models/products");
const imageModel = require("../models/images");
const validationFn = require("../middlewares/validateToken");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudinary");
const refreshFn = require("../middlewares/refreshToken");
const redis = require("../functions/redis-cache");
const path = require("path");

// CA2

router.get("/product/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempOffset = req.query.offset;
  const tempLimit = req.query.limit;
  const offset = tempOffset !== undefined && !isNaN(tempOffset) && tempOffset > 0 ? tempOffset : 0;
  const limit = tempLimit !== undefined && !isNaN(tempLimit) && tempLimit > 0 ? tempLimit : 10;

  return productsModel
    .getProductsByLimit(offset, limit)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/count/admin", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  return productsModel
    .getTotalProductCount()
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/detail/count", (req, res) => {
  let types = req.query.type ? req.query.type.split(",") : [];
  let colours = req.query.colour ? req.query.colour.split(",") : [];
  let sizes = req.query.size ? req.query.size.split(",") : [];
  let categories = req.query.category ? req.query.category.split(",") : [];

  types = types.filter((t) => !isNaN(t));
  colours = colours.filter((c) => !isNaN(c));
  sizes = sizes.filter((s) => !isNaN(s));
  categories = categories.filter((c) => !isNaN(c));

  return productsModel
    .getProductCountByFilter(types, colours, sizes, categories)
    .then((count) => {
      return res.status(200).json({ data: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/detail", (req, res) => {
  let types = req.query.type ? req.query.type.split(",") : [];
  let colours = req.query.colour ? req.query.colour.split(",") : [];
  let sizes = req.query.size ? req.query.size.split(",") : [];
  let categories = req.query.category ? req.query.category.split(",") : [];
  const offset = req.query.offset && !isNaN(req.query.offset) ? req.query.offset : 0;
  const limit = req.query.limit && !isNaN(req.query.limit) ? req.query.limit : 0;

  types = types.filter((t) => !isNaN(t));
  colours = colours.filter((c) => !isNaN(c));
  sizes = sizes.filter((s) => !isNaN(s));
  categories = categories.filter((c) => !isNaN(c));

  return productsModel
    .getProductExploreByFilter(types, colours, sizes, categories, limit, offset)
    .then((product) => {
      const productIDArr = product.map((p) => p.productid);
      return Promise.all([productsModel.getProductDetailByProductIDArr(productIDArr), imageModel.getImageByProductIDArr(productIDArr)])
        .then(([detail, image]) => {
          product = product.map((p) => ({ ...p, url: image.filter((i) => i.productid === p.productid).map((i) => i.url) }));

          detail.forEach((item) => {
            let index = product.findIndex((p) => p.productid === item.productid);

            if (index !== -1) {
              if (product[index].detail) {
                product[index].detail.push({ hex: item.hex, sizename: item.size, colourname: item.colour });
              } else {
                product[index].detail = [{ hex: item.hex, sizename: item.size, colourname: item.colour }];
              }
            }
          });
          return res.status(200).json({ data: product });
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

router.get("/product/types", (req, res) => {
  return redis
    .getOrSetCache(`product_types`, () => {
      return productsModel
        .getTypes()
        .then((result) => {
          return result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/categories", (req, res) => {
  return redis
    .getOrSetCache(`product_categories`, () => {
      return productsModel
        .getCategories()
        .then((result) => {
          return result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/colours", (req, res) => {
  return redis
    .getOrSetCache(`product_colours`, () => {
      return productsModel
        .getColours()
        .then((result) => {
          return result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/sizes", (req, res) => {
  return redis
    .getOrSetCache(`product_sizes`, () => {
      return productsModel
        .getSizes()
        .then((result) => {
          return result;
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// CA2

router.get("/productStat", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return productsModel
    .generateStats()
    .then((stats) => {
      return res.json({ stat: stats });
    })
    .catch((error) => {
      res.status(500).json({ error: "Unknown Error" });
    });
});

//get the total count of products for admin
router.get("/productsCountAdmin", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return productsModel
    .getTotalProductCount()
    .then((count) => {
      return res.json({ count: count });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//get products for admin by limit
router.get("/productsAdmin", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const offset = req.query.offset;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  if (!offset || isNaN(offset)) {
    offset = 0;
  }

  return productsModel
    .getProductsByLimit(offset, 10)
    .then(function (product) {
      return res.json({ product: product });
    })
    .catch(function (error) {
      console.error(error);
      if (error instanceof EMPTY_RESULT_ERROR) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.use(bodyParser.json());
//image upload part
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/admin/js/uploads/"); // Set the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Set the file name
  },
});
const upload = multer({ storage: storage });

//uplaod image to cloudinary and create product image
router.post("/uploadProductPhoto", validationFn.validateToken, upload.single("photo"), (req, res) => {
  const file = req.file;

  console.log("Received photo upload request:", { file });

  if (!file) {
    console.error("No file provided");
    return res.status(400).json({ error: "No file provided" });
  }
  return imageModel
    .uploadCloudinaryPhotos(file)
    .then((result) => {
      var inputString = result.public_id;
      var imageId = inputString.split("/")[1];
      return imageModel
        .createProductImage(imageId, result.original_filename, result.url)
        .then((result1) => {
          console.log("IMAGE FINAL");
          console.log(result1);
          return res.json({ public_id: result1 });
        })
        .catch((error) => {
          console.error("Error:", error);
          return res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      return res.status(500).send("Internal Server Error");
    });
});

router.post("/createProductImage", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const { productId, imageId } = req.body;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  console.log(req.body);
  productsModel
    .createProductImage(productId, imageId)
    .then((result) => {
      // Handle the result if needed
      return res.json({ message: "Insert Success" });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/products", function (req, res) {
  const page = req.query.page || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Wait for both promises to resolve
  return Promise.all([productsModel.getTotalProductCount(), productsModel.getProductsByLimit(offset, limit)])
    .then(([total, products]) => {
      const totalPages = Math.ceil(total / limit);

      return res.json({
        products: products,
        totalPages: totalPages,
      });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/productDetailAdmin/:productid", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productid = req.params.productid;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return Promise.all([productsModel.getProductDetailWithoutImageByProductID(productid), productsModel.getProductByProductID(productid)])
    .then(([productdetail, product]) => {
      return res.json({ product: product, productdetail: productdetail });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//get product detail by product id
router.get("/productDetail/:productID", function (req, res) {
  const productID = req.params.productID;
  return productsModel
    .getProductDetailByproductID(productID)
    .then(function (productDetail) {
      return res.json({ productDetail: productDetail });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
//get product by product id
router.get("/productAdmin/:productID/CA1", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productID = req.params.productID;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  return productsModel
    .getProductByProductID(productID)
    .then(function (product) {
      return res.json({ product: product });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//get categories
router.get("/categories", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  return productsModel
    .getCategories()
    .then(function (categories) {
      return res.json({ categories: categories });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//get colours
router.get("/colours", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  return productsModel
    .getColours()
    .then(function (colours) {
      return res.json({ colours: colours });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//get sizes
router.get("/sizes", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }
  return productsModel
    .getSizes()
    .then(function (sizes) {
      return res.json({ sizes: sizes });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// create a new product
router.post("/productAdmin/CA1", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { Name, Description, unitPrice, Category, Color } = req.body;

  const resultArray = [];

  console.log("INSIDE ROUTER");
  console.log(Category);
  console.log(Color);

  // Validate and process the product data
  if (!Name || !Description || !unitPrice || !Category || !Color || !Object.keys(Color).length || Object.values(Color).some((colorData) => !Object.keys(colorData).some((size) => colorData[size]))) {
    return res.status(400).json({ error: { Name, Description, unitPrice, Category, Color } });
  }

  for (const color in Color) {
    const sizes = Color[color];
    for (const size in sizes) {
      const quantity = sizes[size];
      resultArray.push({ color, size, quantity });
    }
  }

  console.log(resultArray);

  // Call the model function to get category ID
  return productsModel
    .getCategoryID(Category)
    .then(function (categoryID) {
      console.log(categoryID);
      // Call the model function to create the product
      return productsModel
        .createProductAndGetID({ productName: Name, description: Description, unitPrice, categoryID })
        .then(function (productID) {
          console.log(productID);

          const selectColour = [];
          const selectSize = [];

          resultArray.forEach((item) => {
            selectColour.push(productsModel.getColourID(item.color));
            selectSize.push(productsModel.getSizeID(item.size));
          });

          return Promise.all(selectColour).then((result) => {
            console.log("GETTING COLOUR");
            console.log(result);
            resultArray.forEach((item) => {
              for (let i = 0; i < result.length; i++) {
                if (item.color === result[i].name) {
                  item.color = result[i].colourid;
                }
              }
            });
            return Promise.all(selectSize).then((result) => {
              resultArray.forEach((item) => {
                for (let i = 0; i < result.length; i++) {
                  if (item.size === result[i].name) {
                    item.size = result[i].sizeid;
                  }
                }
              });
              console.log(resultArray);
              const insertProductDetail = [];
              resultArray.forEach((item) => {
                insertProductDetail.push(productsModel.createProductDetail(productID, item.color, item.size, item.quantity, "In Stock"));
              });

              return Promise.all(insertProductDetail)
                .then((result) => {
                  res.json({ message: "Product submitted successfully", productID: productID });
                })
                .catch((error) => {
                  console.error(error);
                  throw error;
                });
            });
          });
        })
        .catch(function (error) {
          console.error(error);
          res.status(500).json({ error: "Unknown Error of sequential" });
        });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ error: "Unknown Error final" });
    });
});


router.put("/productAdmin", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {

  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;


  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { productid, name, description, unitprice, typeid, categoryid, images } = req.body;

  // Array to hold promises for parallel execution
  const promises = [productsModel.updateProduct(productid, name, description, unitprice, typeid, categoryid)];

  // Check if there are images
  if (images && Array.isArray(images) && images.length > 0) {
    // Execute image-related functions only if there are images
    promises.push(imageModel.createBatchImage(images));
    promises.push(productsModel.createBatchProductImage(productid, images));
  }

  return Promise.all(promises)
    .then(([updateCount, ...results]) => {
      // Check if the update and image creation were successful
      if (updateCount === 1 && results.every(result => result === images.length)) {
        return res.json({ message: "Update and image creation success", productID: productID });
      } else {
        throw new Error("Update or image creation failed");
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
router.put("/productDetailAdmin", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {

  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { productdetailid, quantity } = req.body;


  if (!productdetailid || isNaN(productdetailid)) {
    return res.status(400).send({ error: "Invalid Product Detail ID" });
  }

  if (!quantity || isNaN(quantity)) {
    return res.status(400).send({ error: "Invalid Quantity" });
  }


  const pdstatus = quantity > 0 ? "in stock" : "out of stock";

  return productsModel
    .updateProductDetailQty(productdetailid, quantity, pdstatus)
    .then((count) => {
      if (count === 1) {
        return res.json({ message: "Update Success" });

      } else {
        throw new Error(`Product Detail Not Found`);
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.delete("/productAdmin", validationFn.validateToken, refreshFn.refreshToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productid = req.body.productid;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return Promise.all([productsModel.deleteProductDetail(productid), imageModel.getImageIDByProductID(productid)])
    .then(([deleteCount, imageResult]) => {
      console.log(deleteCount);
      console.log(imageResult);
      return Promise.all([imageModel.deleteProductImage(productid), imageModel.deleteImage(imageResult.imageid)]).then(([deleteCount2, count]) => {
        console.log(deleteCount2);
        console.log(count);
        if (imageResult && imageResult.imageid) {
          return Promise.all([productsModel.deleteProduct(productid), imageModel.deleteCloudinaryImage(imageResult.imageid)]).then(() => {
            return res.status(201).json({ message: successMessages.DELETE_SUCCESS });
          });
        } else {
          return res.status(201).json({ message: successMessages.DELETE_SUCCESS });
        }
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

router.delete("/deleteProductDetail", validationFn.validateToken, function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productdetailid = req.query.productdetailid;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return productsModel
    .deleteProductDetailByID(productdetailid)
    .then((count) => {
      return res.status(201).json({ message: "Delete Success" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//CA2
//1.
//get side bar categories by typeid
router.get("/categories/:typeid", function (req, res) {
  const typeid = req.params.typeid;
  console.log("typeid", typeid);
  if (!typeid || isNaN(typeid)) {
    return res.status(400).json({ error: "Invalid Type ID" });
  }
  return productsModel
    .getCategoriesByType(typeid)
    .then((category) => {
      return res.json({ category: category });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
//2.
//get productcount by categoryid and isinstock
router.get("/productsCountByCategory", function (req, res) {
  const { categoryid, isinstock } = req.query;

  if (!categoryid || isNaN(categoryid) || (isinstock !== "0" && isinstock !== "1")) {
    return res.status(400).json({ error: "Invalid Request" });
  }
  return productsModel
    .getProductCountByCategoryID(categoryid, isinstock)
    .then((productCount) => {
      return res.json({ productCount: productCount[0].productcount });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});
//3.
//get products by categoryid, offset, litmit, isinstock
router.get("/ProductsWithImageAndColour", function (req, res) {
  const { categoryid, limit, offset, isinstock } = req.query;

  if (!categoryid || isNaN(categoryid) || !limit || isNaN(limit) || limit < 2 || limit > 100 || !offset || isNaN(offset) || offset < 0 || (isinstock !== "0" && isinstock !== "1")) {
    return res.status(400).json({ error: "Invalid Request" });
  }
  return productsModel
    .getProductsByCategoryID(categoryid, limit, offset, isinstock)
    .then((product) => {
      console.log(product);
      const productIDArr = [];
      const getImageExecute = [];
      const getProductColourExecute = [];

      product.forEach((item) => {
        productIDArr.push(item.productid);
        getImageExecute.push(productsModel.getImageByProductID(item.productid));
        getProductColourExecute.push(productsModel.getColourByProductID(item.productid));
      });

      return Promise.all([...getImageExecute, ...getProductColourExecute]).then((result) => {
        result.forEach((itemArr) => {
          itemArr.forEach((item) => {
            let index = product.findIndex((p) => p.productid === item.productid);
            if (item && item.imageid) {
              const imageData = { imageid: item.imageid, imagename: item.imagename, url: item.url };
              product[index].image = product[index].image ? [...product[index].image, imageData] : [imageData];
            }
            if (item && item.colourid) {
              const colourData = { colourid: item.colourid, colourname: item.colourname, hex: item.hex };
              product[index].colour = product[index].colour ? [...product[index].colour, colourData] : [colourData];
            }
          });
        });
        return res.json({ product: product });
      });

    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//4.
//search product by name and filter
router.post("/searchProduct", function (req, res) {
  try {
    const { ORDER_BY, SEARCH_TEXT, FILTERS, PRICE, LIMIT, OFFSET, INSTOCK } = req.body;
    console.log(`${ORDER_BY},${SEARCH_TEXT}, ${JSON.stringify(FILTERS)},${PRICE}`);

    let [MIN_PRICE, MAX_PRICE] = PRICE ? PRICE.split(",").map(parseFloat) : [];

    return productsModel
      .getProductByFilter(ORDER_BY, SEARCH_TEXT, FILTERS, MIN_PRICE, MAX_PRICE, LIMIT, OFFSET, INSTOCK)
      .then(function (productDetail) {
        return res.json({ product: productDetail });
        // return res.json({ productDetail: productDetail });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: "Unknown Error" });
      });
    // res.status(200).json({"message": JSON.stringify(FILTERS)});
  } catch (error) {
    res.status(500).send("Server error");
  }
});
//5.
//searched product count
router.post("/searchProductCount", function (req, res) {
  try {
    const { SEARCH_TEXT, FILTERS, PRICE, INSTOCK } = req.body;

    let [MIN_PRICE, MAX_PRICE] = PRICE ? PRICE.split(",").map(parseFloat) : [];

    return productsModel
      .getSearchedProductCount(SEARCH_TEXT, FILTERS, MIN_PRICE, MAX_PRICE, INSTOCK)
      .then((count) => {
        return res.json({ count: count });
        // return res.json({ productDetail: productDetail });
      })
      .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: "Unknown Error" });
      });
    // res.status(200).json({"message": JSON.stringify(FILTERS)});
  } catch (error) {
    res.status(500).send("Server error");
  }
});

//6.
//get filter options (type, category, color, size)
router.get("/filterOptions", function (req, res) {
  console.log("inside");
  return Promise.all([productsModel.getTypes(), productsModel.getCategories(), productsModel.getColours(), productsModel.getSizes()]).then(([types, categories, colours, sizes]) => {
    const result = {
      type: types,
      category: categories,
      colour: colours,
      size: sizes,
    };
    return res.json(result);
  });
});

//7.
//get product and detail by productid
router.get("/productAndDetail", function (req, res) {

  const productid = req.query.productid;
  console.log(req.query.productid)

  if (!productid || isNaN(productid)) {
    return res.status(400).json({ error: "Invalid Request" });
  }

  return productsModel
    .getProductAndDetailByProductID(productid)
    .then((productdetail) => {
      return res.json({ productdetail: productdetail });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//8.
//create product
router.post("/productAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { name, description, unitPrice, categoryid, typeid, productDetails, images } = req.body;

  // Define expected structure
  const product = {
    name: name,
    description: description,
    unitPrice: unitPrice,
    categoryid: categoryid,
    typeid: typeid
  };

  if (!(Object.values(product).every(value => value !== undefined && value !== null)) || !productDetails || !productDetails[0] || !images || !images[0]) {
    return res.status(400).json({ error: "Invalid Input" });
  }

  const filePaths = images.map((image) => path.join(__dirname, "../uploads/" + id + "/" + image));
  return productsModel
    .createProductAndGetID(product)
    .then(function (productID) {

      const insertProductDetail = [];
      productDetails.forEach((item) => {
        pdstatus = "out of stock"
        if (item.quantity > 0) {
          pdstatus = "in stock"
        } else {
          pdstatus = "out of stock"
        }
        insertProductDetail.push(productsModel.createProductDetail(productID, item.colourid, item.sizeid, item.quantity, pdstatus));
      });

      return Promise.all([insertProductDetail, imageModel.uploadMultipleImagesToCloudinary(filePaths)])
        .then(([detailResult, imageResult]) => {

          const imageArr = imageResult.map((r) => ({ imageid: r.public_id, imagename: r.original_filename, url: r.secure_url }));
          return Promise.all([imageModel.createBatchImage(imageArr), productsModel.createBatchProductImage(productID, imageArr)])
            .then(([imageCount, productImageCount]) => {
              if (imageCount == imageArr.length && productImageCount == imageArr.length) {
                return res.json({ message: "Product submitted successfully", productID: productID });
              } else {

                return Promise.all([
                  productsModel.deleteProductImage(productID),
                  imageModel.deleteMultipleImagesFromCloudinary(imageResult.map((r) => r.public_id)),
                  productsModel.deleteProductDetail(productID),
                  productsModel.deleteProduct(productID)
                ])
                  .then((deleteCloudinaryImageResult, deleteProductResult, deleteProductDetailResult) => {
                    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
                  });
              }

            });
        })
        .catch((error) => {

          console.error(error);
          //delete the product if error inserting product detail or image to cloudinary
          return Promise.all([
            productsModel.deleteProductImage(productID),
            productsModel.deleteProductDetail(productID),
            productsModel.deleteProduct(productID),
          ])
            .then(() => {
              throw error;
            })
            .catch(() => {
              return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
            });
        });


    });
});

//9.
//get product and details by productid
router.get("/productAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  const productid = req.query.producid;

  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  if (!productid || isNaN(productid)) {
    return res.status(400).json({ error: "Invalid Request" });
  }

  return productsModel
    .getProductAndDetailByProductID(productid)
    .then((productdetail) => {
      return res.json({ productdetail: productdetail });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//10.
//create product detail
router.post("/productDetailAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {


  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;


  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }


  const { productid, colourid, sizeid, quantity } = req.body;

  const pdstatus = quantity > 0 ? "in stock" : "out of stock";
  productsModel.createProductDetail(productid, colourid, sizeid, quantity, pdstatus)
    .then((result) => {
      return res.status(201).json({ message: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

//11.
//create colour
router.post("/colourAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;
  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { colourname, hex } = req.body;

  return productsModel.getColourByName(colourname)
    .then((existingColour) => {
      if (existingColour && existingColour.length > 0) {
        return res.status(400).json({ error: "Colour with the same name already exists" });
      }

      // If not, create the colour
      return productsModel
        .createColour(colourname, hex)
        .then((result) => {
          if (result.rowCount == 1)
            return res.json({ message: successMessages.CREATE_SUCCESS });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
        });

    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });

});

// 12.
// create category
router.post("/categoryAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { categoryname } = req.body;

  return productsModel.getCategoryByName(categoryname)
    .then((existingCategory) => {
      if (existingCategory && existingCategory.length > 0) {
        return res.status(400).json({ error: "Category with the same name already exists" });
      }

      // If not, create the category
      return productsModel
        .createCategory(categoryname)
        .then((result) => {
          if (result.rowCount == 1)
            return res.json({ message: successMessages.CREATE_SUCCESS });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
        });

    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});


// 13.
// create size
router.post("/sizeAdmin", validationFn.validateToken, refreshFn.refreshToken, async function (req, res) {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // Check if the user token is valid
  if (!id || isNaN(id) || !role || !email || (role !== "admin" && role !== "manager")) {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const { sizename } = req.body;

  return productsModel.getSizeByName(sizename)
    .then((existingSize) => {
      if (existingSize && existingSize.length > 0) {
        return res.status(400).json({ error: "Size with the same name already exists" });
      }

      // If not, create the size
      return productsModel
        .createSize(sizename)
        .then((result) => {
          if (result.rowCount == 1)
            return res.json({ message: successMessages.CREATE_SUCCESS });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
        });

    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: errorMessages.UNKNOWN_ERROR });
    });
});

//15
router.get("/product/stat/quarter", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  return productsModel
    .getProductStatByQuarter(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

//16
router.get("/product/stat/monthly", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  // checking whether the user token is valid
  if (!id || isNaN(id) || !role || !email || (role != "admin" && role != "manager")) {
    return res.status(403).send({ error: errorMessages.UNAURHOTIZED });
  }

  const tempYear = req.query.year;
  const year = tempYear !== undefined && !isNaN(tempYear) && tempYear > 0 ? tempYear : new Date().getFullYear();

  return productsModel
    .getProductStatByMonth(year)
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});
//CA2-end

// Name: Zay Yar Tun
// checking product information in shopping cart

router.get("/distinctproduct", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const role = req.body.role;
  const email = req.body.email;

  if (!id || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return productsModel
    .getDistinctProduct()
    .then((product) => {
      return res.json({ product: product });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/distinctcategory", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const role = req.body.role;
  const email = req.body.email;

  if (!id || !role || !email || role != "admin") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  return productsModel
    .getDistinctCategory()
    .then((category) => {
      return res.json({ category: category });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Unknown Error" });
    });
});

router.get("/productDetailForCart", validationFn.validateToken, refreshFn.refreshToken, (req, res) => {
  const id = req.body.id;
  const email = req.body.email;
  const role = req.body.role;

  if (!id || isNaN(id) || !email || !role || role != "customer") {
    return res.status(403).send({ error: "Unauthorized Access" });
  }

  const productDetailIDArr = req.query.productDetailID;
  const productDetailID = productDetailIDArr.split(",").map(Number);
  return productsModel
    .getProductDetailByIds(productDetailID)
    .then(function (productDetail) {
      const productIDArr = [];

      productDetail.forEach((item) => {
        if (!productIDArr.includes(item.productid)) {
          productIDArr.push(item.productid);
        }
      });
      return productsModel.getProductImageByProductIDArr(productIDArr).then((productImages) => {
        for (let i = 0; i < productDetail.length; i++) {
          for (let j = 0; j < productImages.length; j++) {
            if (productDetail[i].productid === productImages[j].productid) {
              productDetail[i].image = productImages[j].url;
              break;
            }
          }
        }
        return res.json({ productDetail: productDetail });
      });
    })
    .catch(function (error) {
      console.error(error);
      return res.status(500).json({ error: "Unknown Error" });
    });
});

// CA2
router.get("/product/latest", (req, res) => {
  const limit = req.query.limit || 10;
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  return redis
    .getOrSetCache(`latest?limit=${limit}`, () => {
      return productsModel.getProductByLimit(limit).then((product) => {
        const productIDArr = product.map((p) => p.productid);

        return Promise.all([productsModel.getProductDetailByProductIDArr(productIDArr), imageModel.getImageByProductIDArr(productIDArr)])
          .then(([detail, image]) => {
            product.forEach((item) => {
              item.detail = detail.filter((d) => d.productid === item.productid).map((d) => ({ ...d, productid: undefined }));
            });

            product = product.map((p) => ({ ...p, url: image.filter((i) => i.productid === p.productid).map((i) => i.url) }));
            return product;
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

router.get("/product/bestselling", (req, res) => {
  const limit = req.query.limit || 10;
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  return redis
    .getOrSetCache(`bestselling?limit=${limit}`, () => {
      return productsModel.getBestSellingProductByLimit(limit).then((product) => {
        const productIDArr = product.map((p) => p.productid);
        return Promise.all([productsModel.getProductDetailByProductIDArr(productIDArr), imageModel.getImageByProductIDArr(productIDArr)])
          .then(([detail, image]) => {
            product.forEach((item) => {
              item.detail = detail.filter((d) => d.productid === item.productid).map((d) => ({ ...d, productid: undefined }));
            });
            product = product.map((p) => ({ ...p, url: image.filter((i) => i.productid === p.productid).map((i) => i.url) }));
            return product;
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      });
    })
    .then((data) => {
      return res.status(200).json({ data: data });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
    });
});

// Name: Zay Yar Tun

module.exports = router;
