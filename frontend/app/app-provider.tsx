// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import React, { useState, useContext, createContext, useEffect } from "react";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { ICartLocalStorage, IUserInfo } from "@/enums/global-interfaces";
import { removeDuplicateCartData } from "@/functions/cart-functions";

interface IAppStateContext {
  userInfo: IUserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo | null>>;
  currentActivePage: CurrentActivePage;
  setCurrentActivePage: React.Dispatch<React.SetStateAction<CurrentActivePage>>;
  cart: ICartLocalStorage[];
  setCart: React.Dispatch<React.SetStateAction<ICartLocalStorage[]>>;
  headerCanLoad: boolean;
  setHeaderCanLoad: React.Dispatch<React.SetStateAction<boolean>>;
  redirectPage: URL | null;
  setRedirectPage: React.Dispatch<React.SetStateAction<URL | null>>;
}

export const AppState = createContext<IAppStateContext | null>(null);

// this is the context provider component
export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null);
  const [redirectPage, setRedirectPage] = useState<URL | null>(null);
  const [currentActivePage, setCurrentActivePage] = useState<CurrentActivePage>(CurrentActivePage.None);
  const [headerCanLoad, setHeaderCanLoad] = useState<boolean>(false);
  const [cart, setCart] = useState<ICartLocalStorage[]>([]);

  useEffect(() => {
    try {
      const tempCart = JSON.parse(localStorage.getItem("cart") ?? "[]") as ICartLocalStorage[];
      if (!Array.isArray(tempCart)) {
        setCart([]);
        localStorage.removeItem("cart");
      } else {
        const isValid = tempCart.every((item: any) => {
          return item.productdetailid !== undefined && item.qty != undefined && !isNaN(item.productdetailid) && !isNaN(item.qty);
        });
        if (!isValid) {
          localStorage.removeItem("cart");
          setCart([]);
        } else {
          const tempCartProcessed = removeDuplicateCartData(tempCart).cart;
          setCart(tempCartProcessed);
          localStorage.setItem("cart", JSON.stringify(tempCartProcessed));
        }
      }
    } catch (error) {
      localStorage.removeItem("cart");
      console.error(error);
      setCart([]);
    }

    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userObj = JSON.parse(user) as IUserInfo;
        if (userObj.email && userObj.image && userObj.name && userObj.role && userObj.method && userObj.id) setUserInfo(userObj);
        else localStorage.removeItem("user");
      } catch (error) {
        console.error(error);
        setUserInfo(null);
        setRedirectPage(URL.SignOut);
      }
    }
    setHeaderCanLoad(true);
  }, []);

  return <AppState.Provider value={{ userInfo, setUserInfo, currentActivePage, setCurrentActivePage, cart, setCart, headerCanLoad, setHeaderCanLoad, redirectPage, setRedirectPage }}>{children}</AppState.Provider>;
}

/**
 *
 * This will return states and setState functiosn stored in context
 * @returns context - {userInfo, setUserInfo, currentActivePage, setCurrentActivePage, cart, setCart, headerCanLoad, setHeaderCanLoad, redirectPage, setRedirectPage}
 * @example
 * const {headerCanLoad} = useAppState();
 * if(headerCanLoad) {
 *    // call some api
 * }
 */
export function useAppState() {
  const context = useContext(AppState);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
