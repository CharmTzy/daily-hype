"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableHead } from "@mui/material";
import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import CustomPagination from "@/components/ui/pagination";

interface ITableProps {
    columns?: string[];
    rows: [string, ...React.ReactNode[]][];
    totalCount?: number;
    rowsPerPage?: number;
    setRowsPerPage?: React.Dispatch<React.SetStateAction<number>>;
    page?: number;
    setPage?: React.Dispatch<React.SetStateAction<number>>;
    onClick?: (clickedValue: string) => void;
    onDoubleClick?: (clickedValue: string) => void;
}

const rowsPerPageOptions = ["5", "10", "15"];

export default function CustomTable({
    rowsPerPage,
    columns,
    rows,
    totalCount,
    setRowsPerPage,
    page,
    setPage,
    onClick,
    onDoubleClick,
}: ITableProps) {
    const [localPage, setLocalPage] = useState(page ?? 0);
    const [localRowsPerPage, setLocalRowsPerPage] = useState(rowsPerPage ?? 10);

    useEffect(() => {
        setLocalPage(page ?? 0);
    }, [page]);

    useEffect(() => {
        setLocalRowsPerPage(rowsPerPage ?? 10);
    }, [rowsPerPage]);

    const resolvedTotalCount = useMemo(() => {
        if (typeof totalCount === "string") {
            const parsedCount = parseInt(totalCount, 10);
            return Number.isNaN(parsedCount) ? 0 : parsedCount;
        }

        return totalCount ?? rows.length;
    }, [rows.length, totalCount]);

    const totalPages = Math.max(1, Math.ceil(Math.max(resolvedTotalCount, 0) / localRowsPerPage));

    useEffect(() => {
        const maxPage = Math.max(0, totalPages - 1);

        if (localPage > maxPage) {
            setLocalPage(maxPage);

            if (setPage) {
                setPage(maxPage);
            }
        }
    }, [localPage, setPage, totalPages]);

    const visibleRows = useMemo(() => {
        if (setPage) {
            return rows.slice(0, localRowsPerPage);
        }

        const startIndex = localPage * localRowsPerPage;
        return rows.slice(startIndex, startIndex + localRowsPerPage);
    }, [localPage, localRowsPerPage, rows, setPage]);

    const handlePaginationChange = (nextPage: number) => {
        const nextPageIndex = nextPage - 1;
        setLocalPage(nextPageIndex);

        if (setPage) {
            setPage(nextPageIndex);
        }
    };

    const handleRowsPerPageChange = (value: string) => {
        const nextRowsPerPage = parseInt(value, 10);

        if (Number.isNaN(nextRowsPerPage)) {
            return;
        }

        setLocalRowsPerPage(nextRowsPerPage);
        setLocalPage(0);

        if (setRowsPerPage) {
            setRowsPerPage(nextRowsPerPage);
        }

        if (setPage) {
            setPage(0);
        }
    };

    const showingFrom = resolvedTotalCount === 0 ? 0 : localPage * localRowsPerPage + 1;
    const showingTo = resolvedTotalCount === 0 ? 0 : Math.min(resolvedTotalCount, (localPage + 1) * localRowsPerPage);

    return (
        <TableContainer className="mb-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm" component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                {columns && columns.length > 0 ? (
                    <TableHead>
                        <TableRow>
                            {columns.map((item, index) => (
                                <TableCell key={index} style={{ fontWeight: "bold", textAlign: "center" }}>
                                    {item}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                ) : null}

                <TableBody>
                    {visibleRows.map((row, index) => (
                        <TableRow
                            onClick={() => {
                                if (onClick) {
                                    onClick(row[0]);
                                }
                            }}
                            onDoubleClick={() => {
                                if (onDoubleClick) {
                                    onDoubleClick(row[0]);
                                }
                            }}
                            className="cursor-pointer hover:bg-slate-100"
                            key={index}
                        >
                            {row.map((item, cellIndex) => (
                                <TableCell style={{ textAlign: "center" }} key={cellIndex}>
                                    {item}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {visibleRows.length <= 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns ? columns.length : 6}
                                style={{ textAlign: "center" }}
                                className="cursor-pointer hover:bg-slate-100"
                            >
                                No Data Available
                            </TableCell>
                        </TableRow>
                    ) : null}
                </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Rows per page</span>
                    <Select
                        aria-label="Rows per page"
                        className="w-[140px]"
                        selectedKeys={[String(localRowsPerPage)]}
                        size="sm"
                        variant="bordered"
                        disallowEmptySelection
                        onChange={(event) => {
                            handleRowsPerPageChange(event.target.value);
                        }}
                    >
                        {rowsPerPageOptions.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                    <p className="text-sm text-slate-500">
                        Showing {showingFrom}-{showingTo} of {resolvedTotalCount}
                    </p>
                    <CustomPagination
                        currentPage={localPage + 1}
                        total={totalPages}
                        onChange={handlePaginationChange}
                    />
                </div>
            </div>
        </TableContainer>
    );
}
