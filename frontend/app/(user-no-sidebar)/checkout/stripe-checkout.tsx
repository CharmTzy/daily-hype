// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { Elements } from "@stripe/react-stripe-js";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import PaymentForm from "./payment-form";
import { ICartLocalStorage } from "@/enums/global-interfaces";

interface IStripeCheckoutProps {
  orderID: number;
  totalAmount: number;
  onClick: () => void;
  isLoading: boolean;
  clientSecret: string;
}

export default function StripeCheckout({ orderID, totalAmount, onClick, isLoading, clientSecret }: IStripeCheckoutProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret,
  };

  useEffect(() => {
    const loadStripeObject = async () => {
      const stripeInstance = await loadStripe(process.env.STRIPE_ID || "");
      setStripe(stripeInstance);
    };

    loadStripeObject();
  }, []);

  return (
    <>
      {totalAmount !== 0 && (
        <Elements stripe={stripe} options={options}>
          <PaymentForm orderID={orderID} onClick={onClick} isLoading={isLoading} />
        </Elements>
      )}
    </>
  );
}
