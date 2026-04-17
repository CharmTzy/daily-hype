"use client";
import { CurrentActivePage } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect, useState } from "react";
import SearchIcon from "@/icons/search-icon";
import { Button, Input } from "@nextui-org/react";
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

export default function SearchProduct() {
    const { setCurrentActivePage } = useAppState();
    const [searchInput, setSearchInput] = useState<string>("");
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        sort: "",
        type: "",
        category: "",
        colour: "",
        price: "",
        size: "",
    });

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Search);
    }, [setCurrentActivePage]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
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
                            setSelectedFilters({
                                sort: "",
                                type: "",
                                category: "",
                                colour: "",
                                price: "",
                                size: "",
                            });
                        }}
                        className="h-12 rounded-full border-slate-300 px-6 text-sm font-semibold text-slate-700"
                    >
                        Clear
                    </Button>
                </div>

                <p className="mt-3 text-xs font-medium text-slate-500">Start typing to search</p>

                <SearchFilter
                    onFilterChange={(filters) => {
                        setSelectedFilters(filters);
                    }}
                />

                <SearchList searchInput={searchInput} selectedFilters={selectedFilters} />
            </div>
        </div>
    );
}
