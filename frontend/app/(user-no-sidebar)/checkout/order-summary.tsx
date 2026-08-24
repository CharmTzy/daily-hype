import ResilientImage from "@/components/ui/resilient-image";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import { ICheckOutTotals } from "@/enums/order-interfaces";
import { ICheckOutProductDetail } from "@/enums/product-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";

interface IProductSummaryProps {
    productData: ICheckOutProductDetail[];
    cartData: ICheckOutCart[];
    totals: ICheckOutTotals;
}

export default function OrderSummary({ productData, cartData, totals }: IProductSummaryProps) {
    return (
        <div className="mt-6">
            <div className="space-y-4">
                {cartData.map((cartItem, index) => (
                    <div key={`${cartItem.productdetailid}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <ResilientImage
                                src={productData[index]?.image}
                                alt={productData[index]?.productname || "Product image"}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <p className="text-base font-semibold text-slate-900">{productData[index]?.productname}</p>
                            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                                    Colour: {capitaliseWord(productData[index]?.colour || "")}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                                    Size: {capitaliseWord(productData[index]?.size || "")}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                                    Qty: {cartItem.qty}
                                </span>
                            </div>
                            <div className="mt-auto flex items-center justify-between text-sm">
                                <span className="text-slate-500">Unit price</span>
                                <span className="font-semibold text-slate-900">${formatMoney(productData[index]?.unitprice || "0")}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {cartData.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-900">${formatMoney(totals.subtotal.toString())}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Shipping fee</span>
                            <span className="font-medium text-slate-900">${formatMoney(totals.shippingFee.toString())}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span>GST (9%)</span>
                            <span className="font-medium text-slate-900">${formatMoney(totals.gstAmount.toString())}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-base font-semibold text-slate-900">Total</span>
                            <span className="text-xl font-semibold tracking-tight text-slate-900">${formatMoney(totals.total.toString())}</span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
