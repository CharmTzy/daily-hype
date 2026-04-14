"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Checkbox, Select, SelectItem, Spinner, Switch } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import CustomPagination from "@/components/ui/pagination";
import { capitaliseWord, formatMoney } from "@/functions/formatter";

type Category = {
    categoryid: number;
    categoryname: string;
    productcount?: number;
};

type ProductImage = {
    imageid: string;
    imagename: string;
    url: string;
};

type ProductColour = {
    colourid: number;
    colourname: string;
    hex: string;
};

type Product = {
    productid: number;
    productname: string;
    description: string;
    unitprice: string;
    rating: string;
    image?: ProductImage[];
    colour?: ProductColour[];
};

type TypeCatalogPageProps = {
    typeId: number;
    title: string;
    activePage: CurrentActivePage;
};

function getCategoriesByType(typeId: number) {
    return fetch(`${process.env.BACKEND_URL}/api/categories/${typeId}`)
        .then((response) => response.json())
        .then((result) => result.category as Category[]);
}

function getProductsByCategoryAndType(
    categoryIds: string[],
    typeId: number,
    pageSize: number,
    currentPage: number,
    inStockOnly: boolean,
) {
    const queryParams = new URLSearchParams();
    queryParams.append("categoryIDs", categoryIds.join(","));
    queryParams.append("typeIDs", String(typeId));
    queryParams.append("limit", String(pageSize));
    queryParams.append("offset", String((currentPage - 1) * pageSize));
    queryParams.append("isinstock", inStockOnly ? "true" : "false");

    return fetch(`${process.env.BACKEND_URL}/api/productsByCategoryIDs?${queryParams}`)
        .then((response) => response.json())
        .then((result) => (result.product || []) as Product[]);
}

function getProductCountByCategoryAndType(categoryIds: string[], typeId: number, inStockOnly: boolean) {
    const queryParams = new URLSearchParams();
    queryParams.append("categoryIDs", categoryIds.join(","));
    queryParams.append("typeIDs", String(typeId));
    queryParams.append("isinstock", inStockOnly ? "true" : "false");

    return fetch(`${process.env.BACKEND_URL}/api/productsCountByCategoryIDs?${queryParams}`)
        .then((response) => response.json())
        .then((result) => Number(result.productCount || 0));
}

export default function TypeCatalogPage({ typeId, title, activePage }: TypeCatalogPageProps) {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
    const [products, setProducts] = useState<Product[]>([]);
    const [inStockOnly, setInStockOnly] = useState(true);
    const [pageSize, setPageSize] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setCurrentActivePage(activePage);
        getCategoriesByType(typeId)
            .then((result) => {
                setCategories(result);
                if (result.length > 0) {
                    setSelectedCategoryIds(new Set([String(result[0].categoryid)]));
                }
            })
            .catch((error) => {
                console.error(error);
                setCategories([]);
            });
    }, [activePage, setCurrentActivePage, typeId]);

    useEffect(() => {
        if (selectedCategoryIds.size === 0) {
            setProducts([]);
            setTotalPages(1);
            setIsLoading(false);
            return;
        }

        const categoryIds = Array.from(selectedCategoryIds);
        setIsLoading(true);

        Promise.all([
            getProductsByCategoryAndType(categoryIds, typeId, pageSize, currentPage, inStockOnly),
            getProductCountByCategoryAndType(categoryIds, typeId, inStockOnly),
        ])
            .then(([productResult, countResult]) => {
                setProducts(productResult);
                const pages = Math.max(1, Math.ceil(countResult / pageSize));
                setTotalPages(pages);
                if (currentPage > pages) {
                    setCurrentPage(1);
                }
            })
            .catch((error) => {
                console.error(error);
                setProducts([]);
                setTotalPages(1);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [currentPage, inStockOnly, pageSize, selectedCategoryIds, typeId]);

    const selectedCategoryNames = categories
        .filter((category) => selectedCategoryIds.has(String(category.categoryid)))
        .map((category) => capitaliseWord(category.categoryname));

    const renderFilters = (isMobilePanel: boolean) => (
        <aside
            className={`flex h-fit flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${
                isMobilePanel ? "" : "lg:sticky lg:top-28"
            }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Categories</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                        Narrow this section the way shoppers would on smaller screens.
                    </p>
                </div>
                {isMobilePanel ? (
                    <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-200"
                    >
                        ✕
                    </button>
                ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3">
                {categories.map((category) => {
                    const isSelected = selectedCategoryIds.has(String(category.categoryid));
                    return (
                        <Checkbox
                            key={category.categoryid}
                            isSelected={isSelected}
                            onValueChange={(checked) => {
                                const nextSelected = new Set(selectedCategoryIds);
                                if (checked) {
                                    nextSelected.add(String(category.categoryid));
                                } else {
                                    nextSelected.delete(String(category.categoryid));
                                }
                                setCurrentPage(1);
                                setSelectedCategoryIds(nextSelected);
                            }}
                            classNames={{ label: "capitalize text-slate-700 dark:text-slate-100" }}
                        >
                            {category.categoryname}
                        </Checkbox>
                    );
                })}
            </div>

            <div className="mt-6 space-y-4 rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">In-stock items only</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">Hide unavailable sizes and colours</p>
                    </div>
                    <Switch
                        isSelected={inStockOnly}
                        color="success"
                        size="sm"
                        onValueChange={(checked) => {
                            setCurrentPage(1);
                            setInStockOnly(checked);
                        }}
                    />
                </div>

                <Select
                    aria-label="Items per page"
                    className="w-full"
                    selectedKeys={[String(pageSize)]}
                    onSelectionChange={(keys) => {
                        const value = Number(Array.from(keys)[0] || 12);
                        setCurrentPage(1);
                        setPageSize(value);
                    }}
                >
                    {[8, 12, 16, 20].map((value) => (
                        <SelectItem key={String(value)} value={String(value)}>
                            {value} per page
                        </SelectItem>
                    ))}
                </Select>
            </div>
        </aside>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collection</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-300">
                        {selectedCategoryNames.length > 0
                            ? selectedCategoryNames.join(" / ")
                            : "Choose a category to browse"}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="bordered"
                        className="h-11 rounded-full border-slate-300 px-5 text-sm font-semibold text-slate-700 lg:hidden dark:border-slate-700 dark:text-slate-100"
                        onClick={() => setShowFilters(true)}
                    >
                        Filters
                    </Button>
                    <div className="hidden items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm lg:flex dark:border-slate-800">
                        <span className="font-medium text-slate-600 dark:text-slate-300">In stock only</span>
                        <Switch
                            isSelected={inStockOnly}
                            color="success"
                            size="sm"
                            onValueChange={(checked) => {
                                setCurrentPage(1);
                                setInStockOnly(checked);
                            }}
                        />
                    </div>
                </div>
            </div>

            {selectedCategoryNames.length > 0 ? (
                <div className="mb-6 flex flex-wrap gap-2">
                    {selectedCategoryNames.map((name) => (
                        <span
                            key={name}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                            {name}
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="hidden lg:block">{renderFilters(false)}</div>

                <section className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {products.length} item{products.length === 1 ? "" : "s"} on this page
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                                Responsive grid inspired by marketplace browsing
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <Select
                                aria-label="Desktop items per page"
                                className="w-[160px]"
                                selectedKeys={[String(pageSize)]}
                                onSelectionChange={(keys) => {
                                    const value = Number(Array.from(keys)[0] || 12);
                                    setCurrentPage(1);
                                    setPageSize(value);
                                }}
                            >
                                {[8, 12, 16, 20].map((value) => (
                                    <SelectItem key={String(value)} value={String(value)}>
                                        {value} per page
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex min-h-[420px] items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No products found</h3>
                            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-300">
                                Try another category selection or turn off the stock filter to see more items.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
                                {products.map((product) => (
                                    <button
                                        key={product.productid}
                                        type="button"
                                        onClick={() => router.push(`${URL.ProductDetail}${product.productid}`)}
                                        className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-900">
                                            {product.image?.[0]?.url ? (
                                                <Image
                                                    src={product.image[0].url}
                                                    alt={product.productname}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="flex flex-col gap-3 p-4">
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                                    {product.productname}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-300">
                                                    {product.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    ${formatMoney(product.unitprice)}
                                                </span>
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                                                    {Number(product.rating).toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {product.colour?.slice(0, 4).map((colour) => (
                                                    <span
                                                        key={colour.colourid}
                                                        title={colour.colourname}
                                                        className="h-4 w-4 rounded-full border border-black/10"
                                                        style={{ backgroundColor: `#${colour.hex}` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500 dark:text-slate-300">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <CustomPagination
                                    currentPage={currentPage}
                                    total={totalPages}
                                    onChange={(page) => setCurrentPage(page)}
                                    className="justify-center"
                                    labelClassName="hidden"
                                />
                            </div>
                        </>
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
                    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-4 shadow-2xl dark:bg-slate-950">
                        {renderFilters(true)}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
