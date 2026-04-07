// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

import { ErrorMessage } from "./global-enums";

export interface IProductListData {
  productid: number;
  productname: string;
  rating: string;
  unitprice: string;
  urls: string[];
  description: string[];
  categoryname: string[];
}

export type TProductList =
  | {
    data: IProductListData[];
    error: null;
  }
  | {
    data: null;
    error: ErrorMessage;
  };

export type TProductListCount =
  | {
    data: number;
    error: null;
  }
  | {
    data: null;
    error: ErrorMessage;
  };

// filtered-interfaces.ts
export interface ISelectedDetails {
  colourid: string,
  sizeid: string;
  quantity: string;
}

export interface IProduct {
  name: string;
  description: string;
  unitPrice: string;
  typeid: string;
  categoryid: string;
  productDetails: ISelectedDetails[];
  images: string[];
}
export interface IProductDetailSubmit {
  productid: string;
  colourid: string;
  sizeid: string;
  quantity: string;
}


export type IDeleteFetch =
  | {
    data: string;
    error: null;
  }
  | {
    data: null;
    error: string;
  };

export type ICreateFetch =
  | {
    data: string;
    error: null;
  }
  | {
    data: null;
    error: string;
  };

export type IUpdateFetch =
  | {
    data: string;
    error: null;
  }
  | {
    data: null;
    error: string;
  };

export interface IProductUpdate {
  productid: string;
  name: string;
  description: string;
  unitprice: string,
  typeid: string,
  categoryid: string
  images: {
    imageid: string;
    imagename: string;
    url: string;
  }[];
}

export type IAdminProductQuarterStat =
  | {
    data: {
      type: "man" | "woman" | "boy" | "girl" | "baby";
      quarter: "1" | "2" | "3" | "4";
      soldqty: string;
      year: number;
    }[];
    error: null;
  }
  | {
    data: null;
    error: string;
  };


export type IAdminProductMonthlyStat =
  | {
    data: {
      type: "man" | "woman" | "boy" | "girl" | "baby";
      month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
      soldqty: string;
      year: number;
    }[];
    error: null;
  }
  | {
    data: null;
    error: string;
  };