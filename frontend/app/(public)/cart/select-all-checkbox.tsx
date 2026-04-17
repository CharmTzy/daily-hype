"use client";
import CheckBox from "@/components/ui/check-box";
import { ICartLocalStorage } from "@/enums/global-interfaces";

interface ISelectAllCheckBoxProps {
    toShow: boolean;
    checkAll: boolean;
    setCheckAll: React.Dispatch<React.SetStateAction<boolean>>;
    setCart: React.Dispatch<React.SetStateAction<ICartLocalStorage[]>>;
    disabled: boolean;
    itemCount: number;
    selectedCount: number;
}

export default function SelectAllCheckBox({
    toShow,
    checkAll,
    setCheckAll,
    setCart,
    disabled,
    itemCount,
    selectedCount,
}: ISelectAllCheckBoxProps) {
    if (!toShow) {
        return null;
    }

    const handleToggle = () => {
        setCart((prev) => {
            const nextCart = prev.map((item) => ({ ...item, checked: !checkAll }));
            localStorage.setItem("cart", JSON.stringify(nextCart));
            return nextCart;
        });
        setCheckAll((prev) => !prev);
    };

    return (
        <div className="overflow-hidden rounded-[24px] border border-[#ece5dc] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.8fr)_140px_140px_140px_120px] lg:items-center lg:gap-4 lg:px-6 lg:py-4">
                <div className="flex items-center gap-3">
                    <CheckBox
                        checked={checkAll}
                        className="h-4 w-4 accent-[#fb6050]"
                        func={handleToggle}
                        label=""
                        disabled={disabled}
                    />
                    <span className="text-sm font-semibold text-slate-800">Product</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unit Price</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quantity</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Actions</span>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 lg:hidden">
                <CheckBox
                    checked={checkAll}
                    className="h-4 w-4 accent-[#fb6050]"
                    func={handleToggle}
                    label="Select all items"
                    labelClassName="text-sm font-semibold text-slate-800"
                    disabled={disabled}
                />
                <p className="text-sm text-slate-500">
                    {selectedCount} of {itemCount} item{itemCount === 1 ? "" : "s"} selected
                </p>
            </div>
        </div>
    );
}
