"use client";

import { Star } from "lucide-react";

interface ReviewStarsProps {
    value: number;
    size?: number;
}

export default function ReviewStars({ value, size = 16 }: ReviewStarsProps) {
    const roundedValue = Math.round(value);

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => {
                const filled = index < roundedValue;

                return (
                    <Star
                        key={index}
                        size={size}
                        className={filled ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                );
            })}
        </div>
    );
}
