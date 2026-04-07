// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import clsx from "clsx";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemeIcon({ width, height, className }: { width: number; height: number; className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Image
      src={theme === "dark" ? "/icons/sun.svg" : "/icons/moon.svg"}
      width={width || 50}
      height={height || 50}
      alt="Theme Icon"
      onClick={() => {
        if (theme === "dark") {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      }}
      className={clsx("", className)}
    />
  );
}
