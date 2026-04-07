// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02
// this layout is taken from shein website

"use client";

import { Accordion, AccordionItem, Divider, Link, Selection } from "@nextui-org/react";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBarLink from "./sidebar-link";

export default function SideBar() {
  const { currentActivePage } = useAppState();
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const router = useRouter();

  useEffect(() => {
    const storedKeys = localStorage.getItem("selectedKeys");
    if (storedKeys) {
      setSelectedKeys(new Set(JSON.parse(storedKeys)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedKeys", JSON.stringify(Array.from(selectedKeys)));
  }, [selectedKeys]);

  return (
    <div className="flex flex-col basis-1/5 items-start min-w-[200px]">
      <Link href={URL.Personal} className="mb-1 text-[16px] text-black font-semibold dark:text-white">
        Personal Center
      </Link>
      <Accordion selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} className="m-0 p-0" selectionMode="multiple" isCompact itemClasses={{ heading: "mb-0" }}>
        <AccordionItem key="1" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="My Account" title="My Account">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.Profile} label="My Profile" active={currentActivePage === CurrentActivePage.Profile} />
            <SideBarLink url={URL.AddressBook} label="Address Book" active={currentActivePage === CurrentActivePage.AddressBook} />
          </div>
        </AccordionItem>
        <AccordionItem key="2" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="My Orders" title="My Orders">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.AllOrder} label="All Orders" active={currentActivePage === CurrentActivePage.AllOrder} />
            <SideBarLink url={URL.InProgressOrder} label="In Progress Orders" active={currentActivePage === CurrentActivePage.InProgressOrder} />
            <SideBarLink url={URL.ConfirmedOrder} label="Confirmed Orders" active={currentActivePage === CurrentActivePage.ConfirmedOrder} />
            <SideBarLink url={URL.DeliveredOrder} label="Delivered Orders" active={currentActivePage === CurrentActivePage.DeliveredOrder} />
            <SideBarLink url={URL.ReceivedOrder} label="Received Orders" active={currentActivePage === CurrentActivePage.ReceivedOrder} />
            <SideBarLink url={URL.CancelledOrder} label="Cancelled Orders" active={currentActivePage === CurrentActivePage.CancelledOrder} />
            <SideBarLink url={URL.ReturnedOrder} label="Returned Orders" active={currentActivePage === CurrentActivePage.ReturnedOrder} />
          </div>
        </AccordionItem>
        <AccordionItem key="3" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="My Deliveries" title="My Deliveries">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.Delivery} label="All Deliveries" active={currentActivePage === CurrentActivePage.AllDelivery} />
          </div>
        </AccordionItem>
        <AccordionItem key="4" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="My Reviews" title="My Reviews">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.WriteReview} label="Review List" active={currentActivePage === CurrentActivePage.ReceivedOrder} />
          </div>
        </AccordionItem>
        <AccordionItem key="5" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="Customer Service" title="Customer Service">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.Delivery} label="Chat" active={currentActivePage === CurrentActivePage.AllDelivery} />
            <SideBarLink url={URL.ReturnedOrder} label="FAQ" active={currentActivePage === CurrentActivePage.ReturnedOrder} />
          </div>
        </AccordionItem>
        <AccordionItem key="6" className="font-semibold" classNames={{ title: "text-[15px]" }} aria-label="Policy" title="Policy">
          <div className="flex flex-col cursor-default">
            <SideBarLink url={URL.ReturnedOrder} label="Shipping Info" active={currentActivePage === CurrentActivePage.ReturnedOrder} />
            <SideBarLink url={URL.ReturnedOrder} label="Return Policy" active={currentActivePage === CurrentActivePage.ReturnedOrder} />
          </div>
        </AccordionItem>
      </Accordion>
      <Divider />
      <label
        onClick={() => {
          router.push(URL.SignOut);
        }}
        className="my-2 cursor-pointer text-[15px] text-black font-semibold dark:text-white"
      >
        Sign Out
      </label>
    </div>
  );
}
