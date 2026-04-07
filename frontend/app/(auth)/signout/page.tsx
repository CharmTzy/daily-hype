// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { URL } from "@/enums/global-enums";
import LoadingIcon from "@/icons/loading-icon";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { setUserInfo, setRedirectPage, setCart } = useAppState();
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.BACKEND_URL}/api/signout`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();
        setCart([]);
        setUserInfo(null);
        setRedirectPage(null);
        router.replace(URL.Home);
      });
  }, []);

  return (
    <div className="flex w-screen h-screen justify-center items-center">
      <LoadingIcon className="mr-4 animate-[spin_2s_ease-in-out_infinite]" />
      <label className="text-2xl uppercase tracking-wide">Signing Out</label>
    </div>
  );
}
