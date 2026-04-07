// Name: Thu Htet San

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, SuccessMessage, URL } from "@/enums/global-enums";
import { getProductList, getProductListCount, deleteProduct } from "@/functions/admin-product-functions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductList from "./product-list";
import { IProductListData } from "@/enums/admin-product-interfaces";
import Image from "next/image";
import { formatDecimal, formatMoney } from "@/functions/formatter";
import { Button } from "@nextui-org/react";

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [productData, setProductData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [productCount, setProductCount] = useState<number>(1);
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const router = useRouter();
  const [buttonClicked, setButtonClicked] = useState(false);
  const handleDeleteButtonClick = (productid: number) => {
    deleteProduct(productid + "").then((result) => {
      if (result.error) {
        console.error(result.error);
        alert(result.error);
      } else {
        alert(SuccessMessage.DELETE_SUCCESS);
        setButtonClicked(true);

      }
    });
  };

  const formatProductList = (data: IProductListData[]) => {
    return data.map((item, index) => {
      return [
        item.productid.toString(),
        <Image key={index} src={item.urls[0]} width={120} height={100} alt={item.productname} />,
        <label key={index} className="text-[14px] flex justify-center">
          {item.productname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.categoryname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          ${formatMoney(item.unitprice)}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          {formatDecimal(item.rating)}
        </label>,
        <label key={index} className="text-[13px] flex justify-center">
          {item.description}
        </label>,
        <div className="flex flex-col items-center justify-center" key={index}>
          <Button
            className="mb-2"
            color="primary"
            size="sm"
            onClick={() => router.push(URL.ProductUpdate +  item.productid)}
          >
            Update
          </Button>

          <Button color="danger" size="sm" onClick={() => handleDeleteButtonClick(item.productid)}>
            Delete
          </Button>
        </div>,
      ] as [string, ...React.ReactNode[]];
    });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.ProductList);
    Promise.all([getProductList(0, limit), getProductListCount()]).then(([result1, result2]) => {
      if (result1.error) {
        console.error(result1.error);
      } else {
        const data = result1.data || [];
        setProductData(formatProductList(data));
        if (result2.error) {
          console.error(result2.error);
        } else {
          setProductCount(result2.data || 1);
        }
      }
    });
  }, [buttonClicked]);

  useEffect(() => {
    setIsLoading(true);
  }, [pageNo]);

  useEffect(() => {
    setPageNo(0);
    setIsLoading(true);
  }, [limit]);

  useEffect(() => {
    if (isLoading) {
      getProductList(pageNo, limit).then((result) => {
        const data = result.data || [];
        setProductData(formatProductList(data));
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return <ProductList pageNo={pageNo} productCount={productCount} productData={productData} setLimit={setLimit} setPageNo={setPageNo} />;
}
