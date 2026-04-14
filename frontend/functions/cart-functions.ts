import { ICartDetail, TCartDetailFetch, TCartFetch } from "@/enums/cart-interfaces";
import { ErrorMessage } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
export async function getCart(): Promise<TCartFetch> {
    return fetch(`${process.env.BACKEND_URL}/api/cart`, {
        method: "GET",
        credentials: "include",
    })
        .then((response) => response.json())
        .then((result) => {
        if (result.error) {
            return { data: null, error: result.error } as TCartFetch;
        }
        else {
            return { data: result.data, error: null } as TCartFetch;
        }
    });
}
export async function getCartDetail(isAuthenticated: boolean, cart: ICartLocalStorage[]): Promise<TCartDetailFetch> {
    if (isAuthenticated) {
        return fetch(`${process.env.BACKEND_URL}/api/cart/detail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cart: cart }),
            credentials: "include",
        })
            .then((response) => response.json())
            .then((result) => {
            if (result.error) {
                return { data: null, cart: null, error: result.error } as TCartDetailFetch;
            }
            else {
                return { data: result.data, cart: result.cart, error: null } as TCartDetailFetch;
            }
        })
            .catch((error) => ({ data: null, cart: null, error } as TCartDetailFetch));
    }
    else {
        return fetch(`${process.env.BACKEND_URL}/api/cart/detail/product`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cart: cart }),
        })
            .then((response) => response.json())
            .then((result) => {
            if (result.error) {
                return { data: null, cart: null, error: result.error } as TCartDetailFetch;
            }
            else {
                return { data: result.data, cart: result.cart, error: null } as TCartDetailFetch;
            }
        })
            .catch((error) => ({ data: null, cart: null, error } as TCartDetailFetch));
    }
}
export function removeDuplicateCartData(arr: ICartLocalStorage[], data?: ICartDetail[]) {
    const result: ICartLocalStorage[] = [];
    arr.forEach((item, i) => {
        const index = result.findIndex((r) => r.productdetailid === item.productdetailid);
        if (index !== -1) {
            result[index].qty += item.qty;
            if (data) {
                data = data.filter((d, j) => j !== i);
                let detailIndex = data[index].detail.findIndex((d) => d.productdetailid === result[index].productdetailid);
                if (result[index].qty > data[index].detail[detailIndex].qty) {
                    result[index].qty = 1;
                }
            }
        }
        else {
            result.push({ ...item });
        }
    });
    return { cart: result, data: data };
}
export function removeItemFromCart(productdetailid: number): Promise<boolean> {
    return fetch(`${process.env.BACKEND_URL}/api/cart/${productdetailid}`, {
        method: "DELETE",
        credentials: "include",
    })
        .then((response) => response.json())
        .then((result) => {
        if (result.message === "Delete Success") {
            return true;
        }
        else {
            return false;
        }
    });
}
export function updateCartData(cart: ICartLocalStorage, productDetailID: number): Promise<boolean> {
    return fetch(`${process.env.BACKEND_URL}/api/cart/${productDetailID}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cart }),
    })
        .then((response) => response.json())
        .then((result) => {
        if (result.message === "Update Success") {
            return true;
        }
        else {
            if (result.error === ErrorMessage.ZeroQty) {
                alert("The quantity cannot be less than 1!");
            }
            else {
                alert(result.error);
            }
            return false;
        }
    });
}

