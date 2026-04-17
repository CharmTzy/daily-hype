"use client";
import { Skeleton } from "@nextui-org/react";

export default function CarouselItemSkeleton() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
            <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white lg:grid-cols-[1fr_0.9fr]">
                <div className="order-2 flex flex-col gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:order-1 lg:px-10 lg:py-12">
                    <Skeleton className="h-6 w-40 rounded-full" />
                    <Skeleton className="h-12 w-full max-w-[420px] rounded-2xl" />
                    <Skeleton className="h-24 w-full max-w-[520px] rounded-3xl" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-24 rounded-[1.5rem]" />
                        <Skeleton className="h-24 rounded-[1.5rem]" />
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Skeleton className="h-14 w-32 rounded-[1.5rem]" />
                        <Skeleton className="h-12 w-40 rounded-full" />
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <Skeleton className="min-h-[300px] rounded-none sm:min-h-[380px] lg:min-h-[560px]" />
                </div>
            </div>
        </div>
    );
}
