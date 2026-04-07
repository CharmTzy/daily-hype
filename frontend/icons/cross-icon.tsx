// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import clsx from "clsx";

export default function CrossIcon({ width, height, className, onClick, title }: { width?: number; height?: number; className?: string; onClick?: () => void; title?: string }) {
  const { theme } = useTheme();

  return <Image title={title || ""} width={width || 50} height={height || 50} className={clsx("", className)} src={theme === "dark" ? "/icons/x-dark.svg" : "/icons/x.svg"} onClick={onClick} alt="Cross Icon" />;
}
