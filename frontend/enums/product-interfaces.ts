import { ErrorMessage } from "./global-enums";

export interface IType {
  typeid: number;
  typename: string;
}

export interface ICategory {
  categoryid: number;
  categoryname: string;
}

export interface IColour {
  colourid: number;
  colourname: string;
  hex: string;
}

export interface ISize {
  sizeid: number;
  sizename: string;
}

export interface IOptions {
  type: IType[];
  category: ICategory[];
  colour: IColour[];
  size: ISize[];
}

export type IOptionsFetch =
  | {
      data: IOptions;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export interface ISelectedDetails {
  colourid: string;
  sizeid: string;
  quantity: string;
}
export interface IProductDetails {
  productdetailid: string;
  colourid: string;
  sizeid: string;
  quantity: string;
}

export interface IProductDetailSubmit {
  productid: string;
  colourid: string;
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
  images: {
    imageid: string;
    imagename: string;
    url: string;
  }[];
}
export interface IProductUpdate {
  productid: string;
  name: string;
  description: string;
  unitprice: string,
  typeid: string,
  categoryid: string
}
export interface IProductDataFilter {
  productid: number;
  productname: string;
  unitprice: string;
  rating: string;
  categoryname: string;
  typename: string;
  detail: { hex: string; sizename: string; colourname: string }[];
  url: string[];
}

export interface IProductDetailsWithNames {
  productdetailid:string,
  colourid: string,
  colour:string,
  hex:string,
  sizeid: string;
  size:string;
  quantity: string;
}

export interface ProductDetail {
  productid: string;
  productname: string;
  unitprice: string;
  description: string;
  soldqty: string;
  rating: string;
  urls: string[];
  typeid: string;
  type: string;
  category: string;
  categoryid: string;
  colour: string;
  colourid: string;
  hex: string;
  size: string;
  sizeid: string;
  qty: string;
  productstatus: string;
  productdetailid: string;
  createdat: string;
  updatedat: string;
}

export type IProductDetailFetch =
  | {
      data: ProductDetail[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

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

export type ITypeFetch =
  | {
      data: IType[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type ICategoryFetch =
  | {
      data: ICategory[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IColourFetch =
  | {
      data: IColour[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type ISizeFetch =
  | {
      data: ISize[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IProductFilterFetch =
  | {
      data: IProductDataFilter[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type IProductFilterCountFetch =
  | {
      data: number;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

// Name: Zay Yar Tun

export interface ILatestProductsByLimitData {
  productid: number;
  productname: string;
  description: string;
  unitprice: string;
  rating: string;
  categoryid: number;
  soldqty: number;
  createdat: string;
  typeid: number;
  typename: string;
  categoryname: string;
  detail: {
    productdetailid: number;
    sizeid: number;
    colourid: number;
    qty: number;
    productstatus: string;
    size: string;
    colour: string;
    hex: string;
  }[];
  url: string[];
}

export type TLatestProductsByLimit =
  | {
      data: null;
      error: ErrorMessage;
    }
  | {
      data: ILatestProductsByLimitData[];
      error: null;
    };

export type TBestSellingByLimit =
  | {
      data: null;
      error: ErrorMessage;
    }
  | {
      data: ILatestProductsByLimitData[];
      error: null;
    };

export interface ICheckOutProductDetail {
  colour: string;
  image: string;
  productdetailid: number;
  productid: number;
  productname: string;
  qty: number;
  size: string;
  unitprice: string;
}
