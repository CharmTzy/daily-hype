// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import { getAdminOrder, getAdminOrderCount } from "@/functions/order-functions";
import { capitaliseWord, formatDateByMonthDayYear24Hour, formatMoney } from "@/functions/formatter";
import { Button, Chip, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { IAdminOrder } from "@/enums/order-interfaces";
import dynamic from "next/dynamic";

const OrderList = dynamic(() => import("./order-list"));
const OrderConfirmationModal = dynamic(() => import("./confirmation-modal"));

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState<IAdminOrder | null>(null);
  const [orderData, setOrderData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [orderCount, setOrderCount] = useState<number>(1);
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [processLoading, setProcessLoading] = useState<boolean>(false);
  const [action, setAction] = useState<"Cancel" | "Confirm">("Confirm");
  const [refresh, setRefresh] = useState<boolean>(true);
  const router = useRouter();

  const formatOrderList = (data: IAdminOrder[]) => {
    return data.map((item, index) => {
      return [
        item.orderid.toString(),
        <label key={index} className="text-[14px] flex justify-center text-center">
          {formatDateByMonthDayYear24Hour(item.createdat)}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          ${formatMoney(item.totalamount)}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.name}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          <Chip size="sm" color="success">
            {item.paymentstatus}
          </Chip>
        </label>,
        <label key={index} className="text-[13px] flex justify-center">
          {item.orderstatus === "cancelled" && (
            <Chip size="sm" color="danger">
              {capitaliseWord(item.orderstatus)}
            </Chip>
          )}
          {item.orderstatus === "in progress" && (
            <Chip size="sm" color="default">
              {capitaliseWord(item.orderstatus)}
            </Chip>
          )}
          {item.orderstatus === "received" && (
            <Chip size="sm" color="success">
              {capitaliseWord(item.orderstatus)}
            </Chip>
          )}
          {item.orderstatus === "delivered" && (
            <Chip size="sm" color="warning">
              {capitaliseWord(item.orderstatus)}
            </Chip>
          )}
          {item.orderstatus === "confirmed" && (
            <Chip size="sm" color="primary">
              {capitaliseWord(item.orderstatus)}
            </Chip>
          )}
        </label>,
        <div className="flex justify-center" key={index}>
          {item.orderstatus === "in progress" && (
            <div className="flex flex-col justify-center items-center">
              <Button
                color="primary"
                className="mb-2"
                size="sm"
                onClick={() => {
                  setSelectedOrder(item);
                  setAction("Confirm");
                  onOpen();
                }}
              >
                Confirm
              </Button>
              <Button
                color="danger"
                size="sm"
                onClick={() => {
                  setSelectedOrder(item);
                  setAction("Cancel");
                  onOpen();
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          {["cancelled", "confirmed", "delivered", "received"].includes(item.orderstatus) && <label className="text-center">-</label>}
        </div>,
      ] as [string, ...React.ReactNode[]];
    });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.OrderList);
  }, []);

  useEffect(() => {
    if (refresh) {
      Promise.all([getAdminOrderCount(), getAdminOrder(0, limit)])
        .then(([result1, result2]) => {
          if (result1.error || result2.error) {
            if (result1.error === ErrorMessage.UNAURHOTIZED) {
              alert(ErrorMessage.UNAURHOTIZED);
              router.push(URL.SignOut);
            }
          } else {
            setOrderCount(result1.count ?? 1);
            setOrderData(formatOrderList(result2.data || []));
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

  useEffect(() => {
    if (isLoading && !refresh) {
      getAdminOrder(pageNo, limit).then((result) => {
        const data = result.data || [];
        setOrderData(formatOrderList(data));
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return (
    <>
      {!refresh && <OrderList orderCount={orderCount} orderData={orderData} pageNo={pageNo} setLimit={setLimit} setPageNo={setPageNo} />}
      {selectedOrder && <OrderConfirmationModal setRefresh={setRefresh} setSelectedOrder={setSelectedOrder} selectedOrder={selectedOrder} isOpen={isOpen} onClose={onClose} action={action} processLoading={processLoading} setProcessLoading={setProcessLoading} />}
    </>
  );
}
