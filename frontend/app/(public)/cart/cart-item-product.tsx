"use client";
import Link from "next/link";
import ResilientImage from "@/components/ui/resilient-image";
import { URL } from "@/enums/global-enums";
import { showRemainingItem } from "@/functions/cart-utils";

interface ICartItemProductProps {
    productid: number;
    productname: string;
    qty: number;
    url: string;
}

export default function CartItemProduct({ productid, productname, qty, url }: ICartItemProductProps) {
    const remainingText = showRemainingItem(qty);

    return (
        <div className="flex min-w-0 items-start gap-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-28 sm:w-28">
                <ResilientImage
                    src={url}
                    quality={70}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover"
                    loading="eager"
                    alt={productname}
                />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">DailyHype Pick</p>
                <Link
                    className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition hover:text-[#FB6050]"
                    href={`${URL.ProductDetail}${productid}`}
                >
                    {productname}
                </Link>
                <p className="mt-2 text-sm leading-6 text-slate-500">Curated for your bag and ready for variation updates before checkout.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {remainingText ? (
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">{remainingText}</span>
                    ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">In stock</span>
                    )}
                    <span className="inline-flex rounded-full bg-[#fff5f2] px-3 py-1 text-xs font-medium text-[#d45540]">Style saved</span>
                </div>
            </div>
        </div>
    );
}
