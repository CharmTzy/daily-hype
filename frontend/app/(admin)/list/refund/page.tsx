// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import RefundList from "./refund-list";
import { getAdminRefund, getAdminRefundCount } from "@/functions/admin-refund-functions";
import Image from "next/image";
import { IGetAdminRefundData } from "@/enums/admin-refund-interfaces";

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [refresh, setRefresh] = useState<boolean>(true);
  //   const [selectedCart, setSelectedCart] = useState<IAdminCartData | null>(null);
  const [refundData, setRefundData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [refundCount, setRefundCount] = useState<number>(1);
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [approveLoading, setApproveLoading] = useState<boolean>(false);

  const formatRefundList = (data: IGetAdminRefundData[]) => {
    return data.map((item, index) => {
      return [
        item.refundid.toString(),
        <div key={index} className="mx-auto w-[70px] relative h-[70px] max-w-[70px] max-h-[70px] flex justify-center items-center overflow-hidden">
          <Image src={item.url} fill={true} alt={item.productname} />
        </div>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.orderid}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.name}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.productname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.colourname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.sizename}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.refundqty}
        </label>,
        <div className="flex justify-center flex-col items-center" key={index}>
          -
        </div>,
      ] as [string, ...React.ReactNode[]];
    });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.RefundList);
  }, []);

  useEffect(() => {
    if (refresh) {
      Promise.all([getAdminRefund(pageNo, limit), getAdminRefundCount()])
        .then(([result1, result2]) => {
          if (result1.error || result2.error) {
            alert("Error in retrieving refund data");
          } else {
            const data = result1.data || [];
            setRefundCount(result2.count ?? 1);
            setRefundData(formatRefundList(data));
          }
        })
        .finally(() => {
          setRefresh(false);
        });
    }
  }, [refresh]);

  useEffect(() => {
    if (!refresh) {
      setIsLoading(true);
    }
  }, [pageNo]);

  useEffect(() => {
    if (!refresh) {
      setPageNo(0);
      setIsLoading(true);
    }
  }, [limit]);

  return <>{!refresh && <RefundList pageNo={pageNo} refundCount={refundCount} refundData={refundData} setLimit={setLimit} setPageNo={setPageNo} />}</>;
}
