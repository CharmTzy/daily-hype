// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ICartDetail } from "@/enums/cart-interfaces";
import { ICartLocalStorage } from "@/enums/global-interfaces";

/**
 * to show remaining item in cart
 * @param maxQty max quantity left in stock - number
 * @returns text that shows remaining items - string
 * @example
 * let message = showRemainingItem(10);
 * console.log(message)   // this will show 10 items left
 */
export function showRemainingItem(maxQty: number) {
  if (maxQty <= 0) {
    return "Unavailable";
  } else if (maxQty === 1) {
    return "1 item left";
  } else if (maxQty <= 15) {
    return `${maxQty} items left`;
  } else {
    return "";
  }
}

export function extractColourData(data: ICartDetail): { colourid: number; colour: string }[] {
  const colourData = data.detail.reduce((arr, item) => {
    const index = arr.findIndex((a) => a.colourid === item.colourid);
    if (index === -1) {
      arr.push({ colourid: item.colourid, colour: item.colour });
    }
    return arr;
  }, [] as { colourid: number; colour: string }[]);
  return colourData;
}

export function extractSizeData(data: ICartDetail, colourid: number): { sizeid: number; size: string }[] {
  const sizeData = data.detail
    .filter((d) => d.colourid === colourid)
    .reduce((arr, item) => {
      const index = arr.findIndex((a) => a.sizeid === item.sizeid);
      if (index === -1) {
        arr.push({ sizeid: item.sizeid, size: item.size });
      }
      return arr;
    }, [] as { sizeid: number; size: string }[]);
  return sizeData;
}

/**
 * remove duplicate productdetailid in cart and cart data array and add quantity
 * @param arr cart array - [{productdetailid, qty}]
 * @param data optional another data array which is corresponded with the cart array
 * @returns array of objects - [{cart}, {data}]
 * @returns first object {cart} is cart array without duplicate data
 * @returns second object {data} is cart data array if it is provided
 * @example
 * let arr = [{productdetailid: 1, qty: 1}, {productdetailid: 1, qty: 1}];
 * arr = removeDuplicateCartData(arr).cart;  // this will remove all duplicate productdetailid in cart array
 * console.log(arr);    // [{productdetailid: 1, qty: 1}]
 */
export function removeDuplicateCartData(arr: ICartLocalStorage[], data?: ICartDetail[]) {
  const result: ICartLocalStorage[] = [];
  arr.forEach((item, i) => {
    const index = result.findIndex((r) => r.productdetailid === item.productdetailid);
    if (index !== -1) {
      if (data) {
        data = data.filter((d, j) => j !== i);
        const detail = data[index].detail.find((d) => d.productdetailid === result[index].productdetailid);
        if (detail) {
          if (result[index].qty > detail.qty) {
            result[index].qty = 1;
          }
        }
      }
    } else {
      result.push({ ...item });
    }
  });
  return { cart: result, data: data };
}
