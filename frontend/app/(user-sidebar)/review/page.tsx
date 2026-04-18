"use client";

import Link from "next/link";
import { Button, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import ReviewStars from "@/components/review/review-stars";
import { CurrentActivePage, SuccessMessage, URL } from "@/enums/global-enums";
import { ICustomerReview } from "@/enums/review-interfaces";
import { capitaliseWord } from "@/functions/formatter";
import { deleteCustomerReview, getCustomerReviews } from "@/functions/review-functions";

function formatReviewDate(value: string) {
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function CustomerReviewsPage() {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();
    const [reviews, setReviews] = useState<ICustomerReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingReviewID, setDeletingReviewID] = useState<number | null>(null);

    const loadReviews = async () => {
        setIsLoading(true);
        const result = await getCustomerReviews();

        if (result.error) {
            alert(result.error);
            setReviews([]);
        } else {
            setReviews(result.data || []);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.MyReviews);
    }, [setCurrentActivePage]);

    useEffect(() => {
        loadReviews();
    }, []);

    const handleDelete = async (reviewID: number) => {
        const confirmed = window.confirm("Delete this review?");
        if (!confirmed) {
            return;
        }

        setDeletingReviewID(reviewID);
        const result = await deleteCustomerReview(reviewID);
        setDeletingReviewID(null);

        if (result.error) {
            alert(result.error);
            return;
        }

        if (result.message === SuccessMessage.DELETE_SUCCESS) {
            await loadReviews();
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            My Reviews
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                            Reviews you have already posted.
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            You can edit reviews for received orders and remove ones you no longer want to keep.
                        </p>
                    </div>

                    <Link
                        href={URL.ReceivedOrder}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700"
                    >
                        Back to Orders
                    </Link>
                </div>

                {reviews.length === 0 ? (
                    <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                        <p className="text-lg font-medium text-slate-900">No reviews posted yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Once you receive an order, the review action will appear on that item.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-5">
                        {reviews.map((review) => (
                            <article
                                key={review.reviewid}
                                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <Link
                                            href={`${URL.ProductDetail}${review.productid}`}
                                            className="text-xl font-semibold text-slate-900 underline-offset-4 hover:underline"
                                        >
                                            {review.productname}
                                        </Link>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Order #{review.orderid} / {capitaliseWord(review.colourname)} / {review.sizename}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <ReviewStars value={review.rating} />
                                            <span className="text-sm text-slate-500">
                                                {formatReviewDate(review.updatedat || review.createdat)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            className="h-11 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
                                            onClick={() =>
                                                router.push(`${URL.WriteReview}/${review.orderid}/${review.productdetailid}`)
                                            }
                                        >
                                            Edit Review
                                        </Button>
                                        <Button
                                            className="h-11 rounded-full border border-rose-300 bg-white px-5 text-sm font-semibold text-rose-700"
                                            onClick={() => handleDelete(review.reviewid)}
                                            isDisabled={deletingReviewID === review.reviewid}
                                        >
                                            {deletingReviewID === review.reviewid ? (
                                                <Spinner size="sm" color="default" />
                                            ) : (
                                                "Delete Review"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    {review.reviewdescription}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
