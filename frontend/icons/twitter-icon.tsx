"use client";
import Image from "next/image";
import clsx from "clsx";
export default function TwitterIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src="/icons/twitter.svg" alt="Twitter Icon" title="Twitter"/>;
}
