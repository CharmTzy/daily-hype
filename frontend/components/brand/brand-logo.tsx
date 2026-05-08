import clsx from "clsx";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "700"],
});

type BrandLogoProps = {
    className?: string;
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "default" | "inverse";
    tagline?: string;
};

const sizeStyles = {
    xs: {
        width: 104,
        tagline: "text-[0.55rem]",
        gap: "gap-1",
    },
    sm: {
        width: 140,
        tagline: "text-[0.6rem]",
        gap: "gap-1.5",
    },
    md: {
        width: 180,
        tagline: "text-xs",
        gap: "gap-2",
    },
    lg: {
        width: 280,
        tagline: "text-sm",
        gap: "gap-3",
    },
};

const variantStyles = {
    default: {
        tagline: "text-slate-500",
        image: "/images/logo.png",
    },
    inverse: {
        tagline: "text-white/80",
        image: "/images/logo-light.png",
    },
};

export default function BrandLogo({
    className,
    size = "md",
    variant = "default",
    tagline,
}: BrandLogoProps) {
    const selectedSize = sizeStyles[size];
    const selectedVariant = variantStyles[variant];

    return (
        <span
            className={clsx("inline-flex flex-col leading-none", selectedSize.gap, className)}
            style={{ width: selectedSize.width }}
        >
            <Image
                src={selectedVariant.image}
                alt="DailyHype logo"
                width={selectedSize.width}
                height={Math.round((selectedSize.width * 187) / 394)}
                priority
                className="block h-auto w-full"
            />
            {tagline ? (
                <span
                    className={clsx(
                        spaceGrotesk.className,
                        selectedVariant.tagline,
                        selectedSize.tagline,
                    )}
                >
                    {tagline}
                </span>
            ) : null}
        </span>
    );
}
