"use client";
import { useAppState } from "@/app/app-provider";
import CustomTab from "@/components/ui/tab";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ProductReport from "./product-report";
import ProductReportMonthly from "./monthly-report";
const tabLabels = ["Sold Quantity", "Monthly"];
export default function Page() {
    const { setCurrentActivePage } = useAppState();
    const [currentTabValue, setCurrentTabValue] = useState(0);
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.ProductStat);
    }, []);
    return (<>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-4">
          <label className="text-large font-semibold">Product Statistics</label>
        </div>
        <CustomTab setSelectedTabValue={setCurrentTabValue} itemLabels={tabLabels}/>
        {currentTabValue === 0 && <ProductReport />}
        {currentTabValue === 1 && <ProductReportMonthly />}
      </div>
    </>);
}

