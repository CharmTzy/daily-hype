"use client";

import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import ResilientImage from "@/components/ui/resilient-image";
import { IProductReview, IProductReviewStats } from "@/enums/review-interfaces";
import { getProductReviews } from "@/functions/review-functions";
import ReviewStars from "./review-stars";

interface ProductReviewSectionProps {
    productName: string;
    productID: number;
    initialStats: IProductReviewStats;
    fallbackAverage?: number;
}

const PAGE_SIZE = 10;

function formatReviewDate(value: string) {
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function ProductReviewSection({
    productName,
    productID,
    initialStats,
    fallbackAverage = 0,
}: ProductReviewSectionProps) {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [reviews, setReviews] = useState<IProductReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const stats = initialStats;
    const displayedAverage = stats.total > 0 ? stats.average : fallbackAverage;
    const filteredTotal =
        selectedRating === null
            ? stats.total
            : (stats.countsByRating.find((c) => c.star === selectedRating)?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

    const fetchReviews = useCallback(() => {
        setIsLoading(true);
        getProductReviews(productID, {
            rating: selectedRating,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
        })
            .then((result) => setReviews(result.error ? [] : result.data || []))
            .finally(() => setIsLoading(false));
    }, [productID, selectedRating, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleRatingSelect = (rating: number | null) => {
        setSelectedRating(rating);
        setPage(1);
    };

    return (
        <section id="reviews" className="mt-2">
            {/* Header */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Customer Reviews
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {productName}
                </h2>
            </div>

            {stats.total === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-900">No reviews yet</p>
                    <p className="mt-1 text-sm text-slate-400">
                        Reviews appear here after customers receive their orders.
                    </p>
                </div>
            ) : (
                <>
                    {/* Filter box */}
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                            {/* Score summary */}
                            <div className="shrink-0 text-center sm:text-left">
                                <div className="flex items-baseline justify-center gap-1.5 sm:justify-start">
                                    <span className="text-5xl font-semibold tracking-tight text-slate-900">
                                        {displayedAverage.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-slate-400">out of 5</span>
                                </div>
                                <div className="mt-1.5">
                                    <ReviewStars value={displayedAverage} size={18} />
                                </div>
                                <p className="mt-1 text-xs text-slate-400">
                                    {stats.total} review{stats.total === 1 ? "" : "s"}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="hidden w-px self-stretch bg-slate-100 sm:block" />
                            <div className="h-px bg-slate-100 sm:hidden" />

                            {/* Filter buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleRatingSelect(null)}
                                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                                        selectedRating === null
                                            ? "border-slate-900 bg-slate-900 text-white"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    All ({stats.total})
                                </button>
                                {stats.countsByRating.map(({ star, count }) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingSelect(selectedRating === star ? null : star)}
                                        className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                                            selectedRating === star
                                                ? "border-[#fb6050] bg-[#fb6050] text-white"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        {star} Star ({count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedRating !== null && (
                            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                                {filteredTotal} result{filteredTotal === 1 ? "" : "s"} for {selectedRating}-star ·{" "}
                                <button
                                    type="button"
                                    onClick={() => handleRatingSelect(null)}
                                    className="font-semibold text-slate-600 underline underline-offset-2"
                                >
                                    Clear
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Review list */}
                    <div className="mt-5">
                        {isLoading ? (
                            <div className="flex min-h-[120px] items-center justify-center">
                                <Spinner size="md" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                                <p className="text-sm text-slate-500">
                                    No {selectedRating}-star reviews yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reviews.map((review) => {
                                    const reviewImages = (review.urls || []).filter(
                                        (url): url is string => Boolean(url),
                                    );
                                    return (
                                        <article
                                            key={review.reviewid}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                                    <ResilientImage
                                                        src={review.profileurl}
                                                        alt={review.name}
                                                        fill
                                                        sizes="40px"
                                                        fallbackSrc="/icons/avatar-placeholder.svg"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {review.name}
                                                        </p>
                                                        <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                                            {Number(review.rating).toFixed(1)} / 5
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        <ReviewStars value={review.rating} size={13} />
                                                        <span className="text-xs text-slate-400">
                                                            {formatReviewDate(review.createdat)}
                                                        </span>
                                                        <span className="text-xs text-slate-300">·</span>
                                                        <span className="text-xs text-slate-400">
                                                            {review.colorname} / {review.sizename}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {review.reviewdescription}
                                            </p>

                                            {reviewImages.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {reviewImages.map((url, index) => (
                                                        <div
                                                            key={`${review.reviewid}-${index}`}
                                                            className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-50"
                                                        >
                                                            <ResilientImage
                                                                src={url}
                                                                alt={`${review.name} photo ${index + 1}`}
                                                                fill
                                                                sizes="80px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-slate-400">
                                {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
