"use client";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

type ResilientImageProps = Omit<ImageProps, "src"> & {
    src?: ImageProps["src"] | null;
    fallbackSrc?: ImageProps["src"];
};

export default function ResilientImage({ src, fallbackSrc = "/images/image-not-found.jpg", onError, ...props }: ResilientImageProps) {
    const resolvedSrc = src || fallbackSrc;
    const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(resolvedSrc);

    useEffect(() => {
        setCurrentSrc(resolvedSrc);
    }, [resolvedSrc]);

    return (<Image
        {...props}
        src={currentSrc}
        onError={(event) => {
            if (currentSrc !== fallbackSrc) {
                setCurrentSrc(fallbackSrc);
            }
            onError?.(event);
        }}
    />);
}
