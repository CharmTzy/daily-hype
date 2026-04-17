"use client";
import clsx from "clsx";
import Image from "next/image";
export default function SearchIcon({ width, height, className }: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return <Image width={width || 50} height={height || 50} src="/icons/search.svg" className={clsx("", className)} alt="Search Icon"/>;
}
