// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { ICartLocalStorage } from "./global-interfaces";

export type TCartFetch =
  | {
    data: ICartLocalStorage[];
    error: null;
  }
  | {
    data: null;
    error: string;
  };

export interface ICartProductDetail {
  productdetailid: number;
  sizeid: number;
  colourid: number;
  qty: number;
  productstatus: string;
  size: string;
  colour: string;
}

export interface ICartDetail {
  productid: number;
  productname: string;
  unitprice: string;
  categoryid: number;
  detail: ICartProductDetail[];
  url: string[];
}

export type TCartDetailFetch =
  | {
    data: ICartDetail[] | [];
    cart: ICartLocalStorage[] | [];
    error: null;
  }
  | {
    data: null;
    cart: null;
    error: string;
  };

export interface ICheckOutCart {
  productdetailid: number;
  qty: number;
}