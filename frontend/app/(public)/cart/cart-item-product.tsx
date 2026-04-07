// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { URL } from "@/enums/global-enums";
import { showRemainingItem } from "@/functions/cart-utils";
import Image from "next/image";
import Link from "next/link";

interface ICartItemProductProps {
  productname: string;
  qty: number;
  url: string;
}

export default function CartItemProduct({ productname, qty, url }: ICartItemProductProps) {
  return (
    <>
      <div className="laptop-2xl:w-[90px] laptop-2xl:h-[100px] laptop-xl:w-[70px] laptop-xl:h-[80px] overflow-hidden rounded-xl relative">
        <Image src={url} quality={70} width={90} height={100} loading="eager" alt={productname} />
      </div>
      <div className="flex flex-col mb-auto ms-6 laptop-2xl:w-[400px] laptop-xl:w-[300px] mt-2">
        <Link className="laptop-2xl:text-[16px] laptop-xl:text-[14px] laptop-l:text-[13px] w-fit" href={`${URL.Man}?id=`}>
          {productname}
        </Link>
        <label className="mt-4 laptop-2xl:text-[15px] laptop-xl:text-[13px] text-red-700 dark:text-red-300">{showRemainingItem(qty)}</label>
      </div>
    </>
  );
}
