// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { URL } from "@/enums/global-enums";
import { OrderStatusValue } from "@/enums/order-enums";
import { Tab, Tabs } from "@nextui-org/react";

interface IOrderTab {
  initialLoadComplete: boolean;
  selectedTab: OrderStatusValue;
  totalOrder: number;
}

export default function OrderTab({ initialLoadComplete, selectedTab, totalOrder }: IOrderTab) {
  return (
    <div className="mb-4 flex justify-between items-center">
      <Tabs classNames={{ tab: "data-[selected=true]:bg-gradient-to-r from-custom-color1 to-custom-color2", tabContent: "group-data-[selected=true]:text-white", cursor: "bg-gradient-to-r from-custom-color1 to-custom-color2" }} aria-label="Options" selectedKey={selectedTab}>
        <Tab key={OrderStatusValue.All} href={URL.AllOrder} title="All"></Tab>
        <Tab key={OrderStatusValue.InProgress} href={URL.InProgressOrder} title="In Progress"></Tab>
        <Tab key={OrderStatusValue.Confirmed} href={URL.ConfirmedOrder} title="Confirmed"></Tab>
        <Tab key={OrderStatusValue.Delivered} href={URL.DeliveredOrder} title="Delivered"></Tab>
        <Tab key={OrderStatusValue.Received} href={URL.ReceivedOrder} title="Received"></Tab>
        <Tab key={OrderStatusValue.Cancelled} href={URL.CancelledOrder} title="Cancelled"></Tab>
        <Tab key={OrderStatusValue.Returned} href={URL.ReturnedOrder} title="Returned"></Tab>
      </Tabs>
      {initialLoadComplete && <label className="text-slate-700 text-sm dark:text-slate-300">{totalOrder <= 1 ? totalOrder + " item" : totalOrder + " items"} found</label>}
    </div>
  );
}
