"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import SearchIcon from "@/icons/search-icon";
import SearchFilter from "./searchfilter";
import SearchList from "./searchlist";

interface SelectedFilters {
    sort: string;
    type: string;
    category: string;
    colour: string;
    price: string;
    size: string;
}

const defaultFilters: SelectedFilters = {
    sort: "",
    type: "",
    category: "",
    colour: "",
    price: "",
    size: "",
};

const quickSearches = ["linen", "oversized", "neutral", "gift-ready", "baby"];

const quickPresets = [
    {
        title: "Trending now",
        description: "Start with products sorted by what shoppers are buying most.",
        filters: { sort: "soldqty DESC" },
    },
    {
        title: "Newest arrivals",
        description: "Jump straight into the most recently added items.",
        filters: { sort: "createdat DESC" },
    },
    {
        title: "Under $20",
        description: "A fast budget-friendly starting point for browsing.",
        filters: { price: "0,19.99" },
    },
    {
        title: "Premium edit",
        description: "See products filtered into the highest price band.",
        filters: { price: "80,1000" },
    },
];

export default function SearchProduct() {
    const { setCurrentActivePage } = useAppState();
    const [searchInput, setSearchInput] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(defaultFilters);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Search);
    }, [setCurrentActivePage]);

    const hasActiveSearch = useMemo(
        () => searchInput.trim() !== "" || Object.values(selectedFilters).some((value) => value !== ""),
        [searchInput, selectedFilters],
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Search</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                            Find your next piece
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-slate-500">
                            Search by keyword, then narrow the results by category, size, colour, and price.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Input
                        type="text"
                        placeholder="Search products, styles, or categories"
                        classNames={{
                            input: "text-sm",
                            inputWrapper: "h-12 rounded-full border border-slate-300 bg-white",
                        }}
                        className="w-full"
                        variant="bordered"
                        startContent={<SearchIcon width={17} height={17} />}
                        value={searchInput}
                        onValueChange={setSearchInput}
                    />
                    <Button
                        variant="bordered"
                        size="lg"
                        onClick={() => {
                            setSearchInput("");
                            setSelectedFilters(defaultFilters);
                        }}
                        className="h-12 rounded-full border-slate-300 px-6 text-sm font-semibold text-slate-700"
                    >
                        Clear
                    </Button>
                </div>

                {!hasActiveSearch ? (
                    <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Popular searches
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                Start with a quick idea.
                            </h2>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {quickSearches.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => setSearchInput(term)}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Quick starting points
                            </p>
                            <div className="mt-4 grid gap-3">
                                {quickPresets.map((preset) => (
                                    <button
                                        key={preset.title}
                                        type="button"
                                        onClick={() =>
                                            setSelectedFilters((prev) => ({
                                                ...prev,
                                                ...preset.filters,
                                            }))
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        <p className="text-sm font-semibold text-slate-900">{preset.title}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {preset.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : (
                    <p className="mt-4 text-xs font-medium text-slate-500">
                        Use the filter bar below to narrow your results even further.
                    </p>
                )}

                <SearchFilter
                    value={selectedFilters}
                    onFilterChange={(filters) => {
                        setSelectedFilters(filters);
                    }}
                />

                <SearchList searchInput={searchInput} selectedFilters={selectedFilters} />
            </div>
        </div>
    );
}
