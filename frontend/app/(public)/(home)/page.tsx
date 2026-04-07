// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/app/app-provider";
import { getBestSellingByLimit, getLatestProductsByLimit } from "@/functions/product-functions";
import CarouselItemSkeleton from "./carousel-item-loading";
import CarouselItem from "./carousel-item";
import CarouselSlider from "./carousel-slider";
import LatestItem from "./latest-item";
import LatestItemSkeleton from "./latest-item-loading";
import { CurrentActivePage } from "@/enums/global-enums";
import { ILatestProductsByLimitData } from "@/enums/product-interfaces";

export default function Home() {
  const { setCurrentActivePage, setCart } = useAppState();
  const [latestProduct, setLatestProduct] = useState<ILatestProductsByLimitData[]>([]);
  const [bestSelling, setBestSelling] = useState<ILatestProductsByLimitData[]>([]);
  const [activeNo, setActiveNo] = useState<number>(0); // to set current active number for carousel
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.Home);
    Promise.all([getLatestProductsByLimit(4), getBestSellingByLimit(6)]).then(([result1, result2]) => {
      if (result1.error) {
      } else {
        const tempLatest = result1.data || [];
        setLatestProduct(tempLatest);
      }
      if (result2.error) {
      } else {
        const tempBestSelling = result2.data || [];
        setBestSelling(tempBestSelling);
      }
      setDataLoading(false);
    });
  }, []);

  useEffect(() => {
    const randomTime = (Math.floor(Math.random() * 3) + 8) * 1000; // 8 seconds to 11 seconds
    const timeoutId = setTimeout(() => {
      setActiveNo((prevActiveNo) => (prevActiveNo + 1 > 3 ? 0 : prevActiveNo + 1));
    }, randomTime);

    return () => {
      // Clear the previous timeout when the component is unmounted or when the effect is re-executed
      clearTimeout(timeoutId);
    };
  }, [activeNo]);

  return (
    <>
      {!dataLoading && (
        <>
          <CarouselItem data={latestProduct} currentActiveNo={activeNo} />
          <CarouselSlider start={0} current={activeNo} total={latestProduct.length} func={(clickedIndex) => setActiveNo(clickedIndex)} />
          <hr />
          <LatestItem setCart={setCart} data={bestSelling} title="Best Selling" />
          <LatestItem setCart={setCart} data={bestSelling} title="Most Popular" />
        </>
      )}
      {dataLoading && (
        <>
          <CarouselItemSkeleton />
          <hr />
          <LatestItemSkeleton title="Best Selling" total={6} />
          <LatestItemSkeleton title="Most Popular" total={6} />
        </>
      )}
    </>
  );
}
