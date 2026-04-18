"use client";

import Link from "next/link";
import clsx from "clsx";

type HeroAction = {
    href: string;
    label: string;
    variant?: "primary" | "secondary";
};

type HeroStat = {
    label: string;
    value: string;
};

type PageHeroProps = {
    eyebrow: string;
    title: string;
    description: string;
    actions?: HeroAction[];
    stats?: HeroStat[];
    className?: string;
};

export default function PageHero({
    eyebrow,
    title,
    description,
    actions = [],
    stats = [],
    className,
}: PageHeroProps) {
    return (
        <section
            className={clsx(
                "rounded-[34px] border border-[#efe6dc] bg-[#faf8f5] px-5 py-6 shadow-[0_20px_48px_rgba(15,23,42,0.04)] sm:px-6 sm:py-8 lg:px-8",
                className,
            )}
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {eyebrow}
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.8rem]">
                        {title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                        {description}
                    </p>

                    {actions.length > 0 ? (
                        <div className="mt-6 flex flex-wrap gap-3">
                            {actions.map((action) => (
                                <Link
                                    key={`${action.href}-${action.label}`}
                                    href={action.href}
                                    className={clsx(
                                        "inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-semibold transition",
                                        action.variant === "secondary"
                                            ? "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                                            : "bg-slate-900 text-white hover:bg-slate-800",
                                    )}
                                >
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>

                {stats.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px] lg:max-w-[360px] lg:grid-cols-1">
                        {stats.map((stat) => (
                            <div
                                key={`${stat.label}-${stat.value}`}
                                className="rounded-[24px] border border-[#ece5dc] bg-white px-5 py-4"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                    {stat.label}
                                </p>
                                <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
