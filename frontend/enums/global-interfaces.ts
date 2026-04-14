export interface IUserInfo {
    id: number;
    name: string;
    email: string;
    image: string;
    method: "normal" | "google" | "facebook";
    role: "customer" | "admin" | "manager";
}
export interface ICartLocalStorage {
    productdetailid: number;
    qty: number;
    checked?: boolean;
}

