// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { formatMoney } from "@/functions/formatter";
import CrossIcon from "@/icons/cross-icon";

interface ICartItemQtyProps {
  qty: number;
  price: string;
  disabled: boolean;
  handleQtyChange: (newQty: number) => void;
  handleDelete: () => void;
}

export default function CartItemQty({ qty, price, disabled, handleQtyChange, handleDelete }: ICartItemQtyProps) {
  return (
    <>
      <button
        className="ms-8 laptop-2xl:ms-12 text-[22px] -mt-[2px] mr-2"
        disabled={disabled}
        onClick={() => {
          handleQtyChange(qty + 1);
        }}
      >
        +
      </button>
      <label className="ms-2 w-[25px] text-center mr-2">{qty}</label>
      <button
        className="ms-2 text-[22px] -mt-[2px]"
        disabled={disabled}
        onClick={() => {
          handleQtyChange(qty - 1);
        }}
      >
        -
      </button>
      <label className="ms-auto laptop-2xl:text-[16px] laptop-xl:text-[14px] font-medium tracking-wide">${formatMoney(price)}</label>
      <CrossIcon width={25} title="Remove Item" height={25} onClick={handleDelete} className="cursor-pointer ms-8 mr-16" />
    </>
  );
}
