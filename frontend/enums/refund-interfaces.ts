import { ErrorMessage, SuccessMessage } from "./global-enums";
export interface IGetOrderItemByOrderIDData {
    productdetailid: number;
    qty: number;
    unitprice: string;
    productname: string;
    rating: string;
    colourname: string;
    sizename: string;
    orderid: string;
    productid: number;
}
export type TGetOrderItemByOrderID = {
    data: IGetOrderItemByOrderIDData[];
    error: null;
} | {
    data: null;
    error: ErrorMessage;
};
export type TCreateRefundRequest = {
    message: null;
    error: ErrorMessage;
} | {
    message: SuccessMessage;
    error: null;
};

