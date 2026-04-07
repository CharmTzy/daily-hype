"use client";

import { CurrentActivePage } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect, useState } from "react";
import React from "react";
import { Listbox, ListboxItem, Switch, Card, CardBody, CardFooter, Image, Tooltip, Input, cn } from "@nextui-org/react";
import CustomPagination from "@/components/ui/pagination";

interface Category {
  categoryid: string;
  categoryname: string;
}
interface Image {
  imageid: string;
  imagename: string;
  url: string;
  createdat: string;
}

interface Colour {
  colourid: number;
  colourname: string;
  hex: string;
}

interface Product {
  productid: number;
  productname: string;
  description: string;
  unitprice: string;
  rating: string;
  categoryid: number;
  soldqty: number;
  createdat: string;
  updatedat: string;
  typeid: number;
  image: Image[];
  colour: Colour[];
}

//category side bar
const ChevronRightIcon = (props: any) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ItemCounter = ({ number }: { number: number }) => (
  <div className="flex items-center gap-1 text-default-400">
    <span className="text-small">{number}</span>
    <ChevronRightIcon className="text-xl" />
  </div>
);
//category side bar end

//1.
//get side bar categories by typeid
const getSidebarCategoryByType = () => {
  const typeid = 1; //men typeid=1
  return fetch(`${process.env.BACKEND_URL}/api/categories/${typeid}`)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      //console.log(result.category);
      //result.category -> categoryid, categoryname, createdat, updatedat
      return result.category;
    });
};

//2.
//get productcount by categoryid and isinstock
const getTotalPages = (categoryid: number, isInStock: boolean, limit: number) => {
  const queryParams = new URLSearchParams();
  queryParams.append("categoryid", categoryid.toString());
  queryParams.append("isinstock", isInStock ? "1" : "0");

  return fetch(`${process.env.BACKEND_URL}/api/productsCountByCategory?${queryParams}`)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      //console.log(result.productCount);
      //result.productCount ->
      const totalPages = Math.ceil(result.productCount / limit);
      return totalPages;
    });
};

//3.
//get product with image and colour
const getProductWithImageAndColour = (categoryid: number, noOfItems: number, currentPage: number, isInStock: boolean) => {
  const limit = noOfItems;
  const offset = (currentPage - 1) * limit;

  const queryParams = new URLSearchParams();
  queryParams.append("categoryid", categoryid.toString());
  queryParams.append("limit", limit.toString());
  queryParams.append("offset", offset.toString());
  queryParams.append("isinstock", isInStock ? "1" : "0");
  console.log(categoryid, noOfItems, currentPage, isInStock);

  return fetch(`${process.env.BACKEND_URL}/api/ProductsWithImageAndColour?${queryParams}`)
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      console.log(result);
      return result.product;
    });
};

export default function ManProduct() {
  const { setCurrentActivePage } = useAppState();
  const [isInStock, setIsInStock] = useState(true);
  const [noOfItems, setNoOfItems] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInvalid, setIsInvalid] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<any>([]);
  const [selectedCategoryID, setSelectedCategoryID] = useState<Set<string>>(new Set([""]));
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [productArr, setProductArr] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Function to add a new product to the array
  const addProduct = (newProduct: Product) => {
    // Use the concat method to create a new array with the new product added
    //setProductArr(prevArr => (prevArr || []).concat(newProduct));
    setProductArr((prevProductArr) => [...prevProductArr, newProduct]);
  };
  /* setArtists([
          ...artists,
          { id: nextId++, name: name }
        ]); */

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.Woman);
    getSidebarCategoryByType().then((categoryResult) => {
      setSidebarCategory(categoryResult);
      setSelectedCategoryID(new Set<string>([categoryResult[0].categoryid + ""]));

      //CONCURRENT REQUEST --> getProductData & getProductCount
      //concurrent request to fetch productdata and productcount by categoryid
      // Promise.all([
      //   getProductWithImageAndColour(categoryResult[0].categoryid, noOfItems, currentPage, isInStock),
      //   getTotalPages(categoryResult[0].categoryid, isInStock, noOfItems)
      // ])
      //   .then(([productDataArray, totalPage]: [Product[], number]) => {
      //     setProductArr(productDataArray)
      //     setTotalPages(totalPage);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   })
      getTotalPages(categoryResult[0].categoryid, isInStock, noOfItems)
        .then((totalPage: number) => {
          setTotalPages(totalPage);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, []);

  useEffect(() => {
    getProductWithImageAndColour(selectedCategoryID.values().next().value, noOfItems, currentPage, isInStock)
      .then((productDataArray: Product[]) => {
        if (productDataArray) setProductArr(productDataArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedCategoryID, currentPage, isInStock, noOfItems]);

  useEffect(() => {
    getTotalPages(selectedCategoryID.values().next().value, isInStock, noOfItems)
      .then((totalPage) => {
        console.log("HERE 1");
        console.log(totalPage);
        if (totalPage) {
          setCurrentPage(1);
          setTotalPages(totalPage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [noOfItems]);

  const handleItemsInputChange = (value: string) => {
    const newValue = parseInt(value, 10);
    if (newValue >= 2 && newValue <= 100) {
      setNoOfItems(newValue);
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  };

  //{(sidebarCategory.find((category:Category) => {if(category.categoryid === selectedCategoryID.values().next().value); return category.categoryname} ))}
  //const productDataArr = sidebarCategory.map((product: Product) => {})

  // const selectedValue = React.useMemo(
  //   () => Array.from(selectedCategoryID).join(", "),
  //   [selectedCategoryID]
  // );

  return (
    <div className="flex">
      <Listbox
        aria-label="Product Category Menu"
        //onAction={(key) => alert(key)}
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedCategoryID}
        onSelectionChange={(keys: any) => {
          setSelectedCategoryID(keys);
        }}
        className=" p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 max-w-[300px] overflow-visible shadow-small"
        itemClasses={{
          base: "px-3  rounded-none gap-3 h-12 data-[hover=true]:custom-color1",
        }}
      >
        {sidebarCategory.map((item: any, index: number) => {
          return (
            <ListboxItem key={index} className={selectedCategoryID.has(item.categoryid + "") ? "bg-zinc-300" : ""} endContent={<ItemCounter number={item.productcount} />}>
              {item.categoryname as string}
            </ListboxItem>
          );
        })}
      </Listbox>
      <div className="flex flex-col m-5 border w-full">
        {/* {(sidebarCategory.find((category:Category) => category.categoryid === selectedCategoryID.values().next().value,)).categoryname} */}
        <h1 className="text-2xl font-semibold">
          Men
          {sidebarCategory.map((c: any) => {
            const selectedIDArr = Array.from(selectedCategoryID);
            if (c.categoryid === parseInt(selectedIDArr[0])) {
              return c.categoryname;
            }
          })}{" "}
        </h1>
        <div className="flex justify-end m-2 gap-2">
          <h5 className="font-medium text-sm mt-0.5">Show Only In stock Items</h5>
          <Switch
            defaultSelected
            color="success"
            size="sm"
            onValueChange={(isSelected: boolean) => {
              setIsInStock(isSelected);
            }}
            classNames={{ thumb: "bg-custom-color1" }}
          ></Switch>
        </div>

        <div className="gap-5 m-5 grid sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          {productArr && productArr.map((item, index) => (
            <Tooltip key={index} color={"warning"} content={item.productname} className="capitalize">
              <Card shadow="sm" key={index} isPressable onPress={() => console.log("item pressed")}>
                <CardBody className="overflow-visible p-0">
                  <Image shadow="sm" radius="lg" width="100%" alt={item.productname} className="w-full object-cover h-[140px]" src={item.image[0].url} />
                </CardBody>
                <CardBody className="mt-2 py-0 ">
                  <b>{item.productname}</b>
                </CardBody>
                <CardFooter className="py-1 text-small gap-1">
                  <p className="mt-0.5">{item.rating}</p>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="fill-yellow-400 stroke-0 hover:stroke-2 stroke-yellow-400 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </CardFooter>
                <CardBody className="mb-1 py-0">
                  <p className="text-default-500">${item.unitprice}</p>
                  <div className="flex flex-row gap-2">
                    {item.colour.map((colour, index) => (
                      <span style={{ backgroundColor: `#${colour.hex}`, width: "15px", height: "15px", borderRadius: "50%" }} key={index} className="dark:border-white border-black border-1"></span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-row justify-between">
          <div className=" max-w-[100px]">
            <Input
              type="number"
              label="No of Items"
              defaultValue={noOfItems.toString()}
              min={2}
              max={100}
              labelPlacement="outside"
              isInvalid={isInvalid}
              color={isInvalid ? "danger" : "success"}
              errorMessage={isInvalid && "Please enter number between 20 and 100"}
              startContent={<div className="sm pointer-events-none flex items-center"></div>}
              onValueChange={(value: string) => {
                handleItemsInputChange(value);
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p>
              {" "}
              page {currentPage} of {totalPages}
            </p>
            <CustomPagination total={totalPages} currentPage={1} onChange={(page) => setCurrentPage(page)} />
          </div>
        </div>
      </div>
    </div>
  );
}