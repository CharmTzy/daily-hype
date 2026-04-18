"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { useAppState } from "@/app/app-provider";
import CheckBox from "@/components/ui/check-box";
import CustomPagination from "@/components/ui/pagination";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import {
    ICategory,
    IColour,
    IProductDataFilter,
    ISize,
    IType,
} from "@/enums/product-interfaces";
import { capitaliseWord } from "@/functions/formatter";
import {
    getCategories,
    getColours,
    getProductFilter,
    getProductFilterCount,
    getSizes,
    getTypes,
} from "@/functions/product-functions";
import ProductList from "./product-list";

const productsPerPage = 8;

export default function Page() {
    const { setCurrentActivePage } = useAppState();
    const [types, setTypes] = useState<IType[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [colours, setColours] = useState<IColour[]>([]);
    const [sizes, setSizes] = useState<ISize[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<boolean[]>([]);
    const [selectedColours, setSelectedColours] = useState<boolean[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<boolean[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<boolean[]>([]);
    const [products, setProducts] = useState<IProductDataFilter[]>([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalProduct, setTotalProduct] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Explore);

        Promise.all([getTypes(), getCategories(), getColours(), getSizes()]).then(
            ([typeResult, categoryResult, colourResult, sizeResult]) => {
                const typeData = typeResult.data || [];
                const categoryData = categoryResult.data || [];
                const colourData = colourResult.data || [];
                const sizeData = sizeResult.data || [];

                setSelectedTypes(typeData.map(() => false));
                setSelectedCategories(categoryData.map(() => false));
                setSelectedColours(colourData.map(() => false));
                setSelectedSizes(sizeData.map(() => false));
                setTypes(typeData);
                setCategories(categoryData);
                setColours(colourData);
                setSizes(sizeData);
            },
        );
    }, [setCurrentActivePage]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const type = types.filter((item, index) => selectedTypes[index]).map((item) => item.typeid);
            const colour = colours.filter((item, index) => selectedColours[index]).map((item) => item.colourid);
            const size = sizes.filter((item, index) => selectedSizes[index]).map((item) => item.sizeid);
            const category = categories
                .filter((item, index) => selectedCategories[index])
                .map((item) => item.categoryid);

            setIsLoading(true);

            Promise.all([
                getProductFilter(type, colour, size, category, productsPerPage, (pageNo - 1) * productsPerPage),
                getProductFilterCount(type, colour, size, category),
            ])
                .then(([productResult, countResult]) => {
                    setProducts(productResult.error ? [] : productResult.data || []);
                    setTotalProduct(countResult.error ? 0 : countResult.data || 0);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 300);

        return () => {
            clearTimeout(timeout);
        };
    }, [
        categories,
        colours,
        pageNo,
        selectedCategories,
        selectedColours,
        selectedSizes,
        selectedTypes,
        sizes,
        types,
    ]);

    const selectedCount = useMemo(
        () => [...selectedTypes, ...selectedCategories, ...selectedColours, ...selectedSizes].filter(Boolean).length,
        [selectedCategories, selectedColours, selectedSizes, selectedTypes],
    );

    const clearAllFilters = () => {
        setPageNo(1);
        setSelectedTypes(types.map(() => false));
        setSelectedCategories(categories.map(() => false));
        setSelectedColours(colours.map(() => false));
        setSelectedSizes(sizes.map(() => false));
    };

    const activeFilterChips = [
        ...types
            .map((item, index) => ({ label: capitaliseWord(item.typename), active: selectedTypes[index], type: "type" as const, index }))
            .filter((item) => item.active),
        ...categories
            .map((item, index) => ({ label: capitaliseWord(item.categoryname), active: selectedCategories[index], type: "category" as const, index }))
            .filter((item) => item.active),
        ...colours
            .map((item, index) => ({ label: capitaliseWord(item.colourname), active: selectedColours[index], type: "colour" as const, index }))
            .filter((item) => item.active),
        ...sizes
            .map((item, index) => ({ label: item.sizename, active: selectedSizes[index], type: "size" as const, index }))
            .filter((item) => item.active),
    ];

    const removeFilterChip = (type: "type" | "category" | "colour" | "size", index: number) => {
        setPageNo(1);
        if (type === "type") {
            setSelectedTypes((prev) => prev.map((value, currentIndex) => (currentIndex === index ? false : value)));
            return;
        }
        if (type === "category") {
            setSelectedCategories((prev) => prev.map((value, currentIndex) => (currentIndex === index ? false : value)));
            return;
        }
        if (type === "colour") {
            setSelectedColours((prev) => prev.map((value, currentIndex) => (currentIndex === index ? false : value)));
            return;
        }
        setSelectedSizes((prev) => prev.map((value, currentIndex) => (currentIndex === index ? false : value)));
    };

    const renderFilterSection = (
        title: string,
        items: { label: string; checked: boolean; toggle: () => void }[],
        upperCase = false,
    ) => (
        <div className="border-b border-slate-200 pb-5 last:border-b-0">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</label>
            <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                    <CheckBox
                        key={`${title}-${index}-${item.label}`}
                        checked={item.checked}
                        func={item.toggle}
                        labelClassName={`me-auto cursor-pointer text-sm text-slate-600 ${upperCase ? "uppercase" : ""}`}
                        label={item.label}
                    />
                ))}
            </div>
        </div>
    );

    const filterPanel = (
        <div className="flex h-fit flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Filters</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Refine by type, category, colour, and size.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedCount > 0 ? (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                            Clear all
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 lg:hidden"
                    >
                        x
                    </button>
                </div>
            </div>

            <div className="mt-5 space-y-5">
                {renderFilterSection(
                    "Type",
                    types.map((item, index) => ({
                        label: capitaliseWord(item.typename),
                        checked: selectedTypes[index],
                        toggle: () => {
                            setPageNo(1);
                            setSelectedTypes((prev) => {
                                const next = [...prev];
                                next[index] = !next[index];
                                return next;
                            });
                        },
                    })),
                )}

                {renderFilterSection(
                    "Category",
                    categories.map((item, index) => ({
                        label: capitaliseWord(item.categoryname),
                        checked: selectedCategories[index],
                        toggle: () => {
                            setPageNo(1);
                            setSelectedCategories((prev) => {
                                const next = [...prev];
                                next[index] = !next[index];
                                return next;
                            });
                        },
                    })),
                )}

                {renderFilterSection(
                    "Colour",
                    colours.map((item, index) => ({
                        label: capitaliseWord(item.colourname),
                        checked: selectedColours[index],
                        toggle: () => {
                            setPageNo(1);
                            setSelectedColours((prev) => {
                                const next = [...prev];
                                next[index] = !next[index];
                                return next;
                            });
                        },
                    })),
                )}

                {renderFilterSection(
                    "Size",
                    sizes.map((item, index) => ({
                        label: item.sizename,
                        checked: selectedSizes[index],
                        toggle: () => {
                            setPageNo(1);
                            setSelectedSizes((prev) => {
                                const next = [...prev];
                                next[index] = !next[index];
                                return next;
                            });
                        },
                    })),
                    true,
                )}
            </div>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Browse</p>
                    <label className="mt-2 block text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                        Explore now
                    </label>
                    <p className="mt-3 text-sm text-slate-500">
                        {totalProduct} item{totalProduct === 1 ? "" : "s"} found
                        {selectedCount > 0 ? ` across ${selectedCount} active filter${selectedCount === 1 ? "" : "s"}` : ""}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {selectedCount > 0 ? (
                        <Button
                            variant="bordered"
                            className="h-11 rounded-full border-slate-300 px-5 text-sm font-semibold text-slate-700"
                            onClick={clearAllFilters}
                        >
                            Clear all filters
                        </Button>
                    ) : null}
                    <Button
                        variant="bordered"
                        className="h-11 rounded-full border-slate-300 px-5 text-sm font-semibold text-slate-700 lg:hidden"
                        onClick={() => setShowFilters(true)}
                    >
                        {selectedCount > 0 ? `Filters (${selectedCount})` : "Filters"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="hidden lg:block">{filterPanel}</div>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6">
                    {activeFilterChips.length > 0 ? (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {activeFilterChips.map((chip) => (
                                <button
                                    key={`${chip.type}-${chip.index}-${chip.label}`}
                                    type="button"
                                    onClick={() => removeFilterChip(chip.type, chip.index)}
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"
                                >
                                    <span>{chip.label}</span>
                                    <span aria-hidden="true">x</span>
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="flex min-h-[420px] items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <ProductList data={products} />

                            {totalProduct > productsPerPage ? (
                                <div className="mt-8 border-t border-slate-200 pt-5">
                                    <CustomPagination
                                        currentPage={pageNo}
                                        total={Math.ceil(totalProduct / productsPerPage)}
                                        onChange={(current) => {
                                            setPageNo(current);
                                        }}
                                        labelClassName="hidden"
                                    />
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                            <h2 className="text-2xl font-semibold text-slate-900">No products matched these filters</h2>
                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                                Try clearing one or two filters, or head back to the full catalog to broaden the result set again.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Clear filters
                                </button>
                                <Link
                                    href={URL.Search}
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Search the catalog
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {showFilters ? (
                <div className="lg:hidden">
                    <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        aria-label="Close filters backdrop"
                        className="fixed inset-0 z-40 bg-slate-950/50"
                    />
                    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl">
                        {filterPanel}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
