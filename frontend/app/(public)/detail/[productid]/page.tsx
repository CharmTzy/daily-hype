"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { ILatestProductsByLimitData, ProductDetail } from "@/enums/product-interfaces";
import { IProductReviewStats } from "@/enums/review-interfaces";
import { removeDuplicateCartData } from "@/functions/cart-functions";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import {
    getBestSellingByLimit,
    getLatestProductsByLimit,
    getProductAndDetail,
} from "@/functions/product-functions";
import { getProductReviewStats } from "@/functions/review-functions";
import LatestItem from "@/app/(public)/(home)/latest-item";
import ProductReviewSection from "@/components/review/product-review-section";
import ResilientImage from "@/components/ui/resilient-image";

interface ProductDetailPageProps {
    params: {
        productid: string;
    };
}

type ColourGroup = {
    colour: string;
    hex: string;
    items: ProductDetail[];
};

function getPreferredDetail(items: ProductDetail[]) {
    return items.find((item) => Number(item.qty) > 0) || items[0] || null;
}

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

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const router = useRouter();
    const { setCart, setCurrentActivePage } = useAppState();
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<ILatestProductsByLimitData[]>([]);
    const [productReviewStats, setProductReviewStats] = useState<IProductReviewStats>(emptyReviewStats);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColour, setSelectedColour] = useState("");
    const [selectedProductDetailId, setSelectedProductDetailId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.None);
        setIsLoading(true);
        setFeedbackMessage("");

        Promise.all([
            getProductAndDetail(params.productid),
            getLatestProductsByLimit(8),
            getBestSellingByLimit(8),
            getProductReviewStats(Number(params.productid)),
        ])
            .then(([detailResult, latestResult, bestSellingResult, reviewStatsResult]) => {
                const nextProductDetails = detailResult.data || [];
                setProductDetails(nextProductDetails);
                setProductReviewStats(reviewStatsResult.error ? emptyReviewStats : reviewStatsResult.data || emptyReviewStats);

                if (nextProductDetails.length > 0) {
                    const preferredDetail = getPreferredDetail(nextProductDetails);
                    if (preferredDetail) {
                        setSelectedColour(preferredDetail.colour);
                        setSelectedProductDetailId(preferredDetail.productdetailid);
                        setSelectedImageIndex(0);
                        setQuantity(1);
                    }
                }

                const currentProductId = Number(params.productid);
                const mergedRecommendations = [
                    ...(latestResult.error ? [] : latestResult.data || []),
                    ...(bestSellingResult.error ? [] : bestSellingResult.data || []),
                ]
                    .filter((item) => item.productid !== currentProductId)
                    .filter(
                        (item, index, arr) =>
                            arr.findIndex((candidate) => candidate.productid === item.productid) === index,
                    )
                    .slice(0, 4);

                setRecommendedProducts(mergedRecommendations);
            })
            .catch((error) => {
                console.error(error);
                setProductDetails([]);
                setRecommendedProducts([]);
                setProductReviewStats(emptyReviewStats);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [params.productid, setCurrentActivePage]);

    const product = productDetails[0];

    const colourGroups = useMemo(
        () =>
            productDetails.reduce((groups, item) => {
                const existingGroup = groups.find((group) => group.colour === item.colour);
                if (existingGroup) {
                    existingGroup.items.push(item);
                    return groups;
                }

                groups.push({
                    colour: item.colour,
                    hex: item.hex,
                    items: [item],
                });
                return groups;
            }, [] as ColourGroup[]),
        [productDetails],
    );

    const activeColourGroup = useMemo(
        () => colourGroups.find((group) => group.colour === selectedColour) || colourGroups[0],
        [colourGroups, selectedColour],
    );

    const selectedDetail =
        activeColourGroup?.items.find((item) => item.productdetailid === selectedProductDetailId) ||
        getPreferredDetail(activeColourGroup?.items || []);

    const imageUrls = useMemo(
        () => Array.from(new Set((product?.urls || []).filter(Boolean))),
        [product],
    );

    const maxQty = Math.max(0, Number(selectedDetail?.qty || 0));
    const totalStock = productDetails.reduce((total, item) => total + Number(item.qty || 0), 0);
    const inStockSizeCount = productDetails.filter((item) => Number(item.qty) > 0).length;
    const reviewCount = productReviewStats.total;
    const averageRating = reviewCount > 0 ? productReviewStats.average : Number(product?.rating || 0);

    useEffect(() => {
        if (!selectedDetail) {
            return;
        }

        setQuantity((current) => {
            if (maxQty < 1) {
                return 1;
            }
            return Math.min(current, maxQty);
        });
    }, [maxQty, selectedDetail]);

    const handleAddToCart = (redirectToCart = false) => {
        if (!selectedDetail) {
            setFeedbackMessage("Please choose an available size before adding this item.");
            return;
        }

        const detailId = Number(selectedDetail.productdetailid);
        if (maxQty < 1) {
            setFeedbackMessage("This size is currently out of stock.");
            return;
        }

        const chosenQty = Math.min(quantity, maxQty);

        setCart((prevCart) => {
            const nextCart = [...prevCart];
            const existingIndex = nextCart.findIndex((item) => item.productdetailid === detailId);

            if (existingIndex >= 0) {
                nextCart[existingIndex] = {
                    ...nextCart[existingIndex],
                    qty: Math.min(nextCart[existingIndex].qty + chosenQty, maxQty),
                };
            } else {
                nextCart.push({
                    productdetailid: detailId,
                    qty: chosenQty,
                } as ICartLocalStorage);
            }

            const mergedCart = removeDuplicateCartData(nextCart).cart;
            localStorage.setItem("cart", JSON.stringify(mergedCart));
            return mergedCart;
        });

        setFeedbackMessage(
            redirectToCart
                ? `${product.productname} was added to your cart.`
                : `${product.productname} added to cart.`,
        );

        if (redirectToCart) {
            router.push(URL.Cart);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
                <h1 className="text-3xl font-semibold text-slate-900">Product not found</h1>
                <p className="mt-3 text-sm text-slate-500">
                    This item may have been removed or is no longer available.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href={URL.Explore}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-900"
                    >
                        Continue shopping
                    </Link>
                    <Link
                        href={URL.Help}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
                    >
                        Visit help centre
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:gap-10 lg:px-8 lg:py-10">
                <div className="text-sm text-slate-500">
                    <Link href={URL.Home}>Home</Link>
                    <span className="px-2">/</span>
                    <Link href={URL.Explore}>Explore</Link>
                    <span className="px-2">/</span>
                    <span className="capitalize">{product.productname}</span>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
                    <section className="grid gap-4 md:grid-cols-[110px_1fr]">
                        <div className="order-2 flex gap-3 md:order-1 md:flex-col">
                            {imageUrls.map((url, index) => (
                                <button
                                    key={`${url}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative h-24 w-24 overflow-hidden rounded-2xl border ${
                                        selectedImageIndex === index ? "border-slate-900" : "border-slate-200"
                                    }`}
                                >
                                    <ResilientImage
                                        src={url}
                                        alt={`${product.productname} thumbnail ${index + 1}`}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="order-1 relative min-h-[360px] overflow-hidden rounded-[2rem] bg-slate-100 md:order-2 md:min-h-[520px]">
                            {imageUrls[selectedImageIndex] ? (
                                <ResilientImage
                                    src={imageUrls[selectedImageIndex]}
                                    alt={product.productname}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            ) : null}
                        </div>
                    </section>

                    <section className="flex flex-col justify-center lg:sticky lg:top-28 lg:self-start">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                            {capitaliseWord(product.type)} / {capitaliseWord(product.category)}
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                            {product.productname}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <span className="text-2xl font-semibold text-slate-900">
                                ${formatMoney(product.unitprice)}
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-600">
                                {Number(averageRating || 0).toFixed(1)} star rating
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                                {totalStock} pieces available
                            </span>
                            <a
                                href="#reviews"
                                className="text-sm font-medium text-slate-500 underline underline-offset-4"
                            >
                                {reviewCount} review{reviewCount === 1 ? "" : "s"}
                            </a>
                        </div>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
                            {product.description}
                        </p>
                        <p className="mt-6 text-sm text-slate-500">
                            Secure checkout / tracked delivery / refunds and returns after received orders
                        </p>

                        <div className="mt-8">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Colour
                            </h2>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {colourGroups.map((group) => {
                                    const preferredDetail = getPreferredDetail(group.items);
                                    const isSelected = selectedColour === group.colour;

                                    return (
                                        <button
                                            key={group.colour}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColour(group.colour);
                                                setSelectedProductDetailId(preferredDetail?.productdetailid || "");
                                                setQuantity(1);
                                                setFeedbackMessage("");
                                            }}
                                            className={`flex items-center gap-3 rounded-full border px-4 py-2 ${
                                                isSelected
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : "border-slate-200 bg-white text-slate-700"
                                            }`}
                                        >
                                            <span
                                                className="h-4 w-4 rounded-full border border-black/10"
                                                style={{ backgroundColor: `#${group.hex}` }}
                                            />
                                            <span className="capitalize">{group.colour}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Size
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {inStockSizeCount} in-stock option{inStockSizeCount === 1 ? "" : "s"}
                                </p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {activeColourGroup?.items.map((item) => {
                                    const isSoldOut = Number(item.qty) < 1;
                                    const isSelected = selectedDetail?.productdetailid === item.productdetailid;

                                    return (
                                        <button
                                            key={item.productdetailid}
                                            type="button"
                                            disabled={isSoldOut}
                                            onClick={() => {
                                                setSelectedProductDetailId(item.productdetailid);
                                                setQuantity(1);
                                                setFeedbackMessage("");
                                            }}
                                            className={`min-w-[84px] rounded-full border px-4 py-2 text-sm font-medium uppercase transition ${
                                                isSelected
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : isSoldOut
                                                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                        : "border-slate-200 bg-white text-slate-700"
                                            }`}
                                        >
                                            {item.size}
                                            {isSoldOut ? " / sold out" : ""}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-6">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                    Quantity
                                </h2>
                                <div className="mt-3 flex items-center rounded-full border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                        className="px-4 py-2 text-lg"
                                    >
                                        -
                                    </button>
                                    <span className="min-w-[42px] text-center text-sm font-medium">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((current) => Math.min(Math.max(1, maxQty), current + 1))
                                        }
                                        className="px-4 py-2 text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6">
                                <p className="text-sm text-slate-500">
                                    {selectedDetail?.qty || 0} pieces available in this variation
                                </p>
                                <p
                                    className={`mt-1 text-sm font-medium capitalize ${
                                        maxQty > 0 ? "text-emerald-600" : "text-rose-600"
                                    }`}
                                >
                                    {maxQty > 0 ? selectedDetail?.productstatus : "Sold out"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Button
                                className="h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white"
                                onClick={() => handleAddToCart(false)}
                                isDisabled={maxQty < 1}
                            >
                                Add to Cart
                            </Button>
                            <Button
                                className="h-12 rounded-full border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-900"
                                onClick={() => handleAddToCart(true)}
                                isDisabled={maxQty < 1}
                            >
                                Buy Now
                            </Button>
                            <Link
                                href={URL.Explore}
                                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-8 text-sm font-semibold text-slate-700"
                            >
                                Back to Explore
                            </Link>
                        </div>

                        {feedbackMessage ? (
                            <p className="mt-4 text-sm font-medium text-emerald-600">{feedbackMessage}</p>
                        ) : null}
                    </section>
                </div>

                    <ProductReviewSection
                        productName={product.productname}
                        productID={Number(params.productid)}
                        initialStats={productReviewStats}
                        fallbackAverage={Number(product.rating || 0)}
                    />
            </div>

            {recommendedProducts.length > 0 ? (
                <LatestItem
                    data={recommendedProducts}
                    setCart={setCart}
                    title="You May Also Like"
                />
            ) : null}
        </div>
    );
}
