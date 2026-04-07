// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

export function completePayment(paymentIntentID: string, orderID: number): Promise<{ error: string | null }> {
    return fetch(`${process.env.BACKEND_URL}/api/checkout/payment/success`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ paymentintent: paymentIntentID, orderid: orderID })
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.error) {
                return { error: result.error };
            }
            else {
                return { error: null };
            }
        })
        .catch((error) => {
            console.error(error);
            return { error: "Payment failed" };
        })
}