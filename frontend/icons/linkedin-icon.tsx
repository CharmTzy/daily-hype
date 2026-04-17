"use client";
import Image from "next/image";
import clsx from "clsx";
export default function LinkedInIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src="/icons/linkedin.svg" alt="Linkedin Icon" title="Linkedin"/>;
}
