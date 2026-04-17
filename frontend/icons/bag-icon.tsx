"use client";
import clsx from "clsx";
import Image from "next/image";
export default function BagIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} src="/icons/shopping-bag.svg" className={clsx("", className)} alt="Bag Icon"/>;
}
