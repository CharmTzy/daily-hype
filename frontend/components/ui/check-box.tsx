// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import clsx from "clsx";
import { useState } from "react";

export default function CheckBox({ checked, className, func, label, labelClassName, disabled }: { checked?: boolean; className?: string; func?: () => void; label: string; labelClassName?: string; disabled?: boolean }) {
  disabled = disabled || false;
  return (
    <div className="flex justify-center items-center">
      <input id={label}
        type={"checkbox"}
        className={clsx("disabled:cursor-not-allowed cursor-pointer", className)}
        checked={checked || false}
        onChange={() => {
          if (func && disabled === false) func();
        }}
        disabled={disabled}
      />
      <label htmlFor={label} className={clsx("ms-2", labelClassName)}>{label}</label>
    </div>
  );
}
