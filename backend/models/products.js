//Name: Thu Htet San
//Admin No: 2235022
//Class: DIT/FT/2B/02
//Date: 16.11.2023
//Description: functions related to product management, such as creating, updating, and deleting product records in the database

const { query } = require("../database"); // Import database connection/query execution function
const { DUPLICATE_ENTRY_ERROR, EMPTY_RESULT_ERROR, SQL_ERROR_CODE, TABLE_ALREADY_EXISTS_ERROR } = require("../errors");


//get the total number of products
module.exports.getTotalProductCount = function getTotalProductCount() {
  const sql = `SELECT COUNT(*) AS total FROM product;`;

  return query(sql)
    .then((result) => {
      //console.log(result.rows[0].total);
      return result.rows[0].total;
    })
    .catch((error) => {
      throw new Error(`Error retrieving total product count: ${error.message}`);
    });
};

// Function to get category ID
module.exports.getCategoryID = function getCategoryID(categoryName) {
  const sql = "SELECT categoryID FROM Category WHERE categoryName = $1";
  return query(sql, [categoryName])
    .then((result) => {
      console.log(result);
      return result.rows.length > 0 ? result.rows[0].categoryid : null;
    })
    .catch((error) => {
      console.error("Error getting category ID:", error.message);
      throw new Error(`Error getting category ID: ${error.message}`);
    });
};

// Function to get colour ID
module.exports.getColourID = function getColourID(colourName) {
  const sql = "SELECT colourID, name FROM Colour WHERE name = $1";
  return query(sql, [colourName])
    .then((result) => (result.rows.length > 0 ? result.rows[0] : null))
    .catch((error) => {
      console.error("Error getting colour ID:", error.message);
      throw new Error(`Error getting colour ID: ${error.message}`);
    });
};

// Function to get size ID
module.exports.getSizeID = function getSizeID(sizeName) {
  const sql = "SELECT sizeID, name FROM Size WHERE name = $1";
  return query(sql, [sizeName])
    .then((result) => (result.rows.length > 0 ? result.rows[0] : null))
    .catch((error) => {
      console.error("Error getting size ID:", error.message);
      throw new Error(`Error getting size ID: ${error.message}`);
    });
};

// Function to create a product and return its ID
module.exports.createProductAndGetID = function createProductAndGetID(product) {
  const { name, description, unitPrice, categoryid, typeid } = product;
  const sql = `
        INSERT INTO Product (productName, description, unitPrice, categoryID, typeID, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING productID;`;

  return query(sql, [name, description, unitPrice, categoryid, typeid])
    .then((result) => {
      const insertedProductID = result.rows[0].productid;
      console.log("Product inserted successfully. Product ID:", insertedProductID);
      return insertedProductID;
    })
    .catch((error) => {
      console.error("Error creating product:", error.message);
      throw new Error(`Error creating product: ${error.message}`);
    });
};

// Function to create product details
module.exports.createProductDetail = function createProductDetail(productID, colour, size, qty, productStatus) {
  const sql = `
            INSERT INTO productDetail(productID, colourID, sizeID, qty, productStatus, createdAt, updatedAt)
            VALUES($1, $2, $3, $4, $5, NOW(), NOW());`;

  return query(sql, [productID, colour, size, qty, productStatus])
    .then(result => {
      const insertedId = result.id;
      console.log(`Inserted ID: ${insertedId}`);
      return insertedId;
    })
    .catch((error) => {
      console.error("Error creating product detail:", error.message);
      throw new Error(`Error creating product detail: ${error.message}`);
    });
};

//get products by limits
module.exports.getProductsByLimit = function getProductsByLimit(offset, limit) {
  const sql = `SELECT P.productid, P.productname, P.rating, P.unitprice, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, p.description, c.categoryname
  FROM
    product P
    LEFT JOIN productimage PI ON P.productID = PI.productID
    LEFT JOIN image I ON PI.imageID = I.imageID
    JOIN Category c ON c.categoryid = p.categoryid
  GROUP BY P.productid, P.productname, P.rating, P.unitprice, c.categoryname, p.description
  ORDER BY P.productid DESC
  LIMIT $1 OFFSET $2;`;
  return query(sql, [limit, offset])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving products: ${error.message}`);
    });
};

module.exports.getProductByProductID = function getProductByProductID(productid) {
  const sql = `
    SELECT P.productid, P.productname, P.rating, P.unitprice, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, p.description, c.categoryname, c.categoryid
    FROM
      product P
      LEFT JOIN productimage PI ON P.productID = PI.productID
      LEFT JOIN image I ON PI.imageID = I.imageID
      JOIN Category c ON c.categoryid = p.categoryid
      WHERE P.productid=$1
    GROUP BY P.productid, P.productname, P.rating, P.unitprice, c.categoryname, p.description, c.categoryid
    ORDER BY P.productid DESC`;

  return query(sql, [productid]).then((result) => {
    const rows = result.rows;
    return rows[0];
  });
};

module.exports.getProductDetailWithoutImageByProductID = function getProductDetailWithoutImageByProductID(productid) {
  const sql = `
        SELECT pd.productdetailid, s.name AS Size, c.name AS colour, pd.qty, pd.productstatus
        FROM ProductDetail pd
        JOIN Colour c ON c.colourid = pd.colourid
        JOIN Size s ON s.sizeid = pd.sizeid
        WHERE pd.productid = $1
    `;

  return query(sql, [productid]).then((result) => {
    const rows = result.rows;
    return rows;
  });
};

//get product by productID
module.exports.getProductDetailByproductID = function getProductDetailByID(productID) {
  const sql = `SELECT P.productName, P.unitprice, P.description, ARRAY_AGG(I.url ORDER BY I.imageID) AS urls, C.name AS "colour", S.name AS "size", PD.qty, PD.productStatus, PD.productdetailid
    FROM product P, productdetail PD, size S, colour C, productimage PI, image I
    WHERE
        P.productID = PD.productID
        AND PD.sizeID = S.sizeID
        AND PD.colourID = C.colourID
        AND P.productID = PI.productID
        AND PI.imageID = I.imageID
        AND P.productID = $1
    GROUP BY
        P.productName, P.unitprice, P.description, C.name, S.name, PD.qty, PD.productStatus, PD.productdetailid
    ;
    `;

  //     const sql=`SELECT P.productName, P.unitprice, P.description, ARRAY_AGG(I.url) AS urls, C.name AS "colour",S.name AS "size", PD.qty, PD.productStatus
  // FROM product P
  // JOIN productdetail PD ON P.productID = PD.productID
  // JOIN size S ON PD.sizeID = S.sizeID
  // JOIN colour C ON PD.colourID = C.colourID
  // JOIN productimage PI ON P.productID = PI.productID
  // JOIN image I ON PI.imageID = I.imageID
  // WHERE P.productID = 1
  // GROUP BY P.productName, P.unitprice, P.description, C.name, S.name, PD.qty, PD.productStatus;`;

  return query(sql, [productID])
    .then(function (result) {
      return result.rows;
    })
    .catch(function (error) {
      throw new Error(`Error retrieving product details: ${error.message}`);
    });
};

/*
//get categories
module.exports.getCategories = function getCategories() {
  const sql = `SELECT categoryid, categoryname FROM category`;
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving categories: ${error.message}`);
    });
};

//get colors
module.exports.getColours = function getColours() {
  const sql = `SELECT colourid, name FROM colour`;
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving colours: ${error.message}`);
    });
};

//get sizes
module.exports.getSizes = function getSizes() {
  const sql = `SELECT sizeid, name FROM size`;
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving sizes: ${error.message}`);
    });
};
*/

//delete

module.exports.deleteProduct = function deleteProduct(productid) {
  const sql = `
        DELETE FROM Product WHERE productid = $1
    `;

  return query(sql, [productid]).then((result) => {
    const rows = result.rowCount;
    if (rows.length === 0) {
      throw new EMPTY_RESULT_ERROR(`Product Not Found`);
    }
    return rows;
  });
};

module.exports.updateProduct = function updateProduct(productid, name, description, unitprice, typeid, categoryid) {
  const sql = `
        UPDATE Product 
        SET productname = $1, description = $2, unitprice = $3, typeid = $4, categoryid = $5
        WHERE productid = $6
    `;

  return query(sql, [name, description, unitprice, typeid, categoryid, productid])
    .then((result) => {
      const rows = result.rowCount;
      if (rows === 0) {
        throw new EMPTY_RESULT_ERROR(`Product Not Found`);
      }
      return rows;
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      throw error;
    });
};

module.exports.updateProductDetailQty = function updateProductDetailQty(productdetailid, quantity, pdstatus) {
  const sql = `
        UPDATE ProductDetail SET qty = $1, productstatus = $2 WHERE productdetailid = $3
    `;

  return query(sql, [quantity, pdstatus, productdetailid]).then((result) => {
    const rows = result.rowCount;
    if (rows === 0) {
      throw new EMPTY_RESULT_ERROR(`Product Detail Not Found`);
    }
    return rows;
  });
};

module.exports.deleteProductDetail = function deleteProductDetail(productid) {
  const sql = `
        DELETE FROM ProductDetail WHERE productid = $1
    `;

  return query(sql, [productid]).then((result) => {
    const rows = result.rowCount;
    return rows;
  });
};

module.exports.deleteProductDetailByID = function deleteProductDetailByID(productdetailid) {
  const sql = `
        DELETE FROM ProductDetail WHERE productdetailid = $1
    `;

  return query(sql, [productdetailid]).then((result) => {
    const rows = result.rowCount;
    return rows;
  });
};
module.exports.deleteProductImage = function deleteProductDetail(productid) {
  const sql = `
        DELETE FROM ProductImage WHERE productid = $1
    `;

  return query(sql, [productid]).then((result) => {
    const rows = result.rowCount;
    return rows;
  });
};
module.exports.createProductImage = function createProductImage(productId, imageId) {
  const sql = `
        INSERT INTO ProductImage(productid, imageid) VALUES($1,$2);
    `;
  return query(sql, [productId, imageId]).then((result) => {
    const rows = result.rowCount;
    return rows;
  });
};

module.exports.createBatchProductImage = (productid, imageArr) => {
  const sql = `
    INSERT INTO productimage (productid, imageid) VALUES 
  `;

  const queryValues = imageArr.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(", ");

  const queryParams = imageArr.map((image) => [productid, image.imageid]).flat();

  return query(sql + queryValues, [...queryParams])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.generateStats = function generateStats() {
  const sql = `
        SELECT c.categoryname, COUNT(p.*) AS count
        FROM Product p
        JOIN Category c ON c.categoryid = p.categoryid
        GROUP BY c.categoryname
    `;

  return query(sql, []).then((result) => {
    const rows = result.rows;
    return rows;
  });
};

//CA2
//1.
//get side bar categories by typeid
module.exports.getCategoriesByType = function getCategoriesByType(typeid) {
  const sql = `SELECT COUNT(*) AS "productcount", c.*
    FROM product p, category c WHERE p.categoryid=c.categoryid AND typeid=$1
    GROUP BY c.categoryid, c.categoryname`;
  //result: productcount, categoryid, categoryname, createdat, updatedat
  return query(sql, [typeid])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving categories by typeid: ${error.message}`);
    });
};

//2.
//get products by categoryid, offset, litmit, isinstock
module.exports.getProductsByCategoryID = function getProductsByCategoryID(categoryid, limit, offset, isinstock) {
  let sql = ``;
  if (isinstock == "1") {
    sql = `
            SELECT P.*
            FROM product P
            WHERE P.categoryid=$1
            AND P.productid IN (SELECT PD.productid FROM productdetail PD WHERE qty>0)
            ORDER BY P.productid DESC
            LIMIT $2 OFFSET $3;`;
  } else {
    sql = `
            SELECT P.*
            FROM product P
            WHERE P.categoryid=$1
            ORDER BY P.productid DESC
            LIMIT $2 OFFSET $3;`;
  }

  return query(sql, [categoryid, limit, offset])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving products by categoryid: ${error.message}`);
    });
};

//3.
//get productcount by categoryid and isinstock
module.exports.getProductCountByCategoryID = function getProductCountByCategoryID(categoryid, isinstock) {
  let sql = ``;
  if (isinstock == "1") {
    sql = `
            SELECT COUNT(P.*) AS productcount
            FROM product P
            WHERE P.categoryid=$1
            AND P.productid IN (SELECT PD.productid FROM productdetail PD WHERE qty>0);`;
  } else {
    sql = `
            SELECT COUNT(P.*) AS productcount
            FROM product P
            WHERE P.categoryid=$1;`;
  }
  return query(sql, [categoryid])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving product count by categoryid: ${error.message}`);
    });
};

//4.
//get image by productid
module.exports.getImageByProductID = function getImageByProductID(productid) {
  const sql = `
        SELECT I.*, P.productid
        FROM
        product P, image I, productimage PI
        WHERE P.productid=$1
        AND P.productID = PI.productID 
        AND PI.imageID = I.imageID ;`;

  return query(sql, [productid])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving image by productid: ${error.message}`);
    });
};

//5.
//get colours by productid
module.exports.getColourByProductID = function getColourByProductID(productid) {
  const sql = `
        SELECT DISTINCT C.*, PD.productid
        FROM
        productdetail PD, colour C
        WHERE PD.productid=$1
        AND PD.colourid = C.colourid;`;

  return query(sql, [productid])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving image by productid: ${error.message}`);
    });
};

//6.
//search product by filter
module.exports.getProductByFilter = (orderBy, searchText, filters, minPrice, maxPrice, limit, offset, instock) => {
  const params = [];
  let sql = `SELECT * FROM search_product WHERE 1=1`;

  Object.keys(filters).forEach((key) => {
    // Handle arrays using the IN operator
    if (key == "colour" || key == "size") {
      sql += ` AND $${params.length + 1} = ANY (${key})`;
    } else {
      sql += ` AND ${key} = $${params.length + 1}`;
    }
    params.push(filters[key]);
  });

  if (searchText != "__") {
    sql += ` AND LOWER(productname) LIKE LOWER($${params.length + 1})`;
    params.push(`%${searchText.trim()}%`);
  }
  if (minPrice !== undefined && maxPrice !== undefined) {
    sql += ` AND unitprice >= $${params.length + 1} AND unitprice <= $${params.length + 2}`;
    params.push(minPrice, maxPrice);
  }

  if (instock) {
    sql += " AND qty > 0";
  }

  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }


  sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  return query(sql, params)
    .then(function (result) {
      return result.rows;
    })
    .catch(function (error) {
      throw new Error(`Error retrieving product details: ${error.message}`);
    });
};

//7.
//get searched products count
module.exports.getSearchedProductCount = (searchText, filters, minPrice, maxPrice, instock) => {
  const params = [];
  let sql = `SELECT COUNT(DISTINCT productname) FROM product_details_view WHERE 1=1`;

  Object.keys(filters).forEach((key) => {
    sql += ` AND ${key} = $${params.length + 1}`;
    params.push(filters[key]);
  });

  if (searchText != "__") {
    sql += " AND LOWER(productname) LIKE LOWER($" + (params.length + 1) + ")";
    params.push(`%${searchText.trim()}%`);
  }
  if (minPrice && maxPrice) {
    console.log(minPrice, maxPrice);
    sql += " AND unitprice >= $" + (params.length + 1) + " AND unitprice <= $" + (params.length + 2);
    params.push(minPrice, maxPrice);
  }

  if (instock) {
    sql += " AND qty > 0";
  }


  return query(sql, params)
    .then(function (result) {
      return result.rows[0].count;
    })
    .catch(function (error) {
      throw new Error(`Error retrieving product details: ${error.message}`);
    });
};

//8.
//get all types
module.exports.getTypes = function getTypes() {
  console.log("inside type");
  const sql = `SELECT * FROM type ORDER BY typeid`;
  //typeid, typename
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving product types: ${error.message}`);
    });
};

//9.
//get all categories
module.exports.getCategories = function getCategories() {
  const sql = `SELECT * FROM category ORDER BY categoryid`;
  //categoryid, categoryname
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving categories: ${error.message}`);
    });
};

//10.
//get all colours
module.exports.getColours = function getColours() {
  const sql = `SELECT * FROM colour ORDER BY colourid`;
  //colourid, colorname, hex
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving colours: ${error.message}`);
    });
};

//11.
//get all sizes
module.exports.getSizes = function getSizes() {
  const sql = `SELECT * FROM size ORDER BY sizeid`;
  //sizeid, sizename
  return query(sql)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving sizes: ${error.message}`);
    });
};

//12
// get product by filter for explore page
module.exports.getProductExploreByFilter = (types, colours, sizes, categories, limit, offset) => {
  const sql = `
    SELECT DISTINCT p.productid, p.productname, p.unitprice, p.rating, ca.categoryname, t.typename
    FROM product p, productdetail pd, type t, colour co, size s, category ca
    WHERE p.typeid = t.typeid
    AND p.categoryid = ca.categoryid
    AND pd.productid = p.productid
    AND pd.colourid = co.colourid
    AND pd.sizeid = s.sizeid
  `;

  let querySQL = ``;
  let count = 1;
  let queryParams = [];
  if (types && types.length > 0) {
    const values = types.map((t, index) => `$${index + count}`);
    querySQL += `AND p.typeid IN (${values}) `;
    count += types.length;
    queryParams = [...queryParams, ...types];
  }
  if (colours && colours.length > 0) {
    const values = colours.map((c, index) => `$${index + count}`);
    querySQL += `AND pd.colourid IN (${values}) `;
    count += colours.length;
    queryParams = [...queryParams, ...colours];
  }
  if (sizes && sizes.length > 0) {
    const values = sizes.map((s, index) => `$${index + count}`);
    querySQL += `AND pd.sizeid IN (${values}) `;
    count += sizes.length;
    queryParams = [...queryParams, ...sizes];
  }
  if (categories && categories.length > 0) {
    const values = categories.map((c, index) => `$${index + count}`);
    querySQL += `AND p.categoryid IN (${values}) `;
    count += categories.length;
    queryParams = [...queryParams, ...categories];
  }

  querySQL += `LIMIT $${count} OFFSET $${count + 1}`;

  queryParams = queryParams.map((q) => parseInt(q));

  queryParams.push(limit, offset);

  return query(sql + querySQL, [...queryParams]).then((result) => result.rows);
};

//13
// get product count by filter for explore page
module.exports.getProductCountByFilter = (types, colours, sizes, categories) => {
  const sql = `
    SELECT COUNT(DISTINCT p.*) AS count
    FROM product p, productdetail pd, type t, colour co, size s, category ca
    WHERE p.typeid = t.typeid
    AND p.categoryid = ca.categoryid
    AND pd.productid = p.productid
    AND pd.colourid = co.colourid
    AND pd.sizeid = s.sizeid
  `;

  let querySQL = ``;
  let count = 1;
  let queryParams = [];
  if (types && types.length > 0) {
    const values = types.map((t, index) => `$${index + count}`);
    querySQL += `AND p.typeid IN (${values}) `;
    count += types.length;
    queryParams = [...queryParams, ...types];
  }
  if (colours && colours.length > 0) {
    const values = colours.map((c, index) => `$${index + count}`);
    querySQL += `AND pd.colourid IN (${values}) `;
    count += colours.length;
    queryParams = [...queryParams, ...colours];
  }
  if (sizes && sizes.length > 0) {
    const values = sizes.map((s, index) => `$${index + count}`);
    querySQL += `AND pd.sizeid IN (${values}) `;
    count += sizes.length;
    queryParams = [...queryParams, ...sizes];
  }
  if (categories && categories.length > 0) {
    const values = categories.map((c, index) => `$${index + count}`);
    querySQL += `AND p.categoryid IN (${values}) `;
    count += categories.length;
    queryParams = [...queryParams, ...categories];
  }

  queryParams = queryParams.map((q) => parseInt(q));

  return query(sql + querySQL, [...queryParams]).then((result) => result.rows[0].count);
};

//14.
//get product and detail by productid from view
module.exports.getProductAndDetailByProductID = function getProductsAndDetailByProductID(productid) {

  let sql = `SELECT * FROM product_details_view WHERE productid = $1`;

  return query(sql, [productid])
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      throw new Error(`Error retrieving product and detail by productid: ${error.message}`);
    });
};

//15.
//create colour
module.exports.createColour = function createColour(colourname, hex) {
  const sql = `
        INSERT INTO Colour(colourname, hex) VALUES($1,$2);
    `;
  return query(sql, [colourname, hex])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(`Error creating colour ${error.message}`);
    });
};


//16.
//create category
module.exports.createCategory = function createCategory(categoryname) {
  const sql = `
        INSERT INTO Category(categoryname) VALUES($1);
    `;
  return query(sql, [categoryname])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(`Error creating category ${error.message}`);
    });
};

//17.
//create size
module.exports.createSize = function createSize(sizename) {
  const sql = `
        INSERT INTO Size(sizename) VALUES($1);
    `;
  return query(sql, [sizename])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      throw new Error(`Error creating size ${error.message}`);
    });
};

//18.
// Get colour by name
module.exports.getColourByName = function getColourByName(colourname) {
  const sql = `
    SELECT * FROM Colour WHERE LOWER(colourname) = LOWER($1);
  `;
  return query(sql, [colourname])
    .then((result) => result.rows)
    .catch((error) => {
      throw new Error(`Error getting color by name: ${error.message}`);
    });
};
//19.
// Get category by name
module.exports.getCategoryByName = function getCategoryByName(categoryname) {
  const sql = `
    SELECT * FROM Category WHERE LOWER(categoryname) = LOWER($1);
  `;
  return query(sql, [categoryname])
    .then((result) => result.rows)
    .catch((error) => {
      throw new Error(`Error getting category by name: ${error.message}`);
    });
};
//20.
// Get size by name
module.exports.getSizeByName = function getSizeByName(sizename) {
  const sql = `
    SELECT * FROM Size WHERE LOWER(sizename) = LOWER($1);
  `;
  return query(sql, [sizename])
    .then((result) => result.rows)
    .catch((error) => {
      throw new Error(`Error getting size by name: ${error.message}`);
    });
};

//21
module.exports.getProductStatByQuarter = (year) => {
  const sql = `
  SELECT
      EXTRACT(QUARTER FROM p.createdat) AS quarter,
      EXTRACT(YEAR FROM p.createdat) AS year,
	  SUM(p.soldqty) as soldqty,
      t.typename as type
    FROM product p, type t
    WHERE p.typeid = t.typeid
    AND EXTRACT(YEAR FROM p.createdat) =$1
    GROUP BY quarter, year, t.typename ORDER BY year, quarter
  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};


//21
module.exports.getProductStatByMonth = (year) => {
  const sql = `
  
	SELECT
  EXTRACT(MONTH FROM p.createdat) AS month,
   EXTRACT(YEAR FROM p.createdat) AS year,
 SUM(p.soldqty) as soldqty,
   t.typename as type
 FROM product p, type t
 WHERE p.typeid = t.typeid
 AND EXTRACT(YEAR FROM p.createdat) = $1
 GROUP BY month, year, t.typename ORDER BY year, month
  `;

  return query(sql, [year])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};
//CA2-end

// Name: Zay Yar Tun

module.exports.getProductIDByOrderID = function getProductIDByOrderID(orderid) {
  const sql = `
        SELECT DISTINCT p.productid, poi.qty
        FROM Product p, ProductDetail pd, ProductOrderItem poi
        WHERE p.productid = pd.productid
        AND pd.productdetailid = poi.productdetailid
        AND poi.orderid = $1
    `;

  return query(sql, [orderid]).then(function (result) {
    const rows = result.rows;
    return rows;
  });
};

module.exports.increaseSoldQty = function increaseSoldQty(qty, productid) {
  const sql = `
        UPDATE Product SET soldqty = soldqty + $1 WHERE productid = $2
    `;

  return query(sql, [qty, productid]).then(function (result) {
    return result.rowCount;
  });
};

module.exports.updateProductStatus = (productDetailIDArr) => {
  const sql = `
        UPDATE ProductDetail SET productstatus = 
        CASE
            WHEN qty > 0 THEN 'in stock'
            ELSE 'out of stock'
        END
        WHERE productdetailid IN (
    `;

  const queryValues = productDetailIDArr.map((p, index) => `$${index + 1}`).join(", ");

  return query(sql + queryValues + ")", [...productDetailIDArr])
    .then((result) => result.rowCount)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.increaseProductQtyById = (qty, productDetailID) => {
  const sql = `
        UPDATE ProductDetail SET qty = qty + $1 WHERE productdetailid = $2
    `;

  return query(sql, [qty, productDetailID])
    .then((result) => result.rowCount)
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

module.exports.reduceProductQtyById = (qty, productdetailid) => {
  const sql = `
        UPDATE ProductDetail SET qty = qty - $1 WHERE productdetailid = $2;
    `;

  return query(sql, [qty, productdetailid])
    .then((result) => result.rowCount)
    .catch(function (error) {
      console.error(error);
      throw error;
    });
};

module.exports.getDistinctProduct = function getDistinctProduct() {
  const sql = `
        SELECT productname, productid FROM product ORDER BY productid
    `;

  return query(sql, []).then(function (result) {
    return result.rows;
  });
};

module.exports.getDistinctCategory = function getDistinctCategory() {
  const sql = `
        SELECT categoryname, categoryid FROM category ORDER BY categoryid
    `;

  return query(sql, []).then(function (result) {
    return result.rows;
  });
};

// CA2

// user

module.exports.getProductImageByProductIDArr = (productIDArr) => {
  if (!productIDArr || productIDArr.length === 0) return Promise.resolve([]);

  const sql = `
        SELECT i.url, p.productid
        FROM image i
        JOIN productimage pi ON i.imageid = pi.imageid
        JOIN product p ON pi.productid = p.productid
        WHERE p.productid IN (
    `;

  const values = productIDArr.map((p, index) => `$${index + 1}`).join(", ") + ")";

  return query(sql + values, [...productIDArr])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

// user

module.exports.getFullProductInfoByProductDetailIDArr = (productDetailIDArr) => {
  const sql = `
      SELECT p.productid, p.productname, p.unitprice, pd.qty, pd.productdetailid, c.colourname, s.sizename, c.colourid, s.sizeid, c.hex, i.url
      FROM productdetail pd
      JOIN product p ON pd.productid = p.productid 
      JOIN colour c ON pd.colourid = c.colourid
      JOIN size s ON s.sizeid = pd.sizeid
      LEFT JOIN productimage pi ON p.productid = pi.productid
      LEFT JOIN image i ON pi.imageid = i.imageid
      WHERE pd.productdetailid IN (
  `;

  const queryValues = productDetailIDArr.map((p, index) => `$${index + 1}`).join(", ") + ")";

  return query(sql + queryValues, [...productDetailIDArr])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

module.exports.getProductQtyPriceByProductDetailID = function getProductQtyPriceByProductDetailID(productDetailIDArr) {
  const sql = `
        SELECT P.unitprice, PD.qty, PD.productdetailid
        FROM ProductDetail PD, Product P
        WHERE P.productID = PD.productID
        AND PD.productDetailID IN (SELECT UNNEST($1::int[]))
    `;

  return query(sql, [productDetailIDArr])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

/**
 * get product by limit
 * @param {*} limit a number for retrieving a limited amount of records (int)
 * @returns Promise(array of objects) - [{productid, productname, description, unitprice, rating, categoryid, soldqty, createdat, typeid, typename, categoryname}]
 * @example
 * getProductByLimit(3).then((result) => {
 *    result.forEach((item) => {
 *        console.log(item.productid);    // implement your logic here
 *    })
 * })
 */
module.exports.getProductByLimit = async (limit) => {
  const sql = `
        SELECT p.productid, p.productname, p.description, p.unitprice, p.rating, p.categoryid, p.soldqty, p.createdat, p.typeid, t.typename, c.categoryname
        FROM product p, type t, category c
        WHERE p.typeid = t.typeid
        AND p.categoryid = c.categoryid
        LIMIT $1
      `;

  return query(sql, [limit])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      return [];
    });
};

/**
 * get best selling product by limit
 * @param {*} limit a number for retrieving a limited amount of records (int)
 * @returns Promise(array of objects) - [{productid, productname, description, unitprice, rating, categoryid, soldqty, createdat, typeid, typename, categoryname}]
 * @example
 * getBestSellingProductByLimit(3).then((result) => {
 *    result.forEach((item) => {
 *        console.log(item.productid);    // implement your logic here
 *    })
 * })
 */
module.exports.getBestSellingProductByLimit = async (limit) => {
  const sql = `
        SELECT p.productid, p.productname, p.description, p.unitprice, p.rating, p.categoryid, p.soldqty, p.createdat, p.typeid, t.typename, c.categoryname
        FROM product p, type t, category c
        WHERE p.typeid = t.typeid
        AND p.categoryid = c.categoryid
        ORDER BY p.soldqty
        LIMIT $1
      `;

  return query(sql, [limit]).then((result) => result.rows);
};

/**
 * get product information by productdetailid
 * @param {*} productDetailIDArr array of productdetailid (int[])
 * @returns Promise(array of objects) - [{productid, productname, unitprice, categoryid, productdetailid}]
 * @example
 * getProductByProductDetailID(IDArr).then((data) => {
 *    data.forEach((item) => {
 *      console.log(item.productid)   // implement your logic here
 *    })
 * })
 */
module.exports.getProductByProductDetailIDArr = async (productDetailIDArr) => {
  const sql = `
        SELECT p.productid, p.productname, p.unitprice, p.categoryid, pd.productdetailid
        FROM product p, productdetail pd
        WHERE p.productid = pd.productid
        AND pd.productdetailid IN (SELECT UNNEST ($1::int[]))
  `;

  return query(sql, [productDetailIDArr]).then((result) => result.rows);
};

/**
 * get productdetail table data by productid
 * @param {*} productIDArr array of productid (int[])
 * @returns Promise(array of objects) - [{productdetailid, productid, sizeid, colourid, qty, productstatus, size, colour, hex}]
 * @example
 * getProductDetailByProductIDArr(IDArr)
 * .then((data) => {
 *    data.forEach((item) => {
 *      console.log(item.productdetailid);    // this is productdetailid
 *    })
 * })
 */
module.exports.getProductDetailByProductIDArr = async (productIDArr) => {
  const sql = `
        SELECT pd.productdetailid, pd.productid, pd.sizeid, pd.colourid, pd.qty, pd.productstatus, s.sizename as size, c.colourname as colour, c.hex  
        FROM productdetail pd, product p, size s, colour c
        WHERE pd.productid = p.productid
        AND s.sizeid = pd.sizeid
        AND c.colourid = pd.colourid
        AND p.productid IN (SELECT UNNEST($1::int[]))
        ORDER BY p.productid
  `;

  return query(sql, [productIDArr]).then((result) => result.rows);
};

module.exports.getProductDetailByProductDetailID = (productDetailID) => {
  const sql = `
      SELECT *
      FROM productdetail
      WHERE productdetailid = $1
  `;

  return query(sql, [productDetailID])
    .then((result) => result.rows[0])
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

/**
 * get product detail information by product detail id
 * @param {*} productDetailIDArr array of product detail id (int[])
 * @returns Promise(array of objects) - [{productdetailid, qty, productname, unitprice, productid}]
 */
module.exports.getProductDetailByIds = function getProductDetailByIds(productDetailIDArr) {
  const sql = `
        SELECT pd.productdetailid, pd.qty, p.productname, p.unitprice, p.productid, c.colourname as colour, s.sizename as size
        FROM productdetail pd, product p, colour c, size s
        WHERE p.productid = pd.productid
        AND pd.colourid = c.colourid
        AND pd.sizeid = s.sizeid
        AND pd.productdetailid IN (SELECT UNNEST($1::int[]))
    `;

  return query(sql, [productDetailIDArr])
    .then((result) => result.rows)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};
// Name: Zay Yar Tun
