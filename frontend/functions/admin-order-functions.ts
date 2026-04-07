// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { TCancelOrder, TConfirmOrder, TGetAdminOrderMonthlyRevenueStat, TGetOrderItem } from "@/enums/admin-order-interfaces";
import { ErrorMessage } from "@/enums/global-enums";
import { IAdminOrderRevenueQuarterDetail } from "@/enums/order-interfaces";

export function confirmOrder(orderID: number): Promise<TConfirmOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order/${orderID}/confirm/admin`, {
    method: "PUT",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { message: null, error: result.error } as TConfirmOrder;
      } else {
        return { message: result.message, error: null } as TConfirmOrder;
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: null, error: ErrorMessage.FetchError } as TConfirmOrder;
    });
}

export function getOrderItem(orderID: number, userID: number) {
  return fetch(`${process.env.BACKEND_URL}/api/order/item/${orderID}/${userID}/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TGetOrderItem;
      } else {
        if (!result.data) {
          return { data: null, error: ErrorMessage.FetchError } as TGetOrderItem;
        }
        return { data: result.data, error: null } as TGetOrderItem;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TGetOrderItem;
    });
}

export function cancelOrder(orderID: number): Promise<TCancelOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order/${orderID}/cancel/admin`, {
    method: "PUT",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { message: null, error: result.error } as TCancelOrder;
      } else {
        if (result.message) {
          return { message: result.message, error: null } as TCancelOrder;
        }
        return { message: null, error: ErrorMessage.FetchError } as TCancelOrder;
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: null, error: ErrorMessage.FetchError } as TCancelOrder;
    });
}

export function getAdminOrderMonthlyRevenueStat(year: number): Promise<TGetAdminOrderMonthlyRevenueStat> {
  return fetch(`${process.env.BACKEND_URL}/api/order/stat/revenue/month?year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TGetAdminOrderMonthlyRevenueStat;
      } else {
        if (result.data) {
          return { data: result.data, error: null } as TGetAdminOrderMonthlyRevenueStat;
        }
        return { data: null, error: ErrorMessage.FetchError } as TGetAdminOrderMonthlyRevenueStat;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TGetAdminOrderMonthlyRevenueStat;
    });
}

export function getAdminOrderMonthlyRevenueStatDetail(month: number, gender: "m" | "f", year: number): Promise<IAdminOrderRevenueQuarterDetail> {
  return fetch(`${process.env.BACKEND_URL}/api/order/stat/revenue/month/detail?month=${month}&gender=${gender}&year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { user: null, product: null, error: result.error } as IAdminOrderRevenueQuarterDetail;
      } else {
        if (result.user && result.product) {
          return { user: result.user, product: result.product, error: null } as IAdminOrderRevenueQuarterDetail;
        }
        return { user: null, product: null, error: ErrorMessage.FetchError } as IAdminOrderRevenueQuarterDetail;
      }
    })
    .catch((error) => {
      console.error(error);
      return { user: null, product: null, error: error } as IAdminOrderRevenueQuarterDetail;
    });
}
