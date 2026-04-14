"use client";
import { URL } from "@/enums/global-enums";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import Image from "next/image";
import Link from "next/link";

type CarouselItemProps = {
    data: any[];
    currentActiveNo: number;
};

export default function CarouselItem({ data, currentActiveNo }: CarouselItemProps) {
    const currentItem = data && data.length > currentActiveNo ? data[currentActiveNo] : null;

    if (!currentItem) {
        return null;
    }

    const type = capitaliseWord(currentItem.typename);
    const category = capitaliseWord(currentItem.categoryname);
    const price = formatMoney(currentItem.unitprice);
    const productName = currentItem.productname;
    const description = currentItem.description;
    const url = currentItem.url?.[0] || "";
    const colours = currentItem.detail
        .map((detail: any) => ({
            colourid: detail.colourid,
            colour: capitaliseWord(detail.colour),
            hex: detail.hex,
        }))
        .filter(
            (item: { colourid: number }, index: number, arr: { colourid: number }[]) =>
                arr.findIndex((colour) => colour.colourid === item.colourid) === index,
        );
    const sizes = currentItem.detail
        .map((detail: any) => detail.size.toUpperCase())
        .filter((size: string, index: number, arr: string[]) => arr.indexOf(size) === index);

    return (
        <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
            <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_0.9fr]">
                <div className="order-2 flex flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 lg:order-1 lg:px-10 lg:py-12">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {type}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {category}
                        </span>
                    </div>

                    <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-[2.8rem]">
                        {productName}
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                        {description}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Colours</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {colours.map((item: { colourid: number; colour: string; hex: string }) => (
                                    <span
                                        key={item.colourid}
                                        title={item.colour}
                                        className="h-6 w-6 rounded-full border border-black/10"
                                        style={{ backgroundColor: `#${item.hex}` }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sizes</p>
                            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                {sizes.join(", ")}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">From</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">${price}</p>
                        </div>
                        <Link
                            href={`${URL.ProductDetail}${currentItem.productid}`}
                            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-7 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                        >
                            Shop this look
                        </Link>
                    </div>
                </div>

                <div className="order-1 border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 lg:order-2 lg:border-b-0 lg:border-l">
                    <div className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-[560px]">
                        {url ? (
                            <Image
                                priority
                                fetchPriority="high"
                                className="object-cover"
                                fill
                                src={url}
                                alt={productName}
                                sizes="(max-width: 1024px) 100vw, 42vw"
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
