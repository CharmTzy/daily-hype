// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ErrorMessage } from "./global-enums";

export interface IGetAdminRefundData {
  refundid: string;
  refundamount: string;
  refundreason: string;
  refundcategory: string;
  refundstatus: string;
  createdat: string;
  updatedat: string;
  orderid: string;
  productdetailid: number;
  refundqty: number;
  name: string;
  productname: string;
  colourname: string;
  sizename: string;
  url: string;
}

export type TGetAdminRefund =
  | {
      data: IGetAdminRefundData[];
      error: null;
    }
  | {
      data: null;
      error: ErrorMessage;
    };

export type TAdminRefundCount =
  | {
      count: number;
      error: null;
    }
  | {
      count: null;
      error: ErrorMessage;
    };
