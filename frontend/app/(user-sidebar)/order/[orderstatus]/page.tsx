// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MonthValue, OrderStatusValue } from "@/enums/order-enums";
import { Button, Image, Skeleton } from "@nextui-org/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import OrderTab from "./order-tab";
import { getOrders, getOrdersCount } from "@/functions/order-functions";
import { IGetOrderData } from "@/enums/order-interfaces";
import OrderFilter from "./order-filter";

const OrderList = dynamic(() => import("@/app/(user-sidebar)/order/[orderstatus]/order-list"), {
  loading: () => (
    <div className="flex flex-col max-w-full mb-8 border-1 rounded-xl">
      <div className="flex py-4 border-b-1">
        <Skeleton className="flex basis-3/5 mx-8 rounded-lg h-6" />
        <Skeleton className="flex ms-auto basis-2/5 me-8 rounded-lg w-full h-6" />
      </div>
      <div className="flex flex-col mx-8 my-4">
        <div className="flex justify-start">
          <div className="me-5">
            <Skeleton className="flex w-[80px] rounded-lg h-[100px]" />
          </div>
          <div className="flex flex-col">
            <Skeleton className="flex w-80 h-8 rounded-lg" />
            <Skeleton className="mt-3 flex w-52 h-6 rounded-lg" />
            <Skeleton className="mt-3 flex w-32 h-6 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  ),
});
const CustomPagination = dynamic(() => import("@/components/ui/pagination"));

const statusToPageMapping = {
  [OrderStatusValue.All]: CurrentActivePage.AllOrder,
  [OrderStatusValue.InProgress]: CurrentActivePage.InProgressOrder,
  [OrderStatusValue.Confirmed]: CurrentActivePage.ConfirmedOrder,
  [OrderStatusValue.Delivered]: CurrentActivePage.DeliveredOrder,
  [OrderStatusValue.Received]: CurrentActivePage.ReceivedOrder,
  [OrderStatusValue.Cancelled]: CurrentActivePage.CancelledOrder,
  [OrderStatusValue.Returned]: CurrentActivePage.ReturnedOrder,
  [OrderStatusValue.InProgressValue]: null,
};

const statusToStatusMapping: { [key: string]: OrderStatusValue } = {
  all: OrderStatusValue.All,
  inprogress: OrderStatusValue.InProgress,
  confirmed: OrderStatusValue.Confirmed,
  delivered: OrderStatusValue.Delivered,
  received: OrderStatusValue.Received,
  cancelled: OrderStatusValue.Cancelled,
  returned: OrderStatusValue.Returned,
};

export default function Page({ params }: { params: { orderstatus: string } }) {
  const orderDivRef = useRef<HTMLDivElement>(null);
  const orderStatus = params.orderstatus;
  const router = useRouter();
  const { theme } = useTheme();

  const { setCurrentActivePage } = useAppState();
  const [searchOrder, setSearchOrder] = useState<string>("");
  const [searchMonth, setSearchMonth] = useState<MonthValue>(MonthValue.All);
  const [searchYear, setSearchYear] = useState<string>("0");
  const [showOrderNo, setShowOrderNo] = useState<number>(5);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatusValue>(statusToStatusMapping[orderStatus] || OrderStatusValue.All);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const [orderData, setOrderData] = useState<IGetOrderData[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const triggerScroll = 200; // Adjust this value based on when you want the button to appear
      setShowScrollButton(scrollY > triggerScroll);
    };
    window.addEventListener("scroll", handleScroll);

    const currentOrderStatus = statusToPageMapping[orderStatus as OrderStatusValue];

    if (currentOrderStatus) {
      setCurrentActivePage(currentOrderStatus);
      setRefresh(true);
    } else {
      alert("Invalid Order Status!");
      router.push(URL.Personal);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let typingTimeout = setTimeout(() => {
      if (!refresh && initialLoadComplete) {
        setRefresh(true);
        setCurrentPage(1);
      }
    }, 300);

    return () => {
      clearTimeout(typingTimeout);
    };
  }, [searchOrder, searchMonth, searchYear, showOrderNo]);

  useEffect(() => {
    if (!isLoading && initialLoadComplete) {
      setIsLoading(true);
      if (orderDivRef.current) orderDivRef.current.scrollIntoView();
    }
  }, [currentPage]);

  useEffect(() => {
    if (refresh) {
      Promise.all([getOrders(searchOrder, currentOrderStatus, searchMonth, searchYear, (currentPage - 1) * showOrderNo, showOrderNo), getOrdersCount(searchOrder, currentOrderStatus, searchMonth, searchYear)]).then(([result1, result2]) => {
        if (result1.error) {
        } else {
          if (result2.error) {
          } else {
            const count = result2.count ?? 0;
            setOrderCount(count);
            const data = result1.data || [];
            setOrderData(data);
          }
        }
        setInitialLoadComplete(true);
        setRefresh(false);
      });
    }
  }, [refresh]);

  useEffect(() => {
    if (isLoading && initialLoadComplete) {
      getOrders(searchOrder, currentOrderStatus, searchMonth, searchYear, (currentPage - 1) * showOrderNo, showOrderNo).then((result) => {
        if (result.error) {
        } else {
          const data = result.data || [];
          setOrderData(data);
        }
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return (
    <div ref={orderDivRef} className="flex flex-col w-full">
      <OrderTab initialLoadComplete={initialLoadComplete} selectedTab={currentOrderStatus} totalOrder={orderCount} />
      <OrderFilter searchMonth={searchMonth} searchOrder={searchOrder} searchYear={searchYear} setSearchMonth={setSearchMonth} setSearchOrder={setSearchOrder} setSearchYear={setSearchYear} setShowOrderNo={setShowOrderNo} showOrderNo={showOrderNo} />
      <OrderList initialLoadComplete={initialLoadComplete} orderData={orderData} />
      {initialLoadComplete && orderCount > 0 && Math.ceil(orderCount / showOrderNo) > 1 && <CustomPagination currentPage={currentPage} total={Math.ceil(orderCount / showOrderNo)} onChange={(current) => setCurrentPage(current)} />}
      {showScrollButton && (
        <Button
          className="fixed bottom-10 right-10 min-w-0 min-h-0 p-0 w-12 h-12 outline-none rounded-full"
          onClick={() => {
            if (orderDivRef.current) orderDivRef.current.scrollIntoView();
          }}
        >
          <Image src={theme === "dark" ? "/icons/arrow-up-dark.svg" : "/icons/arrow-up.svg"} className="w-5 h-5" alt="Top Icon" />
        </Button>
      )}
    </div>
  );
}
