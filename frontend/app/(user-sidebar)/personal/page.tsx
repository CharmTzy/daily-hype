// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PersonalPage() {
  const { setCurrentActivePage } = useAppState();
  const router = useRouter();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.PersonalCenter);
  }, []);

  return <div>This is personal page</div>;
}
