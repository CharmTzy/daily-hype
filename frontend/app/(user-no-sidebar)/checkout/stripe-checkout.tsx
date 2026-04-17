"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import PaymentForm from "./payment-form";

const stripePromise = process.env.STRIPE_ID ? loadStripe(process.env.STRIPE_ID) : null;

interface IStripeCheckoutProps {
    totalAmount: number;
    onCheckoutSuccess: (orderID: string) => void;
    isLoading: boolean;
    clientSecret: string;
    cartData: ICheckOutCart[];
    selectedAddressId: number | null;
}

export default function StripeCheckout({
    totalAmount,
    onCheckoutSuccess,
    isLoading,
    clientSecret,
    cartData,
    selectedAddressId,
}: IStripeCheckoutProps) {
    if (!stripePromise) {
        return <p className="mt-6 text-sm text-red-600">Stripe publishable key is missing. Add `STRIPE_ID` in your frontend environment.</p>;
    }

    if (!clientSecret) {
        return <p className="mt-6 text-sm text-slate-500">Preparing secure payment details...</p>;
    }

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#111827",
                colorBackground: "#ffffff",
                colorText: "#0f172a",
                colorDanger: "#dc2626",
                borderRadius: "18px",
                spacingUnit: "5px",
            },
        },
        loader: "auto",
    };

    return (
        <div className="mt-6">
            <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                    totalAmount={totalAmount}
                    onCheckoutSuccess={onCheckoutSuccess}
                    isLoading={isLoading}
                    cartData={cartData}
                    selectedAddressId={selectedAddressId}
                />
            </Elements>
        </div>
    );
}
