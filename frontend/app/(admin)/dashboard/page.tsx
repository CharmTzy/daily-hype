// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect } from "react";

export default function Page() {
  const { setCurrentActivePage } = useAppState();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);
  }, []);

  return <div>This is admin dashboard page!</div>;
}
