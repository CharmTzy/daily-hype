// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import clsx from "clsx";

export default function TwitterIcon({ width, height, className }: { width?: number; height?: number; className?: string }) {
  const { theme } = useTheme();

  return <Image width={width || 50} height={height || 50} className={clsx("", className)} src={theme === "dark" ? "/icons/twitter-dark.svg" : "/icons/twitter.svg"} alt="Twitter Icon" title="Twitter" />;
}
