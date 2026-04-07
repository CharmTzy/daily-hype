// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import CustomTab from "@/components/ui/tab";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import RevenueReport from "./revenue-report";

const MonthlyReport = dynamic(() => import("@/app/(admin)/stats/order/monthly-report"));

const tabLabels = ["Revenue", "Monthly"];

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.OrderStat);
  }, []);

  return (
    <>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-4">
          <label className="text-large font-semibold">Order Statistics</label>
        </div>
        <CustomTab setSelectedTabValue={setCurrentTabValue} itemLabels={tabLabels} />
        {currentTabValue === 0 && <RevenueReport />}
        {currentTabValue === 1 && <MonthlyReport />}
      </div>
    </>
  );
}
