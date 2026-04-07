// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

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

export default function LatestItem({ data, setCart,title }: ILatestItemProps) {
  return (
    <div className="mt-12 mb-24 flex flex-col laptop-3xl:px-28 laptop-2xl:px-16 laptop-xl:px-12">
      <label className="text-xl font-semibold uppercase tracking-wider laptop-3xl:text-3xl laptop-2xl:text-2xl laptop-xl:text-xl">{title}</label>
      <div className="flex justify-between w-full mt-4 laptop-2xl:mt-8 laptop-xl:mt-6">
        {data.map((item: any, index: number) => {
          return (
            <div className="flex flex-col" key={index}>
              <div className="rounded-xl relative overflow-hidden laptop-3xl:w-[220px] laptop-3xl:h-[270px] laptop-2xl:w-[200px] laptop-2xl:h-[250px] laptop-xl:w-[170px] laptop-xl:h-[220px]">
                <Image src={item.url[0]} fill={true} quality={70} loading="eager" alt={item.productname} />
              </div>
              <Link href={`${URL.Man}?id=${item.productid}`} className="mt-2 h-12 overflow-hidden w-fit font-medium laptop-3xl:max-w-[220px] laptop-3xl:text-[18px] laptop-3xl:h-20 laptop-2xl:max-w-[200px] laptop-2xl:text-[16px] laptop-xl:w-[170px] laptop-xl:text-[14px] laptop-xl:h-16">
                {item.productname}
              </Link>
              <label className="text-small mt-2 laptop-3xl:text-medium laptop-xl:text-[13px]">${formatMoney(item.unitprice)}</label>
              <Button
                className="mt-4 bg-transparent border-1 border-slate-800 dark:border-slate-200 laptop-3xl:text-medium"
                onClick={() => {
                  setCart((prevCart) => {
                    const index = prevCart.findIndex((p: any) => p.productdetailid === item.productdetailid);
                    let tempCart = [...prevCart];
                    if (index === -1) {
                      tempCart.push({ productdetailid: item.detail[0].productdetailid, qty: 1 });
                    }
                    tempCart = removeDuplicateCartData(tempCart).cart;
                    localStorage.setItem("cart", JSON.stringify(tempCart));
                    alert(`${item.productname} is added to cart!`);
                    return tempCart;
                  });
                }}
              >
                Add to Cart
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
