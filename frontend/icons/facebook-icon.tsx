"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import clsx from "clsx";
export default function FaceBookIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    const { theme } = useTheme();
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src={theme === "dark" ? "/icons/facebook-dark.svg" : "/icons/facebook.svg"} alt="Facebook Icon" title="Facebook"/>;
}

