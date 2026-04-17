"use client";
import Image from "next/image";
import clsx from "clsx";
export default function CrossIcon({ width, height, className, onClick, title }: {
    width?: number;
    height?: number;
    className?: string;
    onClick?: () => void;
    title?: string;
}) {
    return <Image title={title || ""} width={width || 50} height={height || 50} className={clsx("", className)} src="/icons/x.svg" onClick={onClick} alt="Cross Icon"/>;
}
