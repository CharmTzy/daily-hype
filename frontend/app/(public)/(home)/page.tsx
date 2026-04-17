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
    const [activeNo, setActiveNo] = useState<number>(0);
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const buildSections = () => {
        const latestFeed = latestProduct || [];
        const popularFeed = bestSelling || [];
        const hero = latestFeed.slice(0, 4);
        const usedIds = new Set(hero.map((item) => item.productid));
        const popular = popularFeed.filter((item) => !usedIds.has(item.productid)).slice(0, 6);
        popular.forEach((item) => usedIds.add(item.productid));
        const justArrived = latestFeed.filter((item) => !usedIds.has(item.productid)).slice(0, 6);
        return { hero, popular, justArrived };
    };
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Home);
        Promise.all([getLatestProductsByLimit(12), getBestSellingByLimit(12)]).then(([result1, result2]) => {
            if (result1.error) {
            }
            else {
                const tempLatest = result1.data || [];
                setLatestProduct(tempLatest);
            }
            if (result2.error) {
            }
            else {
                const tempBestSelling = result2.data || [];
                setBestSelling(tempBestSelling);
            }
            setDataLoading(false);
        });
    }, []);
    useEffect(() => {
        const randomTime = (Math.floor(Math.random() * 3) + 8) * 1000;
        const timeoutId = setTimeout(() => {
            setActiveNo((prevActiveNo) => {
                const total = Math.max(buildSections().hero.length, 1);
                return (prevActiveNo + 1 >= total ? 0 : prevActiveNo + 1);
            });
        }, randomTime);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [activeNo, latestProduct, bestSelling]);
    const { hero, popular, justArrived } = buildSections();
    return (<div className="pb-10">
      {!dataLoading && (<>
          <CarouselItem data={hero} currentActiveNo={activeNo}/>
          <CarouselSlider start={0} current={activeNo} total={hero.length} func={(clickedIndex) => setActiveNo(clickedIndex)}/>
          <div className="mx-auto my-2 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-t border-slate-200"/>
          </div>
          <LatestItem setCart={setCart} data={justArrived.length > 0 ? justArrived : latestProduct.slice(4, 10)} title="Just Arrived"/>
          <LatestItem setCart={setCart} data={popular.length > 0 ? popular : bestSelling.slice(0, 6)} title="Most Popular"/>
        </>)}
      {dataLoading && (<>
          <CarouselItemSkeleton />
          <div className="mx-auto my-2 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-t border-slate-200"/>
          </div>
          <LatestItemSkeleton title="Just Arrived" total={6}/>
          <LatestItemSkeleton title="Most Popular" total={6}/>
        </>)}
    </div>);
}
