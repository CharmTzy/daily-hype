"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import { CurrentActivePage, SuccessMessage, URL } from "@/enums/global-enums";
import { IGetOrderItemByOrderIDData } from "@/enums/refund-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { getOrderItemByOrderID } from "@/functions/refund-functions";
import {
    createCustomerReview,
    getCustomerReviewByOrderItem,
    updateCustomerReview,
} from "@/functions/review-functions";

interface ReviewFormProps {
    params: {
        orderid: string;
        productdetailid: string;
    };
}

export default function ReviewFormPage({ params }: ReviewFormProps) {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();
    const orderID = Number(params.orderid);
    const productDetailID = Number(params.productdetailid);
    const [item, setItem] = useState<IGetOrderItemByOrderIDData | null>(null);
    const [reviewID, setReviewID] = useState<number | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [reviewDescription, setReviewDescription] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.MyReviews);
    }, [setCurrentActivePage]);

    useEffect(() => {
        if (isNaN(orderID) || isNaN(productDetailID)) {
            setErrorMessage("This review link is invalid.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        Promise.all([
            getOrderItemByOrderID(orderID),
            getCustomerReviewByOrderItem(orderID, productDetailID),
        ])
            .then(([orderItemResult, existingReviewResult]) => {
                if (orderItemResult.error) {
                    setErrorMessage(orderItemResult.error);
                    return;
                }

                const selectedItem = (orderItemResult.data || []).find(
                    (orderItem) => orderItem.productdetailid === productDetailID,
                );

                if (!selectedItem) {
                    setErrorMessage("We could not find that order item.");
                    return;
                }

                if (selectedItem.orderstatus !== "received") {
                    setErrorMessage("Reviews are only available after the order is marked as received.");
                    setItem(selectedItem);
                    return;
                }

                setItem(selectedItem);

                if (!existingReviewResult.error && existingReviewResult.review) {
                    setReviewID(existingReviewResult.review.reviewid);
                    setRating(Number(existingReviewResult.review.rating || 5));
                    setReviewDescription(existingReviewResult.review.reviewdescription || "");
                }
            })
            .catch((error) => {
                console.error(error);
                setErrorMessage("We could not load the review form right now.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [orderID, productDetailID]);

    const descriptionLength = reviewDescription.trim().length;
    const isEditMode = useMemo(() => reviewID !== null, [reviewID]);

    const handleSubmit = async () => {
        if (!item) {
            setErrorMessage("Order item not found.");
            return;
        }

        if (descriptionLength === 0) {
            setErrorMessage("Please share a short review before submitting.");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");

        const result = isEditMode
            ? await updateCustomerReview(reviewID as number, rating, reviewDescription.trim())
            : await createCustomerReview(orderID, productDetailID, rating, reviewDescription.trim());

        setIsSaving(false);

        if (result.error) {
            setErrorMessage(result.error);
            return;
        }

        if (
            result.message === SuccessMessage.CREATE_SUCCESS ||
            result.message === SuccessMessage.UPDATE_SUCCESS
        ) {
            router.push(URL.WriteReview);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Review Item
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                            {isEditMode ? "Update your review" : "Share your review"}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Reviews help other shoppers once an order is received.
                        </p>
                    </div>

                    <Link
                        href={URL.ReceivedOrder}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700"
                    >
                        Back to Orders
                    </Link>
                </div>

                {item ? (
                    <div className="mt-6 flex flex-col gap-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                        <div className="relative h-28 w-24 overflow-hidden rounded-[1.25rem] bg-white">
                            {item.image ? (
                                <ResilientImage
                                    src={item.image}
                                    alt={item.productname}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            ) : null}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-slate-900">{item.productname}</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Order #{item.orderid} / {capitaliseWord(item.colourname)} / {item.sizename}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Qty: {item.qty} / Unit price: ${formatMoney(item.unitprice)}
                            </p>
                        </div>
                    </div>
                ) : null}

                {errorMessage ? (
                    <div className="mt-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="mt-6">
                    <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Rating
                    </label>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {[5, 4, 3, 2, 1].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                                    rating === value
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-white text-slate-700"
                                }`}
                            >
                                {value} star{value === 1 ? "" : "s"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Review
                    </label>
                    <textarea
                        value={reviewDescription}
                        onChange={(event) => setReviewDescription(event.target.value)}
                        rows={6}
                        maxLength={1000}
                        className="mt-3 w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                        placeholder="Tell other shoppers about the fit, colour, quality, and overall experience."
                        disabled={!item || item.orderstatus !== "received" || isSaving}
                    />
                    <p className="mt-2 text-right text-xs text-slate-400">{descriptionLength} / 1000</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                        className="h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white"
                        onClick={handleSubmit}
                        isDisabled={!item || item.orderstatus !== "received" || isSaving}
                    >
                        {isSaving ? <Spinner size="sm" color="default" /> : isEditMode ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button
                        className="h-12 rounded-full border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-700"
                        onClick={() => router.push(URL.WriteReview)}
                        isDisabled={isSaving}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
