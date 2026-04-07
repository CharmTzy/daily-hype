"use client";

import { Skeleton } from "@nextui-org/react";

export default function CartItemSkeleton() {
  return (
    <div className="flex w-full max-w-full items-center mt-3">
      <Skeleton className="w-5 h-5 rounded-lg mr-6"></Skeleton>
      <Skeleton className="rounded-lg w-20 h-24 mr-6"></Skeleton>
      <Skeleton className="rounded-lg w-[400px] h-7 self-start"></Skeleton>
      <Skeleton className="rounded-lg w-[140px] h-12 ms-4"></Skeleton>
      <Skeleton className="rounded-lg w-[140px] h-12 ms-4"></Skeleton>
      <Skeleton className="rounded-lg w-[100px] h-12 ms-4"></Skeleton>
    </div>
  );
}
