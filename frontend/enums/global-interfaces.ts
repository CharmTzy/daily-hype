// Name: Zay Yar Tun

/**
 * interface used for storing user information in local storage
 */
export interface IUserInfo {
  id: number;
  name: string;
  email: string;
  image: string;
  method: "normal" | "google" | "facebook";
  role: "customer" | "admin" | "manager";
}

/**
 * interface used for shopping cart (local storage)
 */
export interface ICartLocalStorage {
  productdetailid: number;
  qty: number;
  checked?: boolean;
}

// Name: Zay Yar Tun
