import { ICheckOutCart } from "@/enums/cart-interfaces";
export function completePayment(paymentIntentID: string, addressID: number, cart: ICheckOutCart[]): Promise<{
    error: string | null;
    orderid: string | null;
}> {
    return fetch(`${process.env.BACKEND_URL}/api/checkout/payment/success`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentintent: paymentIntentID, addressID, cart })
    })
        .then((response) => response.json())
        .then((result) => {
        if (result.error) {
            return { error: result.error, orderid: null };
        }
        else {
            return { error: null, orderid: result.orderid || null };
        }
    })
        .catch((error) => {
        console.error(error);
        return { error: "Payment failed", orderid: null };
    });
}
