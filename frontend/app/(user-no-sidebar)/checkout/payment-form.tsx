"use client";
import { useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { useAppState } from "@/app/app-provider";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import { URL } from "@/enums/global-enums";
import { completePayment } from "@/functions/payment-functions";

interface IStripeCheckoutProps {
    totalAmount: number;
    onCheckoutSuccess: (orderID: string) => void;
    isLoading: boolean;
    cartData: ICheckOutCart[];
    selectedAddressId: number | null;
}

export default function PaymentForm({
    totalAmount,
    onCheckoutSuccess,
    isLoading,
    cartData,
    selectedAddressId,
}: IStripeCheckoutProps) {
    const { userInfo } = useAppState();
    const [disabled, setDisabled] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>("");
    const elements = useElements();
    const stripe = useStripe();

    const handlePaymentFormChange = (event: StripePaymentElementChangeEvent) => {
        const { complete, empty } = event;
        setDisabled(empty || !complete);
        if (submitError) {
            setSubmitError("");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements || !userInfo) {
            return;
        }
        if (selectedAddressId === null) {
            setSubmitError("Please select a delivery address before paying.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");
        sessionStorage.setItem("pendingCheckout", JSON.stringify({ selectedAddressId, cartData }));

        const confirmationResult = await stripe.confirmPayment({
            elements,
            confirmParams: {
                receipt_email: userInfo.email,
                return_url: `${window.location.origin}${URL.CheckOut}`,
            },
            redirect: "if_required",
        });

        if (confirmationResult.error) {
            sessionStorage.removeItem("pendingCheckout");
            setSubmitError(confirmationResult.error.message || "Payment failed. Please try again.");
            setIsSubmitting(false);
            return;
        }

        const paymentIntent = confirmationResult.paymentIntent;
        if (!paymentIntent || paymentIntent.status !== "succeeded") {
            setSubmitError("Payment is still processing. Please check your orders shortly.");
            setIsSubmitting(false);
            return;
        }

        const completedOrder = await completePayment(paymentIntent.id, selectedAddressId, cartData);
        if (completedOrder.error || completedOrder.orderid === null) {
            setSubmitError(completedOrder.error || "We could not finalise your order. Please contact support if the payment was captured.");
            setIsSubmitting(false);
            return;
        }

        onCheckoutSuccess(completedOrder.orderid);
    };

    if (!stripe || !elements || !userInfo) {
        return <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Loading secure payment form...</div>;
    }

    return (
        <form className="mt-6 flex flex-col" onSubmit={handleSubmit}>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <PaymentElement
                    onChange={handlePaymentFormChange}
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {submitError ? (
                <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                </div>
            ) : null}

            <Button
                type="submit"
                disabled={isLoading || isSubmitting || disabled || selectedAddressId === null || cartData.length === 0}
                className="mt-6 h-12 rounded-full bg-slate-900 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white"
            >
                {isSubmitting ? <Spinner color="default" size="sm" /> : `Pay $${totalAmount.toFixed(2)}`}
            </Button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Secure payment processing by Stripe. We only create your order after the payment succeeds.
            </p>
        </form>
    );
}
