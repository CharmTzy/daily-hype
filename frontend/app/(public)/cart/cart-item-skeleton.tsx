"use client";
import { Skeleton } from "@nextui-org/react";

export default function CartItemSkeleton() {
    return (
        <div className="px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_140px_140px_140px_120px] lg:items-center lg:gap-4">
                <div className="flex items-start gap-4">
                    <div className="pt-2">
                        <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                        <Skeleton className="h-24 w-24 flex-shrink-0 rounded-[20px] sm:h-28 sm:w-28" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-5 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-64 rounded-lg" />
                            <div className="flex gap-2 pt-1">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <Skeleton className="hidden h-12 rounded-[18px] lg:block" />
                <Skeleton className="hidden h-12 rounded-[18px] lg:block" />
                <Skeleton className="hidden h-12 rounded-[18px] lg:block" />
                <Skeleton className="hidden h-10 w-20 rounded-full lg:block" />
            </div>
        </div>
    );
}
