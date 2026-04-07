// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import CheckBox from "@/components/ui/check-box";
import { ICartLocalStorage } from "@/enums/global-interfaces";

interface ISelectAllCheckBoxProps {
  toShow: boolean;
  checkAll: boolean;
  setCheckAll: React.Dispatch<React.SetStateAction<boolean>>;
  setCart: React.Dispatch<React.SetStateAction<ICartLocalStorage[]>>;
  disabled: boolean;
}

export default function SelectAllCheckBox({ toShow, checkAll, setCheckAll, setCart, disabled }: ISelectAllCheckBoxProps) {

  return (
    <div className="flex">
      {toShow && (
        <CheckBox
          checked={checkAll}
          className="w-4 h-4"
          func={() => {
            setCart((prev) => {
              let newArr = [...prev];
              newArr = newArr.map((n) => ({ ...n, checked: !checkAll }));
              localStorage.setItem("cart", JSON.stringify(newArr));
              return newArr;
            });
            setCheckAll((prev) => !prev);
          }}
          label="Select All"
          labelClassName="text-[15px]"
          disabled={disabled}
        />
      )}
    </div>
  );
}
