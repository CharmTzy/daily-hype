// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { URL } from "@/enums/global-enums";
import BagIcon from "@/icons/bag-icon";
import Link from "next/link";

export default function CartLink({ noOfItem }: { noOfItem: number }) {
  return (
    <Link href={URL.Cart} className="relative px-2 py-1 cursor-pointer" title="Shopping Bag">
      <BagIcon className="laptop-3xl:w-7 laptop-3xl:h-7" width={22} height={22} />
      <span className="absolute z-10 -bottom-1 flex justify-center items-center rounded-full border-1 border-black w-5 h-5 text-[12px] right-0 bg-black font-medium dark:bg-white dark:text-black text-white laptop-3xl:w-6 laptop-3xl:h-6 laptop-3xl:text-[13px] laptop-3xl:-bottom-[6px] laptop-3xl:-right-[2px]">{noOfItem}</span>
    </Link>
  );
}
