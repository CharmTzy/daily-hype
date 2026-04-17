import { IAddress } from "./address-interfaces";
import { ICheckOutCart } from "./cart-interfaces";
import { ErrorMessage, SuccessMessage } from "./global-enums";
import { ICheckOutProductDetail } from "./product-interfaces";
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
export interface ICheckOutTotals {
    subtotal: number;
    shippingFee: number;
    gstAmount: number;
    total: number;
}
export type IAdminOrderCountFetch = {
    count: number;
    error: null;
} | {
    count: null;
    error: string;
};
export type IAdminOrderFetch = {
    data: IAdminOrder[];
    error: null;
} | {
    data: null;
    error: string;
};
export type IAdminOrderRevenueQuarterStat = {
    data: {
        gender: "F" | "M";
        quarter: "1" | "2" | "3" | "4";
        revenue: string;
        year: number;
    }[];
    error: null;
} | {
    data: null;
    error: string;
};
export type IAdminOrderRevenueQuarterDetail = {
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
} | {
    user: null;
    product: null;
    error: string;
};
export type TCheckOutFetch = {
    clientsecret: string;
    address: IAddress[];
    product: ICheckOutProductDetail[];
    cart: ICheckOutCart[];
    totals: ICheckOutTotals;
    error: null;
} | {
    clientsecret: null;
    address: null;
    product: null;
    cart: null;
    totals: null;
    error: string | ErrorMessage.FetchError;
};
export type TCreateOrder = {
    orderid: null;
    error: string;
} | {
    orderid: string;
    error: null;
};
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
export type TGetOrder = {
    data: IGetOrderData[];
    error: null;
} | {
    data: null;
    error: ErrorMessage;
};
export type TGetOrderCount = {
    count: number;
    error: null;
} | {
    count: null;
    error: ErrorMessage;
};
export type TCancelOrder = {
    message: SuccessMessage;
    error: null;
} | {
    message: null;
    error: ErrorMessage;
};
