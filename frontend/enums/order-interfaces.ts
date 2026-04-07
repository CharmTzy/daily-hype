// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { IAddress } from "./address-interfaces";
import { ICheckOutCart } from "./cart-interfaces";
import { ErrorMessage, SuccessMessage } from "./global-enums";
import { ICheckOutProductDetail } from "./product-interfaces";

// admin

export interface IAdminOrder {
  createdat: string;
  deliveryaddress: string;
  name: string;
  orderid: number;
  orderstatus: "confirmed" | "in progress" | "cancelled" | "received" | "delivered" | "returned";
  paymentmethod: string;
  totalamount: string;
  paymentstatus: string;
  totalqty: number;
  userid: number;
}

export type IAdminOrderCountFetch =
  | {
      count: number;
      error: null;
    }
  | {
      count: null;
      error: string;
    };

export type IAdminOrderFetch =
  | {
      data: IAdminOrder[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IAdminOrderRevenueQuarterStat =
  | {
      data: {
        gender: "F" | "M";
        quarter: "1" | "2" | "3" | "4";
        revenue: string;
        year: number;
      }[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IAdminOrderRevenueQuarterDetail =
  | {
      user: {
        name: string;
        gender: string;
        userid: string;
        totalorder: string;
        totalqty: string;
        totalamount: string;
      }[];
      product: {
        productid: number;
        productname: string;
        categoryname: string;
        colourname: string;
        sizename: string;
        totalqty: string;
        totalamount: string;
        totalorder: string;
      }[];
      error: null;
    }
  | {
      user: null;
      product: null;
      error: string;
    };

// admin

// checkout

export type TCheckOutFetch =
  | {
      clientsecret: string;
      address: IAddress[];
      product: ICheckOutProductDetail[];
      cart: ICheckOutCart[];
      error: null;
    }
  | {
      clientsecret: null;
      address: null;
      product: null;
      cart: null;
      error: string | ErrorMessage.FetchError;
    };

export type TCreateOrder =
  | {
      orderid: null;
      error: string;
    }
  | {
      orderid: number;
      error: null;
    };

// checkout

export interface IGetOrderData {
  orderid: string;
  totalqty: number;
  totalamount: string;
  deliveryaddress: string;
  orderstatus: "confirmed" | "in progress" | "cancelled" | "received" | "delivered" | "returned";
  createdat: string;
  productdetails: {
    productdetailid: number;
    productname: string;
    rating: string;
    qty: number;
    unitprice: string;
    colour: string;
    size: string;
    productid: number;
    image: string;
  }[];
}

export type TGetOrder =
  | {
      data: IGetOrderData[];
      error: null;
    }
  | {
      data: null;
      error: ErrorMessage;
    };

export type TGetOrderCount =
  | {
      count: number;
      error: null;
    }
  | {
      count: null;
      error: ErrorMessage;
    };

export type TCancelOrder =
  | {
      message: SuccessMessage;
      error: null;
    }
  | {
      message: null;
      error: ErrorMessage;
    };
