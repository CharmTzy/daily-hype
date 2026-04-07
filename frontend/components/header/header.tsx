// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import Link from "next/link";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import ThemeIcon from "@/icons/theme-icon";
import HeaderNavLink from "./header-nav-link";
import CartLink from "./cart-link";
import HeaderProfile from "./header-profile";
import HeaderAuthButton from "./header-auth-button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// header component for user
export default function Header() {
  const { userInfo, currentActivePage, cart } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (userInfo && (userInfo.role === "admin" || userInfo.role === "manager")) {
      router.push(URL.Dashboard);
    }
  }, []);

  return (
    <header className="flex items-center h-[75px] px-12 justify-start dark:bg-slate-900 bg-white">
      <Link href={URL.Home} className="flex dark:text-slate-200 uppercase font-semibold text-slate-900 tracking-wider ml-2 laptop-3xl:text-4xl laptop-2xl:text-3xl laptop-xl:text-[28px]">
        dailyhype
      </Link>
      <div className="flex flex-1 justify-between items-center laptop-2xl:ms-8 laptop-xl:ms-4">
        <nav className="flex justify-start">
          <HeaderNavLink label="Home" url={URL.Home} active={currentActivePage === CurrentActivePage.Home} />
          <HeaderNavLink label="Explore" url={URL.Explore} active={currentActivePage === CurrentActivePage.Explore} />
          <HeaderNavLink label="Search" url={URL.Search} active={currentActivePage === CurrentActivePage.Search} />
          <HeaderNavLink label="Man" url={URL.Man} active={currentActivePage === CurrentActivePage.Man} />
          <HeaderNavLink label="Woman" url={URL.Woman} active={currentActivePage === CurrentActivePage.Woman} />
          <HeaderNavLink label="Boy" url={URL.Boy} active={currentActivePage === CurrentActivePage.Boy} />
          <HeaderNavLink label="Girl" url={URL.Girl} active={currentActivePage === CurrentActivePage.Girl} />
          <HeaderNavLink label="Baby" url={URL.Baby} active={currentActivePage === CurrentActivePage.Baby} />
        </nav>
        <nav className="flex flex-1 justify-end items-center select-none">
          <CartLink noOfItem={cart && cart.length ? cart.length : 0} />
          <ThemeIcon width={20} height={20} className="cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-2xl:ms-8 laptop-xl:ms-7" />
          <HeaderProfile userInfo={userInfo} />
          <HeaderAuthButton toShow={userInfo === null} />
        </nav>
      </div>
    </header>
  );
}
