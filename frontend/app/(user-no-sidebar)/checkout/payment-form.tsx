"use client";

import { useAppState } from "@/app/app-provider";
import { URL } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { completePayment } from "@/functions/payment-functions";
import { Button, Spinner } from "@nextui-org/react";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeAddressElementChangeEvent, StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IStripeCheckoutProps {
  orderID: number;
  onClick: () => void;
  isLoading: boolean;
}

export default function PaymentForm({ orderID, onClick, isLoading }: IStripeCheckoutProps) {
  const { userInfo } = useAppState();
  const [disabled, setDisabled] = useState<boolean>(true);
  const [paymentFormComplete, setPaymentFormComplete] = useState<boolean>(false);
  const [addressFormComplete, setAddressFormComplete] = useState<boolean>(false);
  const elements = useElements();
  const stripe = useStripe();
  const router = useRouter();

  const handlePaymentFormChange = (event: StripePaymentElementChangeEvent) => {
    const { complete, empty } = event;

    if (empty) {
      setPaymentFormComplete(false);
    } else if (complete) {
      setPaymentFormComplete(true);
    } else {
      setPaymentFormComplete(false);
    }
  };

  const handleAddressFormChange = (event: StripeAddressElementChangeEvent) => {
    const { complete, empty } = event;

    if (empty) {
      setAddressFormComplete(false);
    } else if (complete) {
      setAddressFormComplete(true);
    } else {
      setAddressFormComplete(false);
    }
  };

  useEffect(() => {
    if (paymentFormComplete && addressFormComplete) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [paymentFormComplete, addressFormComplete]);

  useEffect(() => {
    if (orderID !== -1 && stripe !== null && elements !== null && userInfo !== null) {
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            receipt_email: userInfo.email,
            return_url: window.location.href,
          },
          redirect: "if_required",
        })
        .then((result) => {
          if (result.error) {
            console.error(result.error);
            alert("Payment failed");
            router.push(URL.AllOrder);
          } else {
            const paymentIntent = result.paymentIntent;
            completePayment(paymentIntent.id, orderID).then((result) => {
              alert("Order Success");
              router.push(URL.AllOrder);
            });
          }
        });
    }
  }, [orderID]);

  if (!stripe || !elements || !userInfo) {
    return <></>;
  }

  return (
    <form className="mt-8 flex flex-col">
      <PaymentElement onChange={handlePaymentFormChange} />
      <AddressElement onChange={handleAddressFormChange} className="mt-3" options={{ mode: "billing" }} />
      <Button disabled={isLoading || disabled} onClick={onClick} className="text-lg disabled:cursor-not-allowed text-white py-7 mt-6 bg-gradient-to-r from-custom-color1 to-custom-color2">
        {isLoading ? <Spinner color="default" size="md" /> : <>Check Out</>}
      </Button>
    </form>
  );
}
