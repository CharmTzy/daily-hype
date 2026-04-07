// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

/**
 *
 * This will return the capitalised words from input string
 * @param str input string which must not be null
 * @returns string
 * @example
 * const str = capitaliseWord("hello world");
 * console.log(str);    // Hello World
 */
export function capitaliseWord(str: string) {
  if (str) {
    if (str.length > 0) {
      let splitStr = str.toLowerCase().split(" ");

      splitStr.forEach((word, index) => {
        splitStr[index] =
          splitStr[index].charAt(0).toUpperCase() + splitStr[index].slice(1);
      });
      return splitStr.join(" ");
    }
  }
  return "";
}

export function formatDecimal(value: string, point: number = 1) {
  if (value) return parseFloat(value).toFixed(point).toString();
  else return "";
}

/**
 *
 * This will return money format (e.g. 23.50)
 * @param value input string which must not be null
 * @returns string
 * @example
 * const money = formatMoney("20");
 * console.log(money);    // 20.00
 */
export function formatMoney(value: string) {
  if (value) return parseFloat(value).toFixed(2).toString();
  else return "";
}

/**
 *
 * This will return the formatted date (e.g. June 2, 2023)
 * @param date (string)
 * @returns string
 * @example
 * const dateStr = formatDateByMonthDayYear(new Date());
 * console.log(dateStr);    // Jan 11, 2024, 08:18:55 PM
 */
export function formatDateByMonthDayYear(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


/**
 *
 * This will return the formatted date in 24 hour format (e.g. June 2, 2023)
 * @param date (string)
 * @returns string
 * @example
 * const dateStr = formatDateByMonthDayYear(new Date());
 * console.log(dateStr);    // Jan 11, 2024, 20:18:55
 */
export function formatDateByMonthDayYear24Hour(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}