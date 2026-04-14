import clsx from "clsx";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "700"],
});

type BrandLogoProps = {
    className?: string;
    size?: "sm" | "md" | "lg";
    theme?: "adaptive" | "dark" | "light";
    tagline?: string;
};

const sizeStyles = {
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

const themeStyles = {
    adaptive: {
        tagline: "text-slate-500 dark:text-slate-300",
        image: "/images/logo.png",
    },
    dark: {
        tagline: "text-slate-500",
        image: "/images/logo.png",
    },
    light: {
        tagline: "text-white/80",
        image: "/images/logo-light.png",
    },
};

export default function BrandLogo({
    className,
    size = "md",
    theme = "adaptive",
    tagline,
}: BrandLogoProps) {
    const selectedSize = sizeStyles[size];
    const selectedTheme = themeStyles[theme];

    return (
        <span className={clsx("inline-flex flex-col leading-none", selectedSize.gap, className)}>
            <Image
                src={selectedTheme.image}
                alt="DailyHype logo"
                width={selectedSize.width}
                height={Math.round((selectedSize.width * 180) / 411)}
                priority
                className="h-auto w-auto max-w-full"
            />
            {tagline ? (
                <span
                    className={clsx(
                        spaceGrotesk.className,
                        selectedTheme.tagline,
                        selectedSize.tagline,
                    )}
                >
                    {tagline}
                </span>
            ) : null}
        </span>
    );
}
