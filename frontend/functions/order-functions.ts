// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { TCancelOrder, TGetOrderDetail, TReceiveOrder } from "@/enums/admin-order-interfaces";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import { ErrorMessage } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { MonthValue, OrderStatusValue } from "@/enums/order-enums";
import { IAdminOrderCountFetch, IAdminOrderFetch, IAdminOrderRevenueQuarterDetail, IAdminOrderRevenueQuarterStat, TCheckOutFetch, TCreateOrder, TGetOrder, TGetOrderCount } from "@/enums/order-interfaces";

export function initialiseCheckOut(cart: ICartLocalStorage[]): Promise<TCheckOutFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/checkout/payment/start`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart: cart }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { clientsecret: null, address: null, cart: null, product: null, error: result.error } as TCheckOutFetch;
      } else {
        return { clientsecret: result.clientsecret, address: result.address, cart: result.cart, product: result.product, error: null } as TCheckOutFetch;
      }
    })
    .catch((error) => {
      console.error(error);
      return { clientsecret: null, address: null, cart: null, product: null, error: ErrorMessage.FetchError } as TCheckOutFetch;
    });
}

export function createOrder(addressID: number, cart: ICheckOutCart[]): Promise<TCreateOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addressID: addressID, cart: cart }),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { orderid: null, error: result.error } as TCreateOrder;
      } else {
        return { orderid: result.orderid, error: null } as TCreateOrder;
      }
    })
    .catch((error) => {
      console.error(error);
      return { orderid: null, error: ErrorMessage.FetchError } as TCreateOrder;
    });
}

export function cancelOrder(orderID: number): Promise<TCancelOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order/${orderID}/cancel`, {
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

export function receiveOrder(orderID: number): Promise<TReceiveOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order/${orderID}/received`, {
    method: "PUT",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { message: null, error: result.error } as TReceiveOrder;
      } else {
        if (result.message) {
          return { message: result.message, error: null } as TReceiveOrder;
        }
        return { message: null, error: ErrorMessage.FetchError } as TReceiveOrder;
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: null, error: ErrorMessage.FetchError } as TReceiveOrder;
    });
}

export function getOrderDetail(orderID: number): Promise<TGetOrderDetail> {
  return fetch(`${process.env.BACKEND_URL}/api/order/detail/${orderID}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { order: null, orderdetail: null, error: result.error } as TGetOrderDetail;
      } else {
        if (result.order && result.orderdetail) {
          return { order: result.order, orderdetail: result.orderdetail, error: null } as TGetOrderDetail;
        }
        return { order: null, orderdetail: null, error: ErrorMessage.FetchError } as TGetOrderDetail;
      }
    })
    .catch((error) => {
      console.error(error);
      return { order: null, orderdetail: null, error: ErrorMessage.FetchError } as TGetOrderDetail;
    });
}

/**
 * get admin order list
 * @param pageNo current page number (start from 0) - (number)
 * @param limit current limit - (number)
 * @returns Promise(object) - {data, error}
 * @returns data - array of objects [{createdat, deliveryaddress, name, orderid, orderstatus, paymentmethod, totalamount, totalqty, userid}]
 * @returns error - string
 * @example
 * getAdminOrder(1, 8).then((result) => {
 *      if(result.error) {
 *          // implement error logic here
 *      }
 *      else {
 *          // implement data logic here
 *      }
 * })
 */
export function getAdminOrder(pageNo: number, limit: number): Promise<IAdminOrderFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/order/admin?offset=${pageNo * limit}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminOrderFetch;
      } else {
        return { data: result.data, error: null } as IAdminOrderFetch;
      }
    });
}

/**
 * get admin order list count
 * @returns Promise(object) - {data, error}
 * @returns data - (number)
 * @returns error - string
 * @example
 * getAdminOrderCount().then((result) => {
 *      if(result.error) {
 *          // implement error logic here
 *      }
 *      else {
 *          // implement data logic here
 *      }
 * })
 */
export function getAdminOrderCount(): Promise<IAdminOrderCountFetch> {
  return fetch(`${process.env.BACKEND_URL}/api/order/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { count: null, error: result.error } as IAdminOrderCountFetch;
      } else {
        return { count: result.data, error: null } as IAdminOrderCountFetch;
      }
    })
    .catch((error) => {
      console.error(error);
      return { count: null, error: error } as IAdminOrderCountFetch;
    });
}

/**
 *
 * @returns
 */
export function getAdminOrderQuarterRevenueStat(year: number): Promise<IAdminOrderRevenueQuarterStat> {
  return fetch(`${process.env.BACKEND_URL}/api/order/stat/revenue/quarter?year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as IAdminOrderRevenueQuarterStat;
      } else {
        return { data: result.data, error: null } as IAdminOrderRevenueQuarterStat;
      }
    });
}

export function getAdminOrderQuarterRevenueDetail(quarter: number, gender: "m" | "f", year: number): Promise<IAdminOrderRevenueQuarterDetail> {
  return fetch(`${process.env.BACKEND_URL}/api/order/stat/revenue/quarter/detail?quarter=${quarter}&gender=${gender}&year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { user: null, product: null, error: result.error } as IAdminOrderRevenueQuarterDetail;
      } else {
        return { user: result.user, product: result.product, error: null } as IAdminOrderRevenueQuarterDetail;
      }
    })
    .catch((error) => {
      console.error(error);
      return { user: null, product: null, error: error } as IAdminOrderRevenueQuarterDetail;
    });
}

export function getOrders(searchText: string, status: OrderStatusValue, month: MonthValue, year: string, offset: number, limit: number): Promise<TGetOrder> {
  return fetch(`${process.env.BACKEND_URL}/api/order?limit=${limit}&offset=${offset}&search=${searchText}&status=${status}&month=${month}&year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TGetOrder;
      } else {
        return { data: result.data, error: null } as TGetOrder;
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TGetOrder;
    });
}

export function getOrdersCount(searchText: string, status: OrderStatusValue, month: MonthValue, year: string): Promise<TGetOrderCount> {
  return fetch(`${process.env.BACKEND_URL}/api/order/count?search=${searchText}&status=${status}&month=${month}&year=${year}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { count: null, error: result.error } as TGetOrderCount;
      } else {
        if (isNaN(result.count)) {
          return { count: null, error: ErrorMessage.INVALID_DATA } as TGetOrderCount;
        }
        return { count: parseInt(result.count, 10), error: null } as TGetOrderCount;
      }
    })
    .catch((error) => {
      console.error(error);
      return { count: null, error: ErrorMessage.FetchError } as TGetOrderCount;
    });
}
