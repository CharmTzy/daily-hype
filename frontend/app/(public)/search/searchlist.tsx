import React, { useEffect, useState } from "react";
import { Tooltip, Card, CardBody, CardFooter, Switch } from "@nextui-org/react";

import CustomPagination from "@/components/ui/pagination";
import Image from "next/image";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { useRouter } from "next/navigation";
import { URL } from "@/enums/global-enums";
type Product = {
  productid:string;
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
//1.
//search product by search input and filter options
const searchAndFilterProduct = (searchInput: string, selectedFilters: SelectedFilters, noOfItems: number, currentPage: number, isInStock: boolean) => {

  const requestData: RequestData = {
    ORDER_BY: selectedFilters.sort !== "" ? selectedFilters.sort : "soldqty ASC",
    SEARCH_TEXT: searchInput,
    FILTERS: {},
    PRICE: selectedFilters.price !== "" ? selectedFilters.price : ">=0",
    LIMIT: noOfItems,
    OFFSET: (currentPage - 1) * noOfItems,
    INSTOCK: isInStock,
  };

  // Define the filters you want to consider
  const filterKeys: (keyof SelectedFilters)[] = ["type", "category", "colour", "size"];

  // Iterate through the filters and add them if they exist in selectedFilters
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
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      return result.product;
    });
};

//2.
//search product by search input and filter options
const getProductCount = (searchInput: string, selectedFilters: SelectedFilters, isInStock: boolean) => {
  const requestData2: RequestData2 = {
    SEARCH_TEXT: searchInput,
    FILTERS: {},
    PRICE: selectedFilters.price !== "" ? selectedFilters.price : ">=0",
    INSTOCK: isInStock,
  };

  // Define the filters you want to consider
  const filterKeys: (keyof SelectedFilters)[] = ["type", "category", "colour", "size"];

  // Iterate through the filters and add them if they exist in selectedFilters
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
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      return result.count;
    });
};

export default function SearchList({ searchInput, selectedFilters }: SearchListProps): JSX.Element {
  const [productArr, setProductArr] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [noOfItems, setNoOfItems] = useState(10);
  const [displayText, setDisplayText] = useState<boolean>(false);
  const [isInStock, setIsInStock] = useState(true);
  const itemsPerPage = [10, 20, 30, 40, 50];
  const router = useRouter();

  let colourRender = (hex: string[], colour: string[]) => {
    const items: JSX.Element[] = [];
    const colours: string[] = [];
    hex.forEach((item, index) => {
      if (!colours.some((c) => c === item)) {
        items.push(<div key={index} title={capitaliseWord(colour[index])} className={`w-4 h-4 border-1 mr-1 rounded-full laptop-3xl:w-5 laptop-3xl:h-5`} style={{ backgroundColor: `#${item}` }}></div>);
        colours.push(item);
      }
    });
    return items;
  };

  useEffect(() => {
    console.log(selectedFilters);
    if (Object.values(selectedFilters).every((value) => value == "") && searchInput == "") {
      console.log(Object.values(selectedFilters).every((value) => value == ""));
      setDisplayText(false);
      setProductArr([]);
      return;
    }
    setCurrentPage(1);
    Promise.all([searchAndFilterProduct(searchInput, selectedFilters, noOfItems, currentPage, isInStock), getProductCount(searchInput, selectedFilters, isInStock)])
      .then(([productDataArray, count]: [Product[], number]) => {
        setDisplayText(true);
        setTotalPages(Math.ceil(count / noOfItems));
        if (productDataArray) setProductArr(productDataArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [searchInput, selectedFilters, isInStock, noOfItems]);

  useEffect(() => {
    console.log(selectedFilters);
    if (Object.values(selectedFilters).every((value) => value == "") && searchInput == "") {
      console.log(Object.values(selectedFilters).every((value) => value == ""));
      setDisplayText(false);
      setProductArr([]);
      return;
    }
    searchAndFilterProduct(searchInput, selectedFilters, noOfItems, currentPage, isInStock)
      .then((productDataArray: Product[]) => {
        setDisplayText(true);
        if (productDataArray) setProductArr(productDataArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [currentPage]);

  // Other useEffects, functions, or components related to rendering the search results

  return (
    <div className="mx-10">
      {/* Display No Result or Search Results */}
      {displayText ? (
        productArr.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-10">
            <p className="text-2xl p-1 font-semibold">NO RESULT FOUND {searchInput == "" ? "" : `FOR  &quot; "${searchInput}" &quot;`}</p>
            <p className="text-sm p-1">Enhance your results by double-checking your spelling or trying a more specific keyword for better accuracy</p>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mt-10">
            <p className="text-2xl font-semibold">SEARCH RESULTS {searchInput == "" ? "" : `FOR`}</p>
            <p className="text-base font-semibold">{searchInput == "" ? "" : `"${searchInput}"`}</p>
          </div>
        )
      ) : (
        ""
      )}
      {displayText && productArr.length !== 0 ? (
        <>
          <div className="flex justify-end m-2 gap-2">
            <h5 className="font-medium text-sm mt-0.5">Show Only In stock Items</h5>
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
            ></Switch>
          </div>

          <div className="gap-2 my-5 grid sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-5 md:grid-cols-3">
            {productArr &&
              productArr.map((item, index) => (
                <Tooltip key={index} color={"warning"} content={item.productname} className="capitalize">
                  <Card className="w-[200px] mb-5" shadow="sm" key={index} isPressable
                    onPress={() => {
                      router.push(URL.ProductDetail + item.productid)
                    }}>
                    <CardBody className="overflow-visible p-0">
                      <div className="w-full h-[180px]">
                        <Image priority={true} fetchPriority="high" loading="eager" width={150} height={170} alt={item.productname} className="w-full object-cover h-full" src={item.urls[0]} />
                      </div>
                    </CardBody>
                    <CardFooter className="text-small flex flex-col">
                      <b className="h-10 self-start text-left text-[14px] overflow-hidden">{item.productname}</b>
                      <div className="self-start mt-2 flex w-full">
                        <p className="text-slate-400 dark:text-slate-600 text-[13px] font-semibold capitalize">{item.type}</p>
                        <p className="text-slate-400 ms-auto dark:text-slate-600 text-[13px] font-semibold capitalize">{item.category}</p>
                      </div>
                      <div className="flex self-start w-full mt-2">
                        <div className="flex">{colourRender(item.hex, item.colour)}</div>
                        <div className="ms-auto flex items-center">
                          <span className="text-[gold] text-[20px] -mt-[2px] mr-1">&#9733;</span>
                          <p className="tracking-wide text-slate-600 dark:text-slate-400">{parseFloat(item.rating).toFixed(1)}</p>
                        </div>
                      </div>
                      <p className="mt-2 self-start font-semibold text-slate-600 dark:text-slate-400">${formatMoney(item.unitprice)}</p>
                    </CardFooter>
                  </Card>
                </Tooltip>
              ))}
          </div>

          {/*no of items*/}
          {/* Pagination */}
          <div className="flex flex-row justify-between">
            <div className="flex flex-col  w-[100px]">
              <div className="text-slate-500  text-sm">Items Per Page</div>
              <select
                defaultValue={20}
                title="Items Limit"
                className="bg-white p-2 text-sm rounded-lg outline-none cursor-pointer border-r-[15px] border-r-transparent shadow-input laptop-3xl:p-2 laptop-2xl:p-2 laptop-2xl:w-[140px] laptop-2xl:ms-12 laptop-xl:w-[120px] laptop-xl:py-[6px] laptop-xl:text-[13px]"
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
            <div className="flex flex-col items-center gap-3">
              <p>
                {" "}
                page {currentPage} of {totalPages}
              </p>
              <CustomPagination total={totalPages} currentPage={1} onChange={(page) => setCurrentPage(page)} />
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
