"use client";

import { CurrentActivePage } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect } from "react";

export default function KidProduct() {
  const { setCurrentActivePage } = useAppState();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.Girl);
  }, []);

  return <div>This is girl product page!</div>;
}
