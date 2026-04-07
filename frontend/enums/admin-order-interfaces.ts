// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ErrorMessage, SuccessMessage } from "./global-enums";

export type TConfirmOrder =
  | {
      message: SuccessMessage;
      error: null;
    }
  | {
      message: null;
      error: ErrorMessage;
    };

export interface IGetOrderItemData {
  productdetailid: number;
  qty: number;
  unitprice: string;
  productname: string;
  rating: string;
  colourname: string;
  sizename: string;
  orderid: string;
  productid: number;
  url: string;
}

export type TGetOrderItem =
  | {
      data: IGetOrderItemData[];
      error: null;
    }
  | {
      data: null;
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

export type TReceiveOrder =
  | {
      message: SuccessMessage;
      error: null;
    }
  | {
      message: null;
      error: ErrorMessage;
    };

export interface IGetOrderDetailOrder {
  orderid: string;
  totalqty: number;
  totalamount: string;
  deliveryaddress: string;
  orderstatus: string;
  name: string;
  shippingfee: string;
  gst: number;
  createdat: string;
  paymentmethod: string;
  userid: string;
}

export interface IGetOrderDetailOrderDetail {
  productdetailid: number;
  qty: number;
  unitprice: string;
  productname: string;
  size: string;
  colour: string;
  productid: number;
  image: string;
}

export type TGetOrderDetail =
  | {
      order: null;
      orderdetail: null;
      error: ErrorMessage;
    }
  | {
      order: IGetOrderDetailOrder;
      orderdetail: IGetOrderDetailOrderDetail[];
      error: null;
    };

export type TGetAdminOrderMonthlyRevenueStat =
  | {
      data: {
        month: string;
        year: string;
        revenue: string;
        gender: string;
      }[];
      error: null;
    }
  | {
      data: null;
      error: ErrorMessage;
    };
