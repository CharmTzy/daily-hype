// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ErrorMessage } from "@/enums/global-enums";
import { TCreateRefundRequest, TGetOrderItemByOrderID } from "@/enums/refund-interfaces";

export function createRefundRequest(orderID: number, productDetailID: number, category: number, qty: number, reason: string, images: string[]): Promise<TCreateRefundRequest> {
  console.log(reason);
  return fetch(`${process.env.BACKEND_URL}/api/refund/${orderID}/${productDetailID}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ images: images, category: category, reason: reason, qty: qty }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      if (result.error) {
        return { message: null, error: result.error } as TCreateRefundRequest;
      } else {
        return { message: result.message, error: null } as TCreateRefundRequest;
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: null, error: ErrorMessage.FetchError } as TCreateRefundRequest;
    });
}

export function getOrderItemByOrderID(orderID: number): Promise<TGetOrderItemByOrderID> {
  return fetch(`${process.env.BACKEND_URL}/api/order/item/${orderID}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TGetOrderItemByOrderID;
      } else {
        return { data: result.data, error: null } as TGetOrderItemByOrderID;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TGetOrderItemByOrderID;
    });
}
