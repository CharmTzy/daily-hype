"use client";
import Image from "next/image";
import clsx from "clsx";
export default function InstagramIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src="/icons/instagram.svg" alt="Instagram Icon" title="Instagram"/>;
}
