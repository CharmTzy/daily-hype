"use client";
import { useAppState } from "@/app/app-provider";
import CheckBox from "@/components/ui/check-box";
import { CurrentActivePage } from "@/enums/global-enums";
import { ICategory, IColour, IProductDataFilter, ISize, IType } from "@/enums/product-interfaces";
import { capitaliseWord } from "@/functions/formatter";
import { getCategories, getColours, getProductFilter, getProductFilterCount, getSizes, getTypes } from "@/functions/product-functions";
import { useEffect, useState } from "react";
import ProductList from "./product-list";
import CustomPagination from "@/components/ui/pagination";
import { Button } from "@nextui-org/react";

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
    const [pageNo, setPageNo] = useState<number>(1);
    const [totalProduct, setTotalProduct] = useState<number>(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Explore);
        Promise.all([getTypes(), getCategories(), getColours(), getSizes()]).then(([result1, result2, result3, result4]) => {
            const typeData = result1.data || [];
            const categoryData = result2.data || [];
            const colourData = result3.data || [];
            const sizeData = result4.data || [];
            setSelectedTypes(typeData.map(() => false));
            setSelectedCategories(categoryData.map(() => false));
            setSelectedColours(colourData.map(() => false));
            setSelectedSizes(sizeData.map(() => false));
            setTypes(typeData);
            setCategories(categoryData);
            setColours(colourData);
            setSizes(sizeData);
        });
    }, [setCurrentActivePage]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const type = types.filter((t, index) => selectedTypes[index]).map((t) => t.typeid);
            const colour = colours.filter((c, index) => selectedColours[index]).map((c) => c.colourid);
            const size = sizes.filter((s, index) => selectedSizes[index]).map((s) => s.sizeid);
            const category = categories.filter((c, index) => selectedCategories[index]).map((c) => c.categoryid);
            Promise.all([getProductFilter(type, colour, size, category, 8, (pageNo - 1) * 8), getProductFilterCount(type, colour, size, category)]).then(([result1, result2]) => {
                if (!result1.error) {
                    setProducts(result1.data || []);
                }
                if (!result2.error) {
                    setTotalProduct(result2.data || 1);
                }
            });
        }, 300);
        return () => {
            clearTimeout(timeout);
        };
    }, [categories, colours, pageNo, selectedCategories, selectedColours, selectedSizes, selectedTypes, sizes, types]);

    const selectedCount = [...selectedTypes, ...selectedCategories, ...selectedColours, ...selectedSizes].filter(Boolean).length;

    const renderFilterSection = (
        title: string,
        items: { label: string; checked: boolean; toggle: () => void }[],
        upperCase = false,
    ) => (
        <div className="border-b border-slate-200 pb-5 last:border-b-0 dark:border-slate-800">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</label>
            <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                    <CheckBox
                        key={index}
                        checked={item.checked}
                        func={item.toggle}
                        labelClassName={`me-auto cursor-pointer text-sm text-slate-600 dark:text-slate-300 ${upperCase ? "uppercase" : ""}`}
                        label={item.label}
                    />
                ))}
            </div>
        </div>
    );

    const filterPanel = (
        <div className="flex h-fit flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Filters</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                        Refine by type, category, colour, and size.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-200"
                >
                    ✕
                </button>
            </div>

            <div className="mt-5 space-y-5">
                {renderFilterSection("Type", types.map((t, index) => ({
                    label: capitaliseWord(t.typename),
                    checked: selectedTypes[index],
                    toggle: () => {
                        setPageNo(1);
                        setSelectedTypes((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                        });
                    },
                })))}

                {renderFilterSection("Category", categories.map((c, index) => ({
                    label: capitaliseWord(c.categoryname),
                    checked: selectedCategories[index],
                    toggle: () => {
                        setPageNo(1);
                        setSelectedCategories((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                        });
                    },
                })))}

                {renderFilterSection("Colour", colours.map((c, index) => ({
                    label: capitaliseWord(c.colourname),
                    checked: selectedColours[index],
                    toggle: () => {
                        setPageNo(1);
                        setSelectedColours((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                        });
                    },
                })))}

                {renderFilterSection("Size", sizes.map((s, index) => ({
                    label: s.sizename,
                    checked: selectedSizes[index],
                    toggle: () => {
                        setPageNo(1);
                        setSelectedSizes((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                        });
                    },
                })), true)}
            </div>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Browse</p>
                    <label className="mt-2 block text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                        Explore now
                    </label>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                        {totalProduct} item{totalProduct === 1 ? "" : "s"} found
                    </p>
                </div>

                <Button
                    variant="bordered"
                    className="h-11 rounded-full border-slate-300 px-5 text-sm font-semibold text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-100"
                    onClick={() => setShowFilters(true)}
                >
                    {selectedCount > 0 ? `Filters (${selectedCount})` : "Filters"}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="hidden lg:block">{filterPanel}</div>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    {selectedCount > 0 ? (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {types.filter((_, index) => selectedTypes[index]).map((type) => (
                                <span key={type.typeid} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    {capitaliseWord(type.typename)}
                                </span>
                            ))}
                            {categories.filter((_, index) => selectedCategories[index]).map((category) => (
                                <span key={category.categoryid} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    {capitaliseWord(category.categoryname)}
                                </span>
                            ))}
                            {colours.filter((_, index) => selectedColours[index]).map((colour) => (
                                <span key={colour.colourid} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    {capitaliseWord(colour.colourname)}
                                </span>
                            ))}
                            {sizes.filter((_, index) => selectedSizes[index]).map((size) => (
                                <span key={size.sizeid} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    {size.sizename}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <ProductList data={products} />

                    {totalProduct > 8 ? (
                        <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
                            <CustomPagination
                                currentPage={pageNo}
                                total={Math.ceil(totalProduct / 8)}
                                onChange={(current) => {
                                    setPageNo(current);
                                }}
                                labelClassName="hidden"
                            />
                        </div>
                    ) : null}
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
                    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl dark:bg-slate-950">
                        {filterPanel}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
