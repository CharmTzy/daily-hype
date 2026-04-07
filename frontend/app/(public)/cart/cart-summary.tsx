// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { URL } from "@/enums/global-enums";
import { formatMoney } from "@/functions/formatter";
import { Button, Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ICartSummaryProps {
  toShow: boolean;
  subTotal: number;
  theme: string;
  disabled: boolean;
  isAuthenticated: boolean;
}

export default function CartSummary({ toShow, subTotal, theme, disabled, isAuthenticated }: ICartSummaryProps) {
  const router = useRouter();

  return (
    <>
      {toShow && (
        <>
          <div className="flex justify-end pe-16 items-center mt-4">
            <label className="ms-2 text-[14px] laptop-2xl:text-[18px] laptop-xl:text-[17px] font-semibold">Sub Total: ${formatMoney(subTotal.toString())}</label>
            <Tooltip content={<div className="text-[13px]">This does not include shipping fee.</div>}>
              <Image width={15} height={15} className="ms-2 cursor-pointer" src={theme === "dark" ? "/icons/info-dark.svg" : "/icons/info.svg"} alt="information Icon" />
            </Tooltip>
          </div>
          <Button
            color="secondary"
            className="laptop-2xl:w-[150px] laptop-2xl:h-12 laptop-2xl:text-[16px] disabled:opacity-50 rounded-md ms-auto mr-16 mt-4 disabled:cursor-not-allowed mb-4"
            disabled={disabled}
            onClick={() => {
              if (isAuthenticated) {
                router.push(URL.CheckOut);
              } else {
                router.push(`${URL.SignIn}?redirect=cart`);
              }
            }}
          >
            Check Out
          </Button>
        </>
      )}
    </>
  );
}
