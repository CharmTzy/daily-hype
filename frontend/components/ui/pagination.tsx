// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// referenced from https://nextui.org/docs/components/pagination

"use client";

import { Pagination, PaginationItemType, PaginationItemRenderProps } from "@nextui-org/react";
import { clsx } from "clsx";

export default function CustomPagination({ total, currentPage, className, onChange, labelClassName }: { total: number; currentPage: number; className?: string; onChange?: (current: number) => void; labelClassName?: string }) {
  const renderItem = ({ ref, key, value, isActive, onNext, onPrevious, setPage, className }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button key={key} className={clsx(className, "bg-default-200/50 min-w-8 w-8 h-8")} onClick={onNext}>
          &gt;
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button key={key} className={clsx(className, "bg-default-200/50 min-w-8 w-8 h-8")} onClick={onPrevious}>
          &lt;
        </button>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <button key={key} className={className}>
          ...
        </button>
      );
    }

    // cursor is the default item
    return (
      <button ref={ref} key={key} className={clsx(className, isActive && "text-white bg-gradient-to-r from-custom-color1 to-custom-color2 font-bold")} onClick={() => setPage(value)}>
        {value}
      </button>
    );
  };

  return (
    <div className="flex w-full max-w-full justify-end">
      <label className={clsx("mt-2 mr-5 text-slate-600 dark:text-slate-400", labelClassName)}>Total {total} pages</label>
      <Pagination
        disableCursorAnimation
        showControls
        total={total}
        page={currentPage}
        className={clsx("gap-2", `${className} gap-2`)}
        onChange={(current) => {
          onChange && onChange(current);
        }}
        radius="full"
        renderItem={renderItem}
        variant="light"
      />
    </div>
  );
}
