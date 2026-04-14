"use client";
import { Skeleton } from "@nextui-org/react";

interface ILatestItemSkeletonProps {
    total: number;
    title: string;
}

export default function LatestItemSkeleton({ total, title }: ILatestItemSkeletonProps) {
    const render = () => {
        const items = [];
        for (let i = 0; i < total; i++) {
            items.push(
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" key={i}>
                    <Skeleton className="aspect-[4/5] w-full rounded-none" />
                    <div className="flex flex-col gap-3 p-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-5 w-20 rounded-lg" />
                        <Skeleton className="h-11 w-full rounded-full" />
                    </div>
                </div>,
            );
        }
        return items;
    };

    return (
        <section className="mx-auto my-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <label className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</label>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{render()}</div>
        </section>
    );
}
