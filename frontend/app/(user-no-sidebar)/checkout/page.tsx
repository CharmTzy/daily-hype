"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@nextui-org/react";
import { useAppState } from "@/app/app-provider";
import { IAddress } from "@/enums/address-interfaces";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { ICheckOutTotals } from "@/enums/order-interfaces";
import { ICheckOutProductDetail } from "@/enums/product-interfaces";
import { initialiseCheckOut } from "@/functions/order-functions";
import { completePayment } from "@/functions/payment-functions";
import StripeCheckout from "./stripe-checkout";
import OrderSummary from "./order-summary";
import DeliveryCheckout from "./delivery-checkout";

const AddressModal = dynamic(() => import("./address-modal"), { ssr: false });

const defaultTotals: ICheckOutTotals = {
    subtotal: 0,
    shippingFee: 0,
    gstAmount: 0,
    total: 0,
};

export default function Page() {
    const { cart, userInfo, headerCanLoad, setCurrentActivePage, setCart } = useAppState();
    const [productData, setProductData] = useState<ICheckOutProductDetail[]>([]);
    const [cartData, setCartData] = useState<ICheckOutCart[]>([]);
    const [addressData, setAddressData] = useState<IAddress[]>([]);
    const [clientSecret, setClientSecret] = useState<string>("");
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
    const [totals, setTotals] = useState<ICheckOutTotals>(defaultTotals);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string>("");
    const [hasInitialisedCheckout, setHasInitialisedCheckout] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCheckoutSuccess = useCallback((orderID: string) => {
        setCart((prev) => {
            const nextCart = prev.filter((item) => item.checked !== true);
            localStorage.setItem("cart", JSON.stringify(nextCart));
            return nextCart;
        });
        sessionStorage.removeItem("pendingCheckout");
        router.push(`${URL.UserOrderDetail}${orderID}`);
    }, [router, setCart]);

    useEffect(() => {
        if (!headerCanLoad) {
            return;
        }

        setCurrentActivePage(CurrentActivePage.None);
        if (userInfo === null) {
            alert(ErrorMessage.UNAURHOTIZED);
            router.push(URL.SignOut);
            return;
        }

        const returnedPaymentIntent = searchParams.get("payment_intent");
        const redirectStatus = searchParams.get("redirect_status");
        const pendingCheckout = sessionStorage.getItem("pendingCheckout");

        if (returnedPaymentIntent && redirectStatus === "succeeded" && pendingCheckout) {
            sessionStorage.removeItem("pendingCheckout");

            let restoredCheckout: { selectedAddressId?: number; cartData?: ICheckOutCart[] } | null = null;

            try {
                restoredCheckout = JSON.parse(pendingCheckout);
            } catch {
                setLoadError("We could not restore your payment confirmation. Please try checking out again.");
                setIsLoading(false);
                return;
            }

            if (!restoredCheckout?.selectedAddressId || !Array.isArray(restoredCheckout.cartData) || restoredCheckout.cartData.length === 0) {
                setLoadError("We could not restore your checkout items. Please try again.");
                setHasInitialisedCheckout(true);
                setIsLoading(false);
                return;
            }

            setHasInitialisedCheckout(true);
            completePayment(returnedPaymentIntent, restoredCheckout.selectedAddressId, restoredCheckout.cartData)
                .then((result) => {
                    if (result.error || !result.orderid) {
                        setLoadError(result.error || "Your payment went through, but we could not finish the order automatically. Please contact support.");
                        return;
                    }
                    handleCheckoutSuccess(result.orderid);
                })
                .finally(() => {
                    setIsLoading(false);
                });
            return;
        }

        if (returnedPaymentIntent && redirectStatus && redirectStatus !== "succeeded") {
            sessionStorage.removeItem("pendingCheckout");
            setLoadError("Payment was not completed. Please try again.");
            setHasInitialisedCheckout(true);
            setIsLoading(false);
            return;
        }

        if (hasInitialisedCheckout) {
            return;
        }

        const checkedCartItems = cart.filter((item) => item.checked === true);
        if (checkedCartItems.length === 0) {
            alert("You have no item selected!");
            router.push(URL.Cart);
            return;
        }

        initialiseCheckOut(checkedCartItems)
            .then((result) => {
                if (result.error) {
                    setLoadError(result.error);
                    setHasInitialisedCheckout(true);
                    return;
                }

                const nextAddresses = result.address || [];
                setClientSecret(result.clientsecret || "");
                setCartData(result.cart || []);
                setProductData(result.product || []);
                setAddressData(nextAddresses);
                setTotals(result.totals || defaultTotals);

                const defaultAddressIndex = nextAddresses.findIndex((address) => address.is_default === true);
                setSelectedAddressIndex(defaultAddressIndex >= 0 ? defaultAddressIndex : nextAddresses.length > 0 ? 0 : -1);
                setHasInitialisedCheckout(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [cart, handleCheckoutSuccess, hasInitialisedCheckout, headerCanLoad, router, searchParams, setCurrentActivePage, userInfo]);

    const selectedAddress = useMemo(() => {
        return selectedAddressIndex >= 0 ? addressData[selectedAddressIndex] : null;
    }, [addressData, selectedAddressIndex]);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Secure Checkout</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Review and pay with confidence</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                            Confirm your delivery address, review your order summary, and complete payment securely with Stripe.
                        </p>
                    </div>
                    <Link
                        href={URL.Cart}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        Back to cart
                    </Link>
                </div>
            </section>

            {loadError ? (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                    {loadError}
                </div>
            ) : (
                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_420px]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Delivery</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Shipping address</h2>
                                </div>
                                {selectedAddress ? (
                                    <button
                                        type="button"
                                        onClick={onOpen}
                                        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                                    >
                                        Change address
                                    </button>
                                ) : null}
                            </div>

                            {!isLoading && !selectedAddress ? (
                                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                                    <p className="text-sm font-semibold text-slate-900">No address selected yet</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Add a saved address before paying so we know exactly where this order should go.
                                    </p>
                                    <Link
                                        href={URL.AddressBook}
                                        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Open Address Book
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-5">
                                    {selectedAddress ? <DeliveryCheckout addressData={selectedAddress} /> : null}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Order Review</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Items in this checkout</h2>
                                </div>
                                <span className="rounded-full bg-[#fff5f2] px-3 py-1.5 text-sm font-medium text-[#d45540]">
                                    {cartData.length} {cartData.length === 1 ? "item" : "items"}
                                </span>
                            </div>
                            <OrderSummary productData={productData} totals={totals} cartData={cartData} />
                        </section>
                    </div>

                    <div className="xl:sticky xl:top-28 xl:self-start">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Payment</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Pay securely</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Your payment is processed by Stripe. The order will only be created after the payment is successfully confirmed.
                            </p>
                            <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Total due now</span>
                                    <span className="text-2xl font-semibold tracking-tight text-slate-900">${totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <StripeCheckout
                                clientSecret={clientSecret}
                                cartData={cartData}
                                selectedAddressId={selectedAddress ? parseInt(selectedAddress.address_id, 10) : null}
                                totalAmount={totals.total}
                                isLoading={isLoading}
                                onCheckoutSuccess={handleCheckoutSuccess}
                            />
                        </section>
                    </div>
                </div>
            )}

            <AddressModal
                addressData={addressData}
                isOpen={isOpen}
                onClose={onClose}
                selectedAddress={selectedAddressIndex}
                setSelectedAddress={setSelectedAddressIndex}
            />
        </div>
    );
}
