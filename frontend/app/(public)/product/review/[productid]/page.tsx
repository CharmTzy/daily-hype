"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import ProductReviewSection from "@/components/review/product-review-section";
import { URL } from "@/enums/global-enums";
import { IProductReview } from "@/enums/review-interfaces";
import { getProductReviews } from "@/functions/review-functions";

export default function ProductReviewsPage() {
    const { productid } = useParams<{ productid: string }>();
    const [reviews, setReviews] = useState<IProductReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const parsedProductID = Number(productid);

        if (isNaN(parsedProductID)) {
            setIsLoading(false);
            setReviews([]);
            return;
        }

        setIsLoading(true);
        getProductReviews(parsedProductID)
            .then((result) => {
                if (result.error) {
                    setReviews([]);
                    return;
                }

                setReviews(result.data || []);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [productid]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    href={`${URL.ProductDetail}${productid}`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700"
                >
                    Back to Product
                </Link>
            </div>

            <ProductReviewSection productName="this item" reviews={reviews} />
        </div>
    );
}
