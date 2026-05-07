"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import ProductReviewSection from "@/components/review/product-review-section";
import { URL } from "@/enums/global-enums";
import { IProductReviewStats } from "@/enums/review-interfaces";
import { getProductAndDetail } from "@/functions/product-functions";
import { getProductReviewStats } from "@/functions/review-functions";

const emptyReviewStats: IProductReviewStats = {
    total: 0,
    average: 0,
    countsByRating: [
        { star: 5, count: 0 },
        { star: 4, count: 0 },
        { star: 3, count: 0 },
        { star: 2, count: 0 },
        { star: 1, count: 0 },
    ],
};

export default function ProductReviewsPage() {
    const { productid } = useParams<{ productid: string }>();
    const [productName, setProductName] = useState("this item");
    const [productRating, setProductRating] = useState(0);
    const [reviewStats, setReviewStats] = useState<IProductReviewStats>(emptyReviewStats);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const parsedProductID = Number(productid);

        if (isNaN(parsedProductID)) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        Promise.all([getProductReviewStats(parsedProductID), getProductAndDetail(productid)])
            .then(([statsResult, detailResult]) => {
                setReviewStats(statsResult.error ? emptyReviewStats : statsResult.data || emptyReviewStats);
                const resolvedName = detailResult.data?.[0]?.productname;
                if (resolvedName) {
                    setProductName(resolvedName);
                }
                setProductRating(Number(detailResult.data?.[0]?.rating || 0));
            })
            .catch((error) => {
                console.error(error);
                setReviewStats(emptyReviewStats);
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

            <ProductReviewSection
                productName={productName}
                productID={Number(productid)}
                initialStats={reviewStats}
                fallbackAverage={productRating}
            />
        </div>
    );
}
