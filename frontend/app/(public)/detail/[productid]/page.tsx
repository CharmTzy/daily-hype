"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Spinner } from "@nextui-org/react";
import { useAppState } from "@/app/app-provider";
import { URL } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { ProductDetail } from "@/enums/product-interfaces";
import { removeDuplicateCartData } from "@/functions/cart-functions";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { getProductAndDetail } from "@/functions/product-functions";

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

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { setCart } = useAppState();
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColour, setSelectedColour] = useState("");
    const [selectedProductDetailId, setSelectedProductDetailId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getProductAndDetail(params.productid)
            .then((result) => {
                if (!result.data || result.data.length === 0) {
                    setProductDetails([]);
                    return;
                }

                setProductDetails(result.data);
                setSelectedColour(result.data[0].colour);
                setSelectedProductDetailId(result.data[0].productdetailid);
                setSelectedImageIndex(0);
            })
            .catch((error) => {
                console.error(error);
                setProductDetails([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [params.productid]);

    const product = productDetails[0];
    const colourGroups = productDetails.reduce((groups, item) => {
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
    }, [] as ColourGroup[]);

    const activeColourGroup = colourGroups.find((group) => group.colour === selectedColour) || colourGroups[0];
    const selectedDetail = activeColourGroup?.items.find(
        (item) => item.productdetailid === selectedProductDetailId,
    ) || activeColourGroup?.items[0];
    const imageUrls = product?.urls || [];
    const maxQty = Math.max(0, Number(selectedDetail?.qty || 0));

    const handleAddToCart = () => {
        if (!selectedDetail) {
            setFeedbackMessage("Please choose a size before adding this item.");
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

        setFeedbackMessage(`${product.productname} added to cart.`);
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
                <Link href={URL.Explore} className="mt-6 rounded-full border border-slate-900 px-5 py-2 text-sm font-medium">
                    Continue shopping
                </Link>
            </div>
        );
    }

    return (
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
                                <Image
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
                            <Image
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
                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-2xl font-semibold text-slate-900">
                            ${formatMoney(product.unitprice)}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-600">
                            {Number(product.rating).toFixed(1)} star rating
                        </span>
                    </div>
                    <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
                        {product.description}
                    </p>

                    <div className="mt-8">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Colour
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {colourGroups.map((group) => (
                                <button
                                    key={group.colour}
                                    type="button"
                                    onClick={() => {
                                        setSelectedColour(group.colour);
                                        setSelectedProductDetailId(group.items[0].productdetailid);
                                        setQuantity(1);
                                    }}
                                    className={`flex items-center gap-3 rounded-full border px-4 py-2 ${
                                        selectedColour === group.colour
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
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Size
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {activeColourGroup?.items.map((item) => (
                                <button
                                    key={item.productdetailid}
                                    type="button"
                                    onClick={() => {
                                        setSelectedProductDetailId(item.productdetailid);
                                        setQuantity(1);
                                    }}
                                    className={`min-w-[64px] rounded-full border px-4 py-2 text-sm font-medium uppercase ${
                                        selectedDetail?.productdetailid === item.productdetailid
                                            ? "border-slate-900 bg-slate-900 text-white"
                                            : "border-slate-200 bg-white text-slate-700"
                                    }`}
                                >
                                    {item.size}
                                </button>
                            ))}
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
                                    onClick={() => setQuantity((current) => Math.min(Math.max(1, maxQty), current + 1))}
                                    className="px-4 py-2 text-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <p className="text-sm text-slate-500">{selectedDetail?.qty} pieces available</p>
                            <p className="mt-1 text-sm font-medium capitalize text-emerald-600">
                                {selectedDetail?.productstatus}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Button
                            className="h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white"
                            onClick={handleAddToCart}
                            isDisabled={maxQty < 1}
                        >
                            Add to Cart
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
        </div>
    );
}
