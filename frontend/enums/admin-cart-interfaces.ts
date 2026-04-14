import { ErrorMessage, SuccessMessage } from "./global-enums";
export type TAdminCartCount = {
    count: number;
    error: null;
} | {
    count: null;
    error: ErrorMessage;
};
export interface IAdminCartData {
    cartid: string;
    productdetailid: number;
    name: string;
    qty: number;
    userid: string;
    createdat: string;
    product: {
        productid: number;
        productname: string;
        unitprice: string;
        qty: number;
        productdetailid: number;
        colourname: string;
        sizename: string;
        colourid: number;
        sizeid: number;
        hex: string;
        url: string;
    };
}
export type TAdminCart = {
    data: IAdminCartData[];
    error: null;
} | {
    data: null;
    error: ErrorMessage;
};
export type TDeleteAdminCart = {
    message: SuccessMessage;
    error: null;
} | {
    message: null;
    error: ErrorMessage;
};

