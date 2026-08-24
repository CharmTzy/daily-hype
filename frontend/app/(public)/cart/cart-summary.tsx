"use client";
import Link from "next/link";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { URL } from "@/enums/global-enums";
import { formatMoney } from "@/functions/formatter";

interface ICartSummaryProps {
    toShow: boolean;
    subTotal: number;
    disabled: boolean;
    isAuthenticated: boolean;
    itemCount: number;
    selectedCount: number;
}

export default function CartSummary({
    toShow,
    subTotal,
    disabled,
    isAuthenticated,
    itemCount,
    selectedCount,
}: ICartSummaryProps) {
    const router = useRouter();

    if (!toShow) {
        return null;
    }

    return (
        <div className="sticky bottom-4 z-10">
            <div className="rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Checkout Summary</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span>{itemCount} item{itemCount === 1 ? "" : "s"} in bag</span>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                            <span>{selectedCount} selected</span>
                            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                            <span>Shipping and GST calculated at checkout</span>
                        </div>
                        <Link href={URL.Explore} className="text-sm font-semibold text-[#d45540] transition hover:text-[#b84335]">
                            Continue Shopping
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                        <div className="text-left sm:text-right">
                            <p className="text-sm text-slate-500">Subtotal ({selectedCount} selected)</p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">${formatMoney(subTotal.toString())}</p>
                        </div>
                        <Button
                            className="h-12 rounded-[18px] bg-[#fb6050] px-8 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white"
                            disabled={disabled}
                            onClick={() => {
                                if (isAuthenticated) {
                                    router.push(URL.CheckOut);
                                }
                                else {
                                    router.push(`${URL.SignIn}?redirect=cart`);
                                }
                            }}
                        >
                            {isAuthenticated ? "Check Out" : "Sign In"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
