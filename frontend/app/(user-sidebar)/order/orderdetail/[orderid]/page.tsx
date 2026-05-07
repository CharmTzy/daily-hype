"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import { IGetOrderDetailOrder, IGetOrderDetailOrderDetail } from "@/enums/admin-order-interfaces";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { capitaliseWord, formatDateByMonthDayYear, formatMoney } from "@/functions/formatter";
import { getOrderDetail } from "@/functions/order-functions";

const statusColors: Record<string, string> = {
    "in progress": "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-violet-50 text-violet-700 border-violet-200",
    received: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    refunded: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function OrderDetailPage({ params }: { params: { orderid: string } }) {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();
    const orderid = Number(params.orderid);
    const [orderData, setOrderData] = useState<IGetOrderDetailOrder | null>(null);
    const [orderDetail, setOrderDetail] = useState<IGetOrderDetailOrderDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AllOrder);
    }, [setCurrentActivePage]);

    useEffect(() => {
        if (isNaN(orderid)) {
            setError("Invalid order ID.");
            setIsLoading(false);
            return;
        }

        getOrderDetail(orderid)
            .then((result) => {
                if (result.error || !result.order || !result.orderdetail) {
                    setError("We could not load this order. It may not exist or you may not have access.");
                    return;
                }
                setOrderData(result.order);
                setOrderDetail(result.orderdetail);
            })
            .catch(() => setError("Something went wrong loading this order."))
            .finally(() => setIsLoading(false));
    }, [orderid]);

    const subTotal = orderDetail.reduce((sum, item) => sum + item.qty * parseFloat(item.unitprice), 0);
    const badgeClass = orderData ? (statusColors[orderData.orderstatus] ?? "bg-slate-50 text-slate-600 border-slate-200") : "";

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="w-full pb-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || "Order not found."}</div>
                <button type="button" onClick={() => router.back()} className="mt-4 text-sm font-semibold text-slate-600 underline underline-offset-4">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pb-8">
            {/* Header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Order Detail</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Order #{orderid}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}>
                                {orderData.orderstatus}
                            </span>
                            <span className="text-sm text-slate-500">{formatDateByMonthDayYear(orderData.createdat)}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                        ← Back
                    </button>
                </div>
            </section>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                {/* Items */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Items · {orderDetail.length}
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {orderDetail.map((item) => (
                            <div key={item.productdetailid} className="flex items-start gap-4 px-6 py-5">
                                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                    <ResilientImage
                                        src={item.image}
                                        alt={item.productname}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`${URL.ProductDetail}${item.productid}`}
                                        className="text-base font-semibold text-slate-900 transition hover:text-[#d45540]"
                                    >
                                        {item.productname}
                                    </Link>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {capitaliseWord(item.colour)}, {item.size}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">Qty: {item.qty}</p>
                                </div>
                                <p className="flex-shrink-0 text-base font-semibold text-slate-900">
                                    ${formatMoney(item.unitprice)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary sidebar */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Order Summary</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-900">${formatMoney(subTotal.toString())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping fee</span>
                                <span className="font-medium text-slate-900">${formatMoney(orderData.shippingfee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GST ({orderData.gst}%)</span>
                                <span className="font-medium text-slate-900">
                                    ${formatMoney((subTotal * orderData.gst / 100).toFixed(2))}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-3">
                                <span className="text-base font-semibold text-slate-900">Total</span>
                                <span className="text-base font-semibold text-slate-900">${formatMoney(orderData.totalamount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery Info</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p><span className="font-medium text-slate-900">Address:</span> {orderData.deliveryaddress}</p>
                            <p><span className="font-medium text-slate-900">Payment:</span> {orderData.paymentmethod || "Card"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
