// Name: Wai Yan Aung
// Admin No: 2234993
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import CustomTab from "@/components/ui/tab";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import UserReport from "./review-report";


const tabLabels = ["Revenue", "Daily", "Weekly", "Monthly", "Yearly", "Total Gender"];

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.ReviewStat);
  }, []);


  return (
    <>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-4">
          <label className="text-large font-semibold">Review Statistics</label>
        </div>
        <CustomTab setSelectedTabValue={setCurrentTabValue} itemLabels={tabLabels} />
        {currentTabValue === 0 && <UserReport/>}
      </div>
    </>
  );
}
