// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { TAdminCart, TAdminCartCount, TDeleteAdminCart } from "@/enums/admin-cart-interfaces";
import { ErrorMessage } from "@/enums/global-enums";

export function getAdminCartCount(): Promise<TAdminCartCount> {
  return fetch(`${process.env.BACKEND_URL}/api/cart/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { count: null, error: result.error } as TAdminCartCount;
      } else {
        if (!result.count || isNaN(result.count)) {
          return { count: null, error: ErrorMessage.INVALID_DATA } as TAdminCartCount;
        }
        return { count: parseInt(result.count, 10), error: null } as TAdminCartCount;
      }
    })
    .catch((error) => {
      console.error(error);
      return { count: null, error: ErrorMessage.FetchError } as TAdminCartCount;
    });
}

export function getAdminCart(pageNo: number, limit: number): Promise<TAdminCart> {
  return fetch(`${process.env.BACKEND_URL}/api/cart/admin?offset=${pageNo * limit}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TAdminCart;
      } else {
        return { data: result.data, error: null } as TAdminCart;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TAdminCart;
    });
}

export function deleteAdminCart(cartID: number): Promise<TDeleteAdminCart> {
  return fetch(`${process.env.BACKEND_URL}/api/cart/${cartID}/admin`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { message: null, error: result.error } as TDeleteAdminCart;
      } else {
        return { message: result.message, error: null } as TDeleteAdminCart;
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: null, error: ErrorMessage.FetchError } as TDeleteAdminCart;
    });
}
