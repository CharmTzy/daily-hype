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
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const type = types.filter((t, index) => selectedTypes[index]).map((t) => t.typeid);
      const colour = colours.filter((c, index) => selectedColours[index]).map((c) => c.colourid);
      const size = sizes.filter((s, index) => selectedSizes[index]).map((s) => s.sizeid);
      const category = categories.filter((c, index) => selectedCategories[index]).map((c) => c.categoryid);

      Promise.all([getProductFilter(type, colour, size, category, 8, (pageNo - 1) * 8), getProductFilterCount(type, colour, size, category)]).then(([result1, result2]) => {
        if (result1.error) {
          console.error(result1.error);
        } else {
          const data = result1.data || [];
          setProducts(data);
        }
        if (result2.error) {
          console.error(result2.error);
        } else {
          const count = result2.data || 1;
          setTotalProduct(count);
        }
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [selectedCategories, selectedColours, selectedSizes, selectedTypes]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const type = types.filter((t, index) => selectedTypes[index]).map((t) => t.typeid);
      const colour = colours.filter((c, index) => selectedColours[index]).map((c) => c.colourid);
      const size = sizes.filter((s, index) => selectedSizes[index]).map((s) => s.sizeid);
      const category = categories.filter((c, index) => selectedCategories[index]).map((c) => c.categoryid);

      getProductFilter(type, colour, size, category, 8, (pageNo - 1) * 8).then((result) => {
        if (result.error) {
          console.error(result.error);
        } else {
          const data = result.data || [];
          setProducts(data);
        }
      });
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [pageNo]);

  return (
    <>
      <div className="flex flex-col w-100 max-w-full">
        <div className="flex w-full justify-between px-12">
          <div className="flex mt-4">
            <label className="text-xl uppercase font-semibold mb-2">Explore Now</label>
          </div>
          <div className="mt-6 pr-[6%]">
            <label className="text-sm text-slate-600 dark:text-slate-400">
              {totalProduct} {totalProduct === 0 ? "item" : "items"} found
            </label>
          </div>
        </div>
        <div className="flex w-full px-12 my-4">
          <div className="flex flex-col w-[150px]">
            {types && types.length > 0 && (
              <>
                <div className="flex flex-col w-full">
                  <label className="text-[15px] mb-2">Type</label>
                  {types.map((t, index) => {
                    return (
                      <CheckBox
                        key={index}
                        checked={selectedTypes[index]}
                        func={() => {
                          setPageNo(1);
                          setSelectedTypes((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                          });
                        }}
                        labelClassName="me-auto text-slate-600 dark:text-slate-400 text-small cursor-pointer mt-[1px]"
                        label={capitaliseWord(t.typename)}
                      />
                    );
                  })}
                </div>
                <hr className="my-4" />
              </>
            )}
            {categories && categories.length > 0 && (
              <>
                <div className="flex flex-col w-full">
                  <label className="text-[15px] mb-2">Category</label>
                  {categories.map((c, index) => {
                    return (
                      <CheckBox
                        key={index}
                        checked={selectedCategories[index]}
                        func={() => {
                          setPageNo(1);
                          setSelectedCategories((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                          });
                        }}
                        labelClassName="me-auto text-slate-600 dark:text-slate-400 text-small cursor-pointer mt-[1px]"
                        label={capitaliseWord(c.categoryname)}
                      />
                    );
                  })}
                </div>
                <hr className="my-4" />
              </>
            )}
            {colours && colours.length > 0 && (
              <>
                <div className="flex flex-col w-full">
                  <label className="text-[15px] mb-2">Colour</label>
                  {colours.map((c, index) => {
                    return (
                      <CheckBox
                        key={index}
                        checked={selectedColours[index]}
                        func={() => {
                          setPageNo(1);
                          setSelectedColours((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                          });
                        }}
                        labelClassName="me-auto text-slate-600 dark:text-slate-400 text-small cursor-pointer mt-[1px]"
                        label={capitaliseWord(c.colourname)}
                      />
                    );
                  })}
                </div>
                <hr className="my-4" />
              </>
            )}
            {sizes && sizes.length > 0 && (
              <>
                <div className="flex flex-col w-full">
                  <label className="text-[15px] mb-2">Size</label>
                  {sizes.map((s, index) => {
                    return (
                      <CheckBox
                        key={index}
                        checked={selectedSizes[index]}
                        func={() => {
                          setPageNo(1);
                          setSelectedSizes((prev) => {
                            const newArr = [...prev];
                            newArr[index] = !newArr[index];
                            return newArr;
                          });
                        }}
                        labelClassName="me-auto uppercase text-slate-600 dark:text-slate-400 text-small cursor-pointer mt-[1px]"
                        label={s.sizename}
                      />
                    );
                  })}
                </div>
                <hr className="my-4" />
              </>
            )}
          </div>
          <ProductList data={products} />
        </div>
        {totalProduct > 8 && (
          <CustomPagination
            currentPage={pageNo}
            total={Math.ceil(totalProduct / 8)}
            onChange={(curernt) => {
              setPageNo(curernt);
            }}
            className="mb-4 mr-4"
          />
        )}
      </div>
    </>
  );
}
