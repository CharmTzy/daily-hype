// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

/**
 * format decimal number by the place given
 * @param {*} number - number that you want to format (string)
 * @param {*} decimalPlace - number of decimals you want (int)
 * @returns - decimal number (number)
 */
module.exports.formatDecimalNumber = (number, decimalPlace) => {
  return parseFloat(number.toFixed(decimalPlace));
};
