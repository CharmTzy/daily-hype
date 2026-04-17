const cloudinary = require("../cloudinary");
const { query } = require("../database");
const { EMPTY_RESULT_ERROR } = require("../errors");
function ensureCloudinaryConfigured() {
    if (!cloudinary.isConfigured) {
        throw new Error("Cloudinary is not configured");
    }
}
module.exports.createImage = (imageid, imagename, url) => {
    const sql = `
        INSERT INTO image (imageid, imagename, url) VALUES ($1, $2, $3);
    `;
    return query(sql, [imageid, imagename, url])
        .then((result) => result.rowCount)
        .catch(function (error) {
        console.error(error);
        throw error;
    });
};
module.exports.uploadCloudinaryPhoto = function uploadCloudinaryPhoto(email, file) {
    ensureCloudinaryConfigured();
    return cloudinary.uploader
        .upload(file.path, { folder: cloudinary.getFolder("profiles") })
        .then((result) => {
        if (result && result.public_id && result.secure_url && result.original_filename) {
            return result;
        }
        else {
            throw new Error(`Image Upload Failed`);
        }
    })
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.uploadCloudinaryPhotos = function uploadCloudinaryPhotos(file) {
    ensureCloudinaryConfigured();
    return cloudinary.uploader
        .upload(file.path, { folder: cloudinary.getFolder("products") })
        .then((result) => {
        if (result && result.public_id && result.secure_url && result.original_filename) {
            return result;
        }
        else {
            throw new Error(`Image Upload Failed`);
        }
    })
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.createProductImage = function createProductImage(imageid, imagename, url) {
    const sql = `
        INSERT INTO image (imageid, imagename, url) VALUES ($1, $2, $3);
    `;
    return query(sql, [imageid, imagename, url])
        .then(function (result) {
        const rows = result.rowCount;
        if (rows === 0) {
            throw new EMPTY_RESULT_ERROR(`Image Insert Failed`);
        }
        return imageid;
    })
        .catch(function (error) {
        console.error(error);
        throw error;
    });
};
module.exports.getImageIDByProductID = function getImageIDByProductID(productid) {
    const sql = `
    SELECT DISTINCT i.imageid
    FROM Image i, ProductImage pi
    WHERE i.imageid = pi.imageid
    AND pi.productid = $1
  `;
    return query(sql, [productid]).then((result) => {
        const rows = result.rows;
        return rows[0];
    });
};
module.exports.deleteProductImage = function deleteProductImage(productid) {
    const sql = `
  DELETE FROM ProductImage WHERE productid = $1
`;
    return query(sql, [productid]).then((result) => {
        const rows = result.rowCount;
        if (rows === 0) {
            throw new EMPTY_RESULT_ERROR(`Image Delete Failed`);
        }
        return rows;
    });
};
module.exports.deleteCloudinaryImage = function deleteCloudinaryImage(public_id) {
    ensureCloudinaryConfigured();
    return cloudinary.uploader
        .destroy(public_id)
        .then((result) => {
        return result;
    })
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.deleteUserImage = function deleteUserImage(imageid) {
    const sql = `
        DELETE FROM Image WHERE imageid = $1
    `;
    return query(sql, [imageid]).then((result) => {
        const rows = result.rowCount;
        if (rows === 0) {
            throw new EMPTY_RESULT_ERROR(`Image Delete Failed`);
        }
        return rows;
    });
};
module.exports.deleteImage = function deleteImage(imageid) {
    const sql = `
  DELETE FROM Image WHERE imageid = $1
`;
    return query(sql, [imageid]).then((result) => {
        const rows = result.rowCount;
        if (rows === 0) {
            throw new EMPTY_RESULT_ERROR(`Image Delete Failed`);
        }
        return rows;
    });
};
module.exports.getImage = (imageID) => {
    const sql = `
      SELECT * FROM image WHERE imageid = $1
  `;
    return query(sql, [imageID])
        .then((result) => result.rows[0])
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.createBatchImage = (imageArr) => {
    const sql = `
    INSERT INTO image (imageid, imagename, url) VALUES 
  `;
    const queryValues = imageArr.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(", ");
    const queryParams = imageArr.map((image) => [image.imageid, image.imagename, image.url]).flat();
    return query(`${sql + queryValues}
     ON CONFLICT (imageid)
     DO UPDATE SET imagename = EXCLUDED.imagename, url = EXCLUDED.url`, [...queryParams])
        .then((result) => result.rowCount)
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.deleteMultipleImagesFromCloudinary = async (publicIDArr) => {
    ensureCloudinaryConfigured();
    const batchSize = 9;
    const batches = Math.ceil(publicIDArr.length / batchSize);
    const results = [];
    for (let i = 0; i < batches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min((i + 1) * batchSize, publicIDArr.length);
        const batchFiles = publicIDArr.slice(startIndex, endIndex);
        const batchResults = await Promise.all(batchFiles.map((id) => this.deleteSingleImageFromCloudinary(id)));
        results.push(...batchResults);
    }
    return results;
};
module.exports.deleteSingleImageFromCloudinary = async (publicID) => {
    ensureCloudinaryConfigured();
    return cloudinary.uploader
        .destroy(publicID)
        .then((result) => result)
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.uploadMultipleImagesToCloudinary = async (filePaths) => {
    ensureCloudinaryConfigured();
    const batchSize = 9;
    const batches = Math.ceil(filePaths.length / batchSize);
    const results = [];
    for (let i = 0; i < batches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min((i + 1) * batchSize, filePaths.length);
        const batchFiles = filePaths.slice(startIndex, endIndex);
        const batchResults = await Promise.all(batchFiles.map((file) => this.uploadSingleImageToCloudinary(file)));
        results.push(...batchResults);
    }
    return results;
};
module.exports.uploadSingleImageToCloudinary = async (filePath) => {
    ensureCloudinaryConfigured();
    return cloudinary.uploader
        .upload(filePath, { folder: cloudinary.getFolder("uploads") })
        .then((result) => {
        if (result && result.public_id && result.secure_url && result.original_filename) {
            return result;
        }
        else {
            throw new Error(`Image Upload Failed`);
        }
    })
        .catch((error) => {
        console.error(error);
        throw error;
    });
};
module.exports.getImageByProductIDArr = async (productIDArr) => {
    const sql = `
      SELECT p.productid, i.url
      FROM product p, productimage pi, image i
      WHERE p.productid = pi.productid
      AND i.imageid = pi.imageid
      AND p.productid IN (SELECT UNNEST($1::int[]))
      ORDER BY p.productid
  `;
    return query(sql, [productIDArr]).then((result) => result.rows);
};
