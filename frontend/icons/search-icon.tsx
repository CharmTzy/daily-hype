// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import clsx from "clsx";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function SearchIcon({ width, height, className }: { width?: number; height?: number; className?: string }) {
  const { theme } = useTheme();

  return <Image width={width || 50} height={height || 50} src={theme === "dark" ? "/icons/search-dark.svg" : "/icons/search.svg"} className={clsx("", className)} alt="Search Icon" />;
}
