// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import CheckBox from "@/components/ui/check-box";

interface ICartItemCheckBoxProps {
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
}

export default function CartItemCheckbox({ checked, setChecked, disabled }: ICartItemCheckBoxProps) {
  return (
    <CheckBox
      checked={checked}
      label=""
      func={() => {
        setChecked((prev) => !prev);
      }}
      className="mr-4 w-4 h-4"
      disabled={disabled}
    />
  );
}
