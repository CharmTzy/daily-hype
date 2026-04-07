// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ICartDetail, TCartDetailFetch, TCartFetch } from "@/enums/cart-interfaces";
import { ErrorMessage } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";

/**
 * get cart data for the signed in user
 * @returns Promise(object) - {data, error} - TCartFetch enum
 * @returns data - array of objects [{productdetailid, qty}]
 * @returns error - string
 * @example
 * getCart().then((result) => {
 *    if(result.error) {
 *        // implement error logic here
 *    }
 *    else {
 *        // implement data logic here
 *    }
 * })
 */
export async function getCart(): Promise<TCartFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/cart`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TCartFetch;
      } else {
        return { data: result.data, error: null } as TCartFetch;
      }
    });
}

/**
 * get cart data from backend
 * @param isAuthenticated whether the user is authenticated (boolean)
 * @returns Promise(object) - {data, error}
 * @returns data - array of objects [{productid, productname, unitprice, categoryid, detail, url}]
 * @returns error - string
 * @example
 * getCartData(true).then((result) => {
 *      if(result.error) {
 *          // implement your error logic here
 *      }
 *      else {
 *          result.data.forEach((item) => {
 *              // implement your data logic here
 *          })
 *      }
 * })
 */
export async function getCartDetail(isAuthenticated: boolean, cart: ICartLocalStorage[]): Promise<TCartDetailFetch> {
  if (isAuthenticated) {
    return fetch(`${process.env.BACKEND_URL}/api/cart/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart: cart }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return { data: null, cart: null, error: result.error } as TCartDetailFetch;
        } else {
          return { data: result.data, cart: result.cart, error: null } as TCartDetailFetch;
        }
      })
      .catch((error) => ({ data: null, cart: null, error } as TCartDetailFetch));
  } else {
    return fetch(`${process.env.BACKEND_URL}/api/cart/detail/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart: cart }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          return { data: null, cart: null, error: result.error } as TCartDetailFetch;
        } else {
          return { data: result.data, cart: result.cart, error: null } as TCartDetailFetch;
        }
      })
      .catch((error) => ({ data: null, cart: null, error } as TCartDetailFetch));
  }
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
 * console.log(arr);    // [{productdetailid: 1, qty: 2}]
 */
export function removeDuplicateCartData(arr: ICartLocalStorage[], data?: ICartDetail[]) {
  const result: ICartLocalStorage[] = [];
  arr.forEach((item, i) => {
    const index = result.findIndex((r) => r.productdetailid === item.productdetailid);
    if (index !== -1) {
      result[index].qty += item.qty;
      if (data) {
        data = data.filter((d, j) => j !== i);
        let detailIndex = data[index].detail.findIndex((d) => d.productdetailid === result[index].productdetailid);
        if (result[index].qty > data[index].detail[detailIndex].qty) {
          result[index].qty = 1;
        }
      }
    } else {
      result.push({ ...item });
    }
  });
  return { cart: result, data: data };
}

/**
 * remove item from cart (local storage or database)
 * @param isAuthenticated whether user is authenticated - boolean
 * @param cart cart data - [{productdetailid, qty}]
 * @param index index of cart array that you want to remove - number
 * @returns array of objects - [{productdetailid, qty}]
 * @example
 *
 */
export function removeItemFromCart(productdetailid: number): Promise<boolean> {
  return fetch(`${process.env.BACKEND_URL}/api/cart/${productdetailid}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message === "Delete Success") {
        return true;
      } else {
        // need to handle errors
        return false;
      }
    });
}

export function updateCartData(cart: ICartLocalStorage, productDetailID: number): Promise<boolean> {
  return fetch(`${process.env.BACKEND_URL}/api/cart/${productDetailID}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart: cart }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message === "Update Success") {
        return true;
      } else {
        if (result.error === ErrorMessage.ZeroQty) {
          alert("The quantity cannot be less than 1!");
        } else {
          alert(result.error);
        }
        return false;
      }
    });
}
