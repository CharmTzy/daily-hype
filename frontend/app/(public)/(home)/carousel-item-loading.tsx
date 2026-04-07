"use client";

import { Skeleton } from "@nextui-org/react";

export default function CarouselItemSkeleton() {
  return (
    <div className="flex w-full h-88 justify-center items-center my-8 px-16">
      <div className="flex flex-col self-start mr-64">
        <Skeleton className="mt-4 w-[400px] h-16"></Skeleton>
        <div className="flex mt-6">
          <div className="flex flex-col w-[150px] mr-6">
            <Skeleton className="w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
          </div>
          <div className="flex w-full flex-col">
            <Skeleton className="w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
            <Skeleton className="mt-3 w-full h-[15px]"></Skeleton>
          </div>
        </div>
        <Skeleton className="mt-6 w-[450px] h-16"></Skeleton>
      </div>
      <div className="flex justify-center">
        <Skeleton className="w-[200px] h-[250px] rounded-xl"></Skeleton>
      </div>
    </div>
  );
}
