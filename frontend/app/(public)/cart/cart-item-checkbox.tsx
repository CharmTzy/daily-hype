"use client";
import CheckBox from "@/components/ui/check-box";
interface ICartItemCheckBoxProps {
    checked: boolean;
    setChecked: React.Dispatch<React.SetStateAction<boolean>>;
    disabled: boolean;
}
export default function CartItemCheckbox({ checked, setChecked, disabled }: ICartItemCheckBoxProps) {
    return (<CheckBox checked={checked} label="" func={() => {
            setChecked((prev) => !prev);
        }} className="mr-4 w-4 h-4" disabled={disabled}/>);
}

