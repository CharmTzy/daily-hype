import React, { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";
import CustomPagination from "@/components/ui/pagination";
import Image from "next/image";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { useRouter } from "next/navigation";
import { URL } from "@/enums/global-enums";

type Product = {
    productid: string;
    productname: string;
    unitprice: string;
    description: string;
    soldqty: number;
    rating: string;
    urls: string[];
    type: string;
    category: string;
    colour: string[];
    hex: string[];
    size: string[];
    qty: number;
    productstatus: string;
    productdetailid: number;
    createdat: string;
    updatedat: string;
};

interface SelectedFilters {
    sort: string;
    type: string;
    category: string;
    colour: string;
    price: string;
    size: string;
}

interface SearchListProps {
    searchInput: string;
    selectedFilters: SelectedFilters;
}

interface RequestData {
    ORDER_BY: string;
    SEARCH_TEXT: string;
    FILTERS: {
        [key: string]: string;
    };
    PRICE: string;
    LIMIT: number;
    OFFSET: number;
    INSTOCK: boolean;
}

interface RequestData2 {
    SEARCH_TEXT: string;
    FILTERS: {
        [key: string]: string;
    };
    PRICE: string;
    INSTOCK: boolean;
}

const searchAndFilterProduct = (
    searchInput: string,
    selectedFilters: SelectedFilters,
    noOfItems: number,
    currentPage: number,
    isInStock: boolean,
) => {
    const requestData: RequestData = {
        ORDER_BY: selectedFilters.sort !== "" ? selectedFilters.sort : "soldqty DESC",
        SEARCH_TEXT: searchInput,
        FILTERS: {},
        PRICE: selectedFilters.price !== "" ? selectedFilters.price : ">=0",
        LIMIT: noOfItems,
        OFFSET: (currentPage - 1) * noOfItems,
        INSTOCK: isInStock,
    };

    const filterKeys: (keyof SelectedFilters)[] = ["type", "category", "colour", "size"];
    filterKeys.forEach((filterKey) => {
        if (selectedFilters[filterKey] !== "") {
            requestData.FILTERS[filterKey] = selectedFilters[filterKey];
        }
    });

    return fetch(`${process.env.BACKEND_URL}/api/searchProduct`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    })
        .then((response) => response.json())
        .then((result) => result.product);
};

const getProductCount = (searchInput: string, selectedFilters: SelectedFilters, isInStock: boolean) => {
    const requestData2: RequestData2 = {
        SEARCH_TEXT: searchInput,
        FILTERS: {},
        PRICE: selectedFilters.price !== "" ? selectedFilters.price : ">=0",
        INSTOCK: isInStock,
    };

    const filterKeys: (keyof SelectedFilters)[] = ["type", "category", "colour", "size"];
    filterKeys.forEach((filterKey) => {
        if (selectedFilters[filterKey] !== "") {
            requestData2.FILTERS[filterKey] = selectedFilters[filterKey];
        }
    });

    return fetch(`${process.env.BACKEND_URL}/api/searchProductCount`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData2),
    })
        .then((response) => response.json())
        .then((result) => result.count);
};

export default function SearchList({ searchInput, selectedFilters }: SearchListProps): JSX.Element {
    const [productArr, setProductArr] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [noOfItems, setNoOfItems] = useState(10);
    const [displayText, setDisplayText] = useState(false);
    const [isInStock, setIsInStock] = useState(true);
    const itemsPerPage = [10, 20, 30, 40, 50];
    const router = useRouter();
    const hasActiveSearch = searchInput.trim() !== "" || Object.values(selectedFilters).some((value) => value !== "");

    const colourRender = (hex: string[], colour: string[]) => {
        const items: JSX.Element[] = [];
        const colours: string[] = [];
        hex.forEach((item, index) => {
            if (!colours.includes(item)) {
                items.push(
                    <div
                        key={index}
                        title={capitaliseWord(colour[index])}
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: `#${item}` }}
                    />,
                );
                colours.push(item);
            }
        });
        return items;
    };

    useEffect(() => {
        if (!hasActiveSearch) {
            setDisplayText(false);
            setProductArr([]);
            setCurrentPage(1);
            setTotalPages(1);
            return;
        }

        const firstPage = 1;
        setCurrentPage(firstPage);
        Promise.all([
            searchAndFilterProduct(searchInput, selectedFilters, noOfItems, firstPage, isInStock),
            getProductCount(searchInput, selectedFilters, isInStock),
        ])
            .then(([productDataArray, count]: [Product[], number]) => {
                setDisplayText(true);
                setTotalPages(Math.max(1, Math.ceil(count / noOfItems)));
                if (productDataArray) {
                    setProductArr(productDataArray);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [hasActiveSearch, isInStock, noOfItems, searchInput, selectedFilters]);

    useEffect(() => {
        if (!hasActiveSearch || currentPage === 1) {
            return;
        }

        searchAndFilterProduct(searchInput, selectedFilters, noOfItems, currentPage, isInStock)
            .then((productDataArray: Product[]) => {
                setDisplayText(true);
                if (productDataArray) {
                    setProductArr(productDataArray);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentPage, hasActiveSearch, isInStock, noOfItems, searchInput, selectedFilters]);

    if (!displayText) {
        return <div className="mt-10" />;
    }

    if (productArr.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <p className="text-2xl font-semibold text-slate-950 dark:text-white">
                    No results found{searchInput === "" ? "" : ` for "${searchInput}"`}
                </p>
                <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-300">
                    Try a broader keyword, change one filter, or clear your search to explore the full catalog again.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-2xl font-semibold text-slate-950 dark:text-white">
                        Search results{searchInput === "" ? "" : ` for "${searchInput}"`}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm dark:border-slate-800">
                    <h5 className="font-medium text-slate-700 dark:text-slate-100">In stock only</h5>
                    <Switch
                        defaultSelected
                        color="success"
                        size="sm"
                        onValueChange={(isSelected: boolean) => {
                            setIsInStock(isSelected);
                        }}
                        classNames={{
                            wrapper: "group-data-[selected]:bg-custom-color1",
                        }}
                    />
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
                {productArr.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => {
                            router.push(URL.ProductDetail + item.productid);
                        }}
                        className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950"
                    >
                        <div className="relative aspect-[4/5] w-full bg-slate-100 dark:bg-slate-900">
                            <Image
                                priority
                                fetchPriority="high"
                                loading="eager"
                                fill
                                alt={item.productname}
                                className="object-cover"
                                src={item.urls[0]}
                                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            />
                        </div>
                        <div className="flex flex-col gap-3 p-4">
                            <b className="line-clamp-2 min-h-[40px] text-[14px] text-slate-950 dark:text-white">
                                {item.productname}
                            </b>
                            <div className="flex w-full items-center">
                                <p className="text-[12px] font-semibold capitalize text-slate-400 dark:text-slate-500">
                                    {item.type}
                                </p>
                                <p className="ms-auto text-[12px] font-semibold capitalize text-slate-400 dark:text-slate-500">
                                    {item.category}
                                </p>
                            </div>
                            <div className="flex w-full items-center">
                                <div className="flex flex-wrap gap-1">{colourRender(item.hex, item.colour)}</div>
                                <div className="ms-auto flex items-center">
                                    <span className="mr-1 text-[18px] text-[gold]">&#9733;</span>
                                    <p className="tracking-wide text-slate-600 dark:text-slate-300">
                                        {parseFloat(item.rating).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">
                                ${formatMoney(item.unitprice)}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="text-sm text-slate-500 dark:text-slate-300">Items per page</div>
                    <select
                        title="Items Limit"
                        className="w-[120px] rounded-full border border-slate-300 bg-white px-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
                        value={noOfItems}
                        onChange={(e) => {
                            setNoOfItems(parseInt(e.target.value));
                        }}
                    >
                        {itemsPerPage.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>
                <CustomPagination
                    total={totalPages}
                    currentPage={currentPage}
                    onChange={(page) => setCurrentPage(page)}
                    labelClassName="hidden"
                />
            </div>
        </div>
    );
}
