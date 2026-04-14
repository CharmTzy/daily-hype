"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import clsx from "clsx";
export default function LoadingIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    const { theme } = useTheme();
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src={theme === "dark" ? "/icons/loader-dark.svg" : "/icons/loader.svg"} alt="Loading Icon"/>;
}

