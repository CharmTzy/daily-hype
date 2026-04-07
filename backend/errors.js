/* eslint-disable max-classes-per-file */

module.exports.TABLE_ALREADY_EXISTS_ERROR = class TABLE_ALREADY_EXISTS_ERROR extends Error {
  constructor(tableName) {
    super(`Table ${tableName} already exists!`);
  }
};

module.exports.EMPTY_RESULT_ERROR = class EMPTY_RESULT_ERROR extends Error {};
module.exports.DUPLICATE_ENTRY_ERROR = class DUPLICATE_ENTRY_ERROR extends Error {};
module.exports.INVALID_INPUT_ERROR = class INVALID_INPUT_ERROR extends Error {};
module.exports.UNEXPECTED_ERROR = class UNEXPECTED_ERROR extends Error {};

// See more: https://www.postgresql.org/docs/current/errcodes-appendix.html
module.exports.SQL_ERROR_CODE = {
  TABLE_ALREADY_EXISTS: "42P07",
  DUPLICATE_ENTRY: "23000",
};

module.exports.errorMessages = {
  TOKEN_EXPIRED: "Token Expired",
  UNKNOWN_ERROR: "Unknown Error",
  INVALID_TOKEN: "Invalid Token",
  UNAURHOTIZED: "Unauthorized Access",
  EMPTY_CART: "Empty Cart",
  INVALID_CART: "Invalid Cart",
  INVALID_ID: "Invalid ID",
  INVALID_INPUT: "Invalid Input",
  INVALID_REQUEST: "Invalid Request",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  ZERO_QTY: "Zero Qty",
  FILE_ERROR: "File Error",
  FILE_NOT_FOUND: "File Not Found",
  FOLDER_NOT_FOUND: "Folder Not Found",
  INVALID_DIMENSION: "Invalid Dimension",
  PRODUCT_NOT_FOUND: "Product Not Found",
  INSUFFICIENT_QTY: "Insufficient Product Qty",
  PAYMENT_ERROR: "Payment Error",
  DUPLICATE_ERROR: "Duplicate Error",
};

module.exports.successMessages = {
  DELETE_SUCCESS: "Delete Success",
  UPDATE_SUCCESS: "Update Success",
  UPLOAD_SUCCESS: "Upload Success",
  CREATE_SUCCESS: "Create Success",
};
