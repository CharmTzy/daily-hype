"use client";

import ResilientImage from "@/components/ui/resilient-image";
import { IProductReview } from "@/enums/review-interfaces";
import ReviewStars from "./review-stars";

interface ProductReviewSectionProps {
    productName: string;
    reviews: IProductReview[];
}

function formatReviewDate(value: string) {
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function ProductReviewSection({ productName, reviews }: ProductReviewSectionProps) {
    const reviewCount = reviews.length;
    const averageRating =
        reviewCount > 0
            ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviewCount
            : 0;

    return (
        <section
            id="reviews"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
        >
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Customer Reviews
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                        What shoppers are saying about {productName}.
                    </h2>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4 sm:min-w-[220px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Average rating
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-3xl font-semibold text-slate-900">
                            {averageRating.toFixed(1)}
                        </span>
                        <ReviewStars value={averageRating} size={18} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                        {reviewCount} review{reviewCount === 1 ? "" : "s"}
                    </p>
                </div>
            </div>

            {reviewCount === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                    <p className="text-lg font-medium text-slate-900">No reviews yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Reviews appear here after customers receive their orders.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-5">
                    {reviews.map((review) => {
                        const reviewImages = (review.urls || []).filter((url): url is string => Boolean(url));

                        return (
                            <article
                                key={review.reviewid}
                                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                                            <ResilientImage
                                                src={review.profileurl}
                                                alt={review.name}
                                                fill
                                                sizes="48px"
                                                fallbackSrc="/icons/avatar-placeholder.svg"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-base font-semibold text-slate-900">{review.name}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <ReviewStars value={review.rating} />
                                                <span className="text-sm text-slate-500">
                                                    {formatReviewDate(review.createdat)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Colour: {review.colorname} / Size: {review.sizename}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                                        {Number(review.rating).toFixed(1)} / 5
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    {review.reviewdescription}
                                </p>

                                {reviewImages.length > 0 ? (
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        {reviewImages.map((url, index) => (
                                            <div
                                                key={`${review.reviewid}-${index}`}
                                                className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-white"
                                            >
                                                <ResilientImage
                                                    src={url}
                                                    alt={`${review.name} review ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 240px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
