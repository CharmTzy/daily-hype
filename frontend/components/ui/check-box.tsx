"use client";
import clsx from "clsx";
import { useId } from "react";

export default function CheckBox({ checked, className, func, label, labelClassName, disabled }: {
    checked?: boolean;
    className?: string;
    func?: () => void;
    label: string;
    labelClassName?: string;
    disabled?: boolean;
}) {
    const inputId = useId();
    const isDisabled = disabled || false;
    return (<div className="flex items-center">
      <input id={inputId} type="checkbox" className={clsx("cursor-pointer disabled:cursor-not-allowed", className)} checked={checked || false} onChange={() => {
            if (func && !isDisabled) {
                func();
            }
        }} disabled={isDisabled}/>
      {label ? <label htmlFor={inputId} className={clsx("ms-2", labelClassName)}>{label}</label> : null}
    </div>);
}
