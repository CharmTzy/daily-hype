// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

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
        <div className="flex flex-col" key={i}>
          <Skeleton className="w-[180px] h-[230px] rounded-xl"></Skeleton>
          <Skeleton className="w-[180px] h-12 rounded-lg mt-1"></Skeleton>
          <Skeleton className="mt-1 w-16 h-5"></Skeleton>
          <Skeleton className="mt-3 w-full h-10 rounded-lg"></Skeleton>
        </div>
      );
    }
    return items;
  };

  return (
    <div className="my-12 px-16 flex flex-col">
      <label className="text-xl font-semibold uppercase tracking-wider">{title}</label>
      <div className="flex w-full justify-between mt-4">{render()}</div>
    </div>
  );
}
