"use client";
import { IProductDataFilter } from "@/enums/product-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { URL } from "@/enums/global-enums";

export default function ProductList({ data }: {
    data: IProductDataFilter[];
}) {
    const router = useRouter();

    const colourRender = (details: { hex: string; colourname: string }[]) => {
        const items: JSX.Element[] = [];
        const colours: string[] = [];
        details.forEach((item, index) => {
            if (!colours.includes(item.hex)) {
                items.push(
                    <div
                        key={index}
                        title={capitaliseWord(item.colourname)}
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: `#${item.hex}` }}
                    />,
                );
                colours.push(item.hex);
            }
        });
        return items;
    };

    return (
        <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
            {data.map((item, index) => (
                <Card
                    shadow="sm"
                    className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                    key={index}
                    isPressable
                    onPress={() => {
                        router.push(URL.ProductDetail + item.productid);
                    }}
                >
                    <CardBody className="overflow-visible p-0">
                        <div className="relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-900">
                            <Image
                                priority
                                fetchPriority="high"
                                loading="eager"
                                fill
                                alt={item.productname}
                                className="object-cover"
                                src={item.url[0]}
                                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            />
                        </div>
                    </CardBody>
                    <CardFooter className="flex flex-col gap-3 p-4 text-small">
                        <b className="line-clamp-2 min-h-[40px] self-start text-left text-[14px] text-slate-900 dark:text-white">
                            {item.productname}
                        </b>
                        <div className="flex w-full items-center self-start">
                            <p className="text-[12px] font-semibold capitalize text-slate-400 dark:text-slate-500">
                                {item.typename}
                            </p>
                            <p className="ms-auto text-[12px] font-semibold capitalize text-slate-400 dark:text-slate-500">
                                {item.categoryname}
                            </p>
                        </div>
                        <div className="flex w-full items-center self-start">
                            <div className="flex flex-wrap gap-1">{colourRender(item.detail)}</div>
                            <div className="ms-auto flex items-center">
                                <span className="mr-1 text-[18px] text-[gold]">&#9733;</span>
                                <p className="tracking-wide text-slate-600 dark:text-slate-300">
                                    {parseFloat(item.rating).toFixed(1)}
                                </p>
                            </div>
                        </div>
                        <p className="self-start font-semibold text-slate-700 dark:text-slate-200">
                            ${formatMoney(item.unitprice)}
                        </p>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
