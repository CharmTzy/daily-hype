"use client";
import { useEffect, useState } from "react";
import { capitaliseWord } from "@/functions/formatter";

interface SearchFilterProps {
    onFilterChange: (selectedOptions: SelectedOptions) => void;
}

interface Options {
    sort: {
        sortid: string;
        sortname: string;
    }[];
    type: {
        typeid: string;
        typename: string;
    }[];
    category: {
        categoryid: string;
        categoryname: string;
    }[];
    colour: {
        colourid: string;
        colourname: string;
    }[];
    price: {
        priceid: string;
        pricename: string;
    }[];
    size: {
        sizeid: string;
        sizename: string;
    }[];
}

interface SelectedOptions {
    sort: string;
    type: string;
    category: string;
    colour: string;
    price: string;
    size: string;
}

const defaultSelectedOptions: SelectedOptions = {
    sort: "",
    type: "",
    category: "",
    colour: "",
    price: "",
    size: "",
};

export default function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const [openSection, setOpenSection] = useState<keyof SelectedOptions | "">("");
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(defaultSelectedOptions);
    const [options, setOptions] = useState<Options>({
        sort: [
            { sortid: "unitprice ASC", sortname: "price-low-to-high" },
            { sortid: "unitprice DESC", sortname: "price-high-to-low" },
            { sortid: "createdat DESC", sortname: "newest" },
            { sortid: "soldqty DESC", sortname: "trending" },
        ],
        type: [],
        category: [],
        colour: [],
        price: [
            { priceid: "0,19.99", pricename: "< 19.99" },
            { priceid: "20.00,39.99", pricename: "20.00-39.99" },
            { priceid: "40.00,59.99", pricename: "40.00-59.99" },
            { priceid: "60.00,79.99", pricename: "60.00-79.99" },
            { priceid: "80,1000", pricename: "80.00 and above" },
        ],
        size: [],
    });

    useEffect(() => {
        onFilterChange(selectedOptions);
    }, [onFilterChange, selectedOptions]);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/filterOptions`)
            .then((response) => response.json())
            .then((filterOptions) => {
                setOptions((prevOptions) => ({
                    ...prevOptions,
                    type: filterOptions.type,
                    category: filterOptions.category,
                    colour: filterOptions.colour,
                    size: filterOptions.size,
                }));
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const getOptionName = (category: keyof SelectedOptions, option: string): string => {
        switch (category) {
            case "sort":
                return options.sort.find((item) => item.sortid === option)?.sortname || "";
            case "price":
                return options.price.find((item) => item.priceid === option)?.pricename || "";
            default:
                return option;
        }
    };

    const getSectionOptions = (category: keyof SelectedOptions) => {
        switch (category) {
            case "sort":
                return options.sort.map((item) => ({ id: item.sortid, name: item.sortname }));
            case "type":
                return options.type.map((item) => ({ id: item.typename, name: item.typename }));
            case "category":
                return options.category.map((item) => ({ id: item.categoryname, name: item.categoryname }));
            case "colour":
                return options.colour.map((item) => ({ id: item.colourname, name: item.colourname }));
            case "price":
                return options.price.map((item) => ({ id: item.priceid, name: item.pricename }));
            case "size":
                return options.size.map((item) => ({ id: item.sizename, name: item.sizename }));
            default:
                return [];
        }
    };

    return (
        <div className="mt-6">
            <div className="flex flex-wrap gap-2">
                {(Object.keys(defaultSelectedOptions) as (keyof SelectedOptions)[]).map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => setOpenSection((prev) => (prev === category ? "" : category))}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                            openSection === category
                                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950"
                                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {(Object.entries(selectedOptions) as [keyof SelectedOptions, string][]).map(([category, option]) =>
                    option ? (
                        <button
                            key={category}
                            type="button"
                            onClick={() => {
                                setSelectedOptions((prev) => ({
                                    ...prev,
                                    [category]: "",
                                }));
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <span>{category}: {capitaliseWord(getOptionName(category, option))}</span>
                            <span aria-hidden="true">✕</span>
                        </button>
                    ) : null,
                )}
            </div>

            {openSection ? (
                <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                {openSection}
                            </p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                Select one option to narrow your search.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setSelectedOptions((prev) => ({
                                    ...prev,
                                    [openSection]: "",
                                }))
                            }
                            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {getSectionOptions(openSection).map((item) => {
                            const isActive = selectedOptions[openSection] === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedOptions((prev) => ({
                                            ...prev,
                                            [openSection]: item.id,
                                        }));
                                    }}
                                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                                        isActive
                                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950"
                                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    }`}
                                >
                                    {capitaliseWord(item.name)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
