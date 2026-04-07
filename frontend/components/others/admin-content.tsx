// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { ErrorMessage, URL } from "@/enums/global-enums";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSideBar from "../admin-sidebar/admin-sidebar";

export default function AdminContent({ children }: { children: React.ReactNode }) {
  const { userInfo, headerCanLoad } = useAppState();
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (userInfo === null && headerCanLoad) {
      alert(ErrorMessage.UNAURHOTIZED);
      router.push(URL.SignOut);
    } else {
      if (userInfo?.role === "customer") {
        alert(ErrorMessage.UNAURHOTIZED);
        router.push(URL.SignOut);
      }
    }
    if (headerCanLoad) {
      setTheme("light");
    }
  }, [userInfo, headerCanLoad]);

  return (
    <>
      {headerCanLoad && (
        <div className="flex">
          <AdminSideBar />
          <main className="w-full ms-[250px] overflow-hidden">{children}</main>
        </div>
      )}
    </>
  );
}
