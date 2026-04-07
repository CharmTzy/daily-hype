// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { ErrorMessage, URL } from "@/enums/global-enums";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/header";
import SideBar from "@/components/user-sidebar/sidebar";
import Footer from "@/components/footer/footer";
import UserBreadCrumb from "../user-sidebar/user-breadcrumb";

export default function UserContent({ children }: { children: React.ReactNode }) {
  const { headerCanLoad, redirectPage, setRedirectPage, userInfo, currentActivePage } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (userInfo === null && headerCanLoad) {
      alert(ErrorMessage.UNAURHOTIZED);
      setRedirectPage(URL.SignOut);
    }
  }, [userInfo, headerCanLoad]);

  useEffect(() => {
    if (redirectPage === URL.SignOut && headerCanLoad) {
      router.push(URL.SignOut);
    }
  }, [redirectPage, headerCanLoad]);

  return (
    <>
      {headerCanLoad && userInfo !== null && (
        <>
          <Header></Header>
          <div className="flex max-w-full mx-10 mb-8 mt-2">
            <div className="flex flex-col basis-1/6 pe-12 ps-4">
              <UserBreadCrumb currentActivePage={currentActivePage} />
              <SideBar />
            </div>
            <main className="flex w-full max-w-full basis-5/6">{children}</main>
          </div>
          <Footer></Footer>
        </>
      )}
    </>
  );
}
