"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { ILatestProductsByLimitData } from "@/enums/product-interfaces";
import CarouselItem from "./carousel-item";
import CarouselSlider from "./carousel-slider";
import LatestItem from "./latest-item";

interface IHomeContentProps {
    latestProduct: ILatestProductsByLimitData[];
    bestSelling: ILatestProductsByLimitData[];
}

export default function HomeContent({ latestProduct, bestSelling }: IHomeContentProps) {
    const { setCurrentActivePage, setCart } = useAppState();
    const [activeNo, setActiveNo] = useState<number>(0);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Home);
    }, [setCurrentActivePage]);

    const { hero, popular, justArrived } = useMemo(() => {
        const latestFeed = latestProduct || [];
        const popularFeed = bestSelling || [];
        const hero = latestFeed.slice(0, 4);
        const usedIds = new Set(hero.map((item) => item.productid));
        const popular = popularFeed.filter((item) => !usedIds.has(item.productid)).slice(0, 6);
        popular.forEach((item) => usedIds.add(item.productid));
        const justArrived = latestFeed.filter((item) => !usedIds.has(item.productid)).slice(0, 6);
        return { hero, popular, justArrived };
    }, [bestSelling, latestProduct]);

    useEffect(() => {
        const randomTime = (Math.floor(Math.random() * 3) + 8) * 1000;
        const timeoutId = setTimeout(() => {
            setActiveNo((prevActiveNo) => {
                const total = Math.max(hero.length, 1);
                return (prevActiveNo + 1 >= total ? 0 : prevActiveNo + 1);
            });
        }, randomTime);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [activeNo, hero.length]);

    return (<div className="pb-10">
      <CarouselItem data={hero} currentActiveNo={activeNo}/>
      <CarouselSlider start={0} current={activeNo} total={hero.length} func={(clickedIndex) => setActiveNo(clickedIndex)}/>
      <div id="new-arrivals">
        <LatestItem setCart={setCart} data={justArrived.length > 0 ? justArrived : latestProduct.slice(4, 10)} title="Just Arrived"/>
      </div>
      <div id="most-popular">
        <LatestItem setCart={setCart} data={popular.length > 0 ? popular : bestSelling.slice(0, 6)} title="Most Popular"/>
      </div>
    </div>);
}
