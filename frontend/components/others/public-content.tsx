// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function PublicContent({ children }: { children: React.ReactNode }) {
  const { headerCanLoad } = useAppState();

  return (
    <>
      {headerCanLoad && (
        <>
          <Header></Header>
          <main>{children}</main>
          <Footer></Footer>
        </>
      )}
    </>
  );
}
