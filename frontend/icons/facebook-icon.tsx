"use client";
import Image from "next/image";
import clsx from "clsx";
export default function FaceBookIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} className={clsx("", className)} src="/icons/facebook.svg" alt="Facebook Icon" title="Facebook"/>;
}
