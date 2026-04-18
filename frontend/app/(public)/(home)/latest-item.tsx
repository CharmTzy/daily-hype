"use client";
import { URL } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { ILatestProductsByLimitData } from "@/enums/product-interfaces";
import { removeDuplicateCartData } from "@/functions/cart-functions";
import { formatMoney } from "@/functions/formatter";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";

interface ILatestItemProps {
    data: ILatestProductsByLimitData[];
    setCart: React.Dispatch<React.SetStateAction<ICartLocalStorage[]>>;
    title: string;
}

export default function LatestItem({ data, setCart, title }: ILatestItemProps) {
    return (
        <section className="mx-auto mb-14 mt-12 w-full max-w-7xl px-4 sm:px-6 lg:mb-20 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">DailyHype Edit</p>
                    <label className="mt-2 block text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        {title}
                    </label>
                </div>
                <Link href={URL.Explore} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                    Explore all
                </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {data.map((item, index) => (
                    <article
                        className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                        key={index}
                    >
                        <Link href={`${URL.ProductDetail}${item.productid}`} className="relative block aspect-[4/5] overflow-hidden bg-slate-100">
                            <Image
                                src={item.url[0]}
                                fill
                                quality={70}
                                loading="eager"
                                alt={item.productname}
                                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw"
                                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                        </Link>

                        <div className="flex flex-1 flex-col p-4">
                            <Link
                                href={`${URL.ProductDetail}${item.productid}`}
                                className="line-clamp-2 min-h-[48px] text-sm font-semibold text-slate-900 transition hover:text-slate-600"
                            >
                                {item.productname}
                            </Link>
                            <label className="mt-2 text-base font-semibold text-slate-900">
                                ${formatMoney(item.unitprice)}
                            </label>
                            <Button
                                className="mt-4 h-11 rounded-full border border-slate-300 bg-transparent text-sm font-semibold text-slate-800"
                                onClick={() => {
                                    const preferredDetail = item.detail.find((detail) => detail.qty > 0) || item.detail[0];
                                    if (!preferredDetail) {
                                        return;
                                    }

                                    setCart((prevCart) => {
                                        let tempCart = [...prevCart];
                                        if (!tempCart.find((product) => product.productdetailid === preferredDetail.productdetailid)) {
                                            tempCart.push({ productdetailid: preferredDetail.productdetailid, qty: 1 });
                                        }
                                        tempCart = removeDuplicateCartData(tempCart).cart;
                                        localStorage.setItem("cart", JSON.stringify(tempCart));
                                        return tempCart;
                                    });
                                }}
                            >
                                Add to Cart
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
