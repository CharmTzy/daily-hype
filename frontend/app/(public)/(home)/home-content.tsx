"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { ILatestProductsByLimitData } from "@/enums/product-interfaces";
import CarouselItem from "./carousel-item";
import CarouselSlider from "./carousel-slider";
import LatestItem from "./latest-item";

const collectionLinks = [
    {
        label: "Explore",
        title: "Browse the full edit",
        description: "See the latest arrivals, best sellers, and every collection in one polished catalog.",
        href: URL.Explore,
    },
    {
        label: "Man",
        title: "Menswear essentials",
        description: "Clean staples, statement layers, and versatile pieces designed for everyday rotation.",
        href: URL.Man,
    },
    {
        label: "Woman",
        title: "Womenswear picks",
        description: "Soft tailoring, seasonal colour, and elevated silhouettes for work, weekends, and beyond.",
        href: URL.Woman,
    },
    {
        label: "Baby",
        title: "Gift-ready baby edit",
        description: "Easy sets and thoughtful everyday pieces that feel ready for gifting and repeat ordering.",
        href: URL.Baby,
    },
];

const storefrontBenefits = [
    {
        title: "Secure checkout",
        description: "Stripe-secured payment, address selection, and a cleaner handoff into order confirmation.",
    },
    {
        title: "Tracked delivery flow",
        description: "Keep order progress visible after checkout with account-based delivery and order updates.",
    },
    {
        title: "Refund-ready support",
        description: "Eligible issues can be handled through the built-in support, review, and refund workflows.",
    },
];

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

    const activeHeroItem = hero[activeNo] || hero[0] || null;
    return (<div className="pb-10">
      <CarouselItem data={hero} currentActiveNo={activeNo}/>
      <CarouselSlider start={0} current={activeNo} total={hero.length} func={(clickedIndex) => setActiveNo(clickedIndex)}/>
      <div className="mx-auto my-2 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200"/>
      </div>
      <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#efe6dc] bg-[#faf8f5] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Storefront Update</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              A smoother fashion-commerce flow without changing the DailyHype look.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Shop quickly, compare styles more confidently, and move from discovery to checkout with cleaner support, trust, and product guidance throughout the site.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {storefrontBenefits.map((benefit) => (
                <div key={benefit.title} className="rounded-[24px] border border-[#ece5dc] bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{benefit.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.description}</p>
                </div>
              ))}
            </div>
            {activeHeroItem ? (
              <div className="mt-6 rounded-[24px] border border-[#f0ddd4] bg-[#fff8f3] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d45540]">Current spotlight</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{activeHeroItem.productname}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Featured from the homepage hero rotation with shoppable colour and size options.
                    </p>
                  </div>
                  <Link
                    href={`${URL.ProductDetail}${activeHeroItem.productid}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View product
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div id="shop-by-collection" className="grid gap-4 sm:grid-cols-2">
            {collectionLinks.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="group flex min-h-[220px] flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)]"
              >
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {collection.label}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900 transition group-hover:text-slate-700">
                    {collection.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{collection.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div id="new-arrivals">
        <LatestItem setCart={setCart} data={justArrived.length > 0 ? justArrived : latestProduct.slice(4, 10)} title="Just Arrived"/>
      </div>
      <div id="most-popular">
        <LatestItem setCart={setCart} data={popular.length > 0 ? popular : bestSelling.slice(0, 6)} title="Most Popular"/>
      </div>
    </div>);
}
