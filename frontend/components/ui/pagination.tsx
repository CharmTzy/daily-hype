"use client";
import { Pagination } from "@nextui-org/react";
import { clsx } from "clsx";

export default function CustomPagination({
    total,
    currentPage,
    className,
    onChange,
    labelClassName,
    showTotalLabel = false,
}: {
    total: number;
    currentPage: number;
    className?: string;
    onChange?: (current: number) => void;
    labelClassName?: string;
    showTotalLabel?: boolean;
}) {
    if (total <= 1) {
        return null;
    }

    return (
        <div className={clsx("flex w-full max-w-full items-center justify-end gap-4", className)}>
            {showTotalLabel ? (
                <label className={clsx("text-sm text-slate-600", labelClassName)}>Total {total} pages</label>
            ) : null}
            <Pagination
                disableCursorAnimation
                showControls
                total={total}
                page={currentPage}
                color="primary"
                size="sm"
                radius="full"
                onChange={(current) => {
                    onChange && onChange(current);
                }}
            />
        </div>
    );
}

