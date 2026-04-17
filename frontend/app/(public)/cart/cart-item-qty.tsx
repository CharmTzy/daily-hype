"use client";

interface ICartItemQtyProps {
    qty: number;
    disabled: boolean;
    handleQtyChange: (newQty: number) => void;
}

export default function CartItemQty({ qty, disabled, handleQtyChange }: ICartItemQtyProps) {
    return (
        <div className="inline-flex items-center rounded-[16px] border border-[#e8e1d8] bg-white p-1 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
            <button
                className="flex h-9 w-9 items-center justify-center rounded-[12px] text-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={disabled}
                onClick={() => {
                    handleQtyChange(qty - 1);
                }}
                type="button"
            >
                -
            </button>
            <span className="w-10 text-center text-sm font-semibold text-slate-900">{qty}</span>
            <button
                className="flex h-9 w-9 items-center justify-center rounded-[12px] text-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={disabled}
                onClick={() => {
                    handleQtyChange(qty + 1);
                }}
                type="button"
            >
                +
            </button>
        </div>
    );
}
