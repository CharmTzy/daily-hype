// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { Button, Link, Tooltip, useDisclosure, Spinner } from "@nextui-org/react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { IGetOrderData } from "@/enums/order-interfaces";
import { capitaliseWord, formatDateByMonthDayYear, formatMoney } from "@/functions/formatter";
import { URL } from "@/enums/global-enums";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import RefundRequest from "./refund-request";

import dynamic from "next/dynamic";

const OrderConfirmationModal = dynamic(() => import("./confirmation-modal"), { ssr: false });

interface OrderListProps {
  orderData: IGetOrderData[];
  initialLoadComplete: boolean;
}

interface OrderStatusInfoText {
  "in progress": string;
  delivered: string;
  cancelled: string;
  received: string;
  confirmed: string;
  refunded: string;
}

const orderStatusInfoText: OrderStatusInfoText = {
  "in progress": "If your order is not confirmed within a week, it will be automatically cancelled.",
  delivered: "Your order is delivered and status will update to received automatically after 10 days.",
  cancelled: "Your order is cancelled and will be refunded soon.",
  confirmed: "Your order is confirmed and will be delivered soon.",
  received: "You can request refund for the order if you are not satisfied with the product.",
  refunded: "",
};

export default function OrderList({ orderData, initialLoadComplete }: OrderListProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedOrderID, setSelectedOrderID] = useState<number>(0);
  const [selectedOrder2, setSelectedOrder2] = useState<IGetOrderData | null>(null);
  const [processLoading, setProcessLoading] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpen2, onOpen: onOpen2, onClose: onClose2 } = useDisclosure();
  const [action, setAction] = useState<"Cancel" | "Received">("Cancel");

  return (
    <>
      {orderData.map((order, index) => {
        return (
          <div className="flex flex-col mb-8" key={index}>
            <div className="flex justify-start py-4 items-center border-1 rounded-tl-lg rounded-tr-lg px-6">
              <Link href={URL.UserOrderDetail + order.orderid} className="me-8 min-w-28 max-w-28 text-small cursor-pointer underline text-black dark:text-white" style={{ textUnderlineOffset: "3px" }}>
                #{order.orderid}
              </Link>
              <label className="me-auto ms-2 text-small">{formatDateByMonthDayYear(order.createdat)}</label>
              <label className="capitalize ms-auto text-small">{order.orderstatus}</label>
              {theme === "dark" ? (
                <Tooltip offset={12} content={<div className="px-2 py-2 ms-2">{orderStatusInfoText[order.orderstatus as keyof OrderStatusInfoText]}</div>}>
                  <div className="w-[15px] h-[15px] relative cursor-pointer ms-2">
                    <Image src="/icons/info-dark.svg" fill={true} alt="Info Icon" />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip offset={12} content={<div className="px-2 py-2 ms-2 max-w-lg text-small">{orderStatusInfoText[order.orderstatus as keyof OrderStatusInfoText]}</div>}>
                  <div className="w-[15px] h-[15px] cursor-pointer relative ms-2">
                    <Image src="/icons/info.svg" fill={true} alt="Info Icon" />
                  </div>
                </Tooltip>
              )}
            </div>
            <div className="border-1 pt-4">
              {order.productdetails.map((item, index) => {
                return (
                  <div className="flex px-4 mb-4 items-center" key={index}>
                    <div className="w-[80px] h-[90px] relative border-1 overflow-hidden rounded-lg">
                      <Image fill={true} src={item.image} alt={item.productname} />
                    </div>
                    <div className="flex flex-col ml-4 self-start max-w-[350px] min-w-[350px]">
                      <Link className="text-black dark:text-white text-medium cursor-pointer">{item.productname}</Link>
                      <label className="text-[14px] mt-2 text-slate-600 dark:text-slate-400">
                        Color: {capitaliseWord(item.colour)}, Size: {item.size}
                      </label>
                      <label className="mt-1 text-[14px]">x{item.qty}</label>
                    </div>
                    <label className={clsx("self-center ms-56")}>${formatMoney(item.unitprice)}</label>
                    {order.orderstatus === "received" && (
                      <Button
                        className="ms-auto"
                        color="default"
                        variant="bordered"
                        onClick={() => {
                          router.push(URL.WriteReview + `/${order.orderid}/${item.productid}`);
                        }}
                      >
                        Rate Now
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="py-3 flex-col rounded-br-lg rounded-bl-lg border-1 flex items-end">
              <label className="mr-5 mb-5 font-semibold">Total: ${formatMoney(order.totalamount)}</label>
              <div className="flex justify-end">
                {order.orderstatus === "in progress" && (
                  <Button
                    className="mr-3 disabled:cursor-not-allowed"
                    size="md"
                    disabled={processLoading}
                    color="danger"
                    onClick={() => {
                      setAction("Cancel");
                      setSelectedOrder2(order);
                      onOpen2();
                    }}
                  >
                    {processLoading ? <Spinner size="sm" color="default" /> : "Cancel Order"}
                  </Button>
                )}
                {order.orderstatus === "delivered" && (
                  <Button
                    className="mr-3 disabled:cursor-not-allowed"
                    color="success"
                    disabled={processLoading}
                    size="md"
                    onClick={() => {
                      setSelectedOrder2(order);
                      setAction("Received");
                      onOpen2();
                    }}
                  >
                    Order Received
                  </Button>
                )}
                {order.orderstatus === "received" && (
                  <Button
                    className="mr-3"
                    size="md"
                    onClick={() => {
                      setSelectedOrderID(parseInt(order.orderid, 10));
                      onOpen();
                    }}
                  >
                    Request Refund
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {initialLoadComplete && orderData.length <= 0 && (
        <div className="flex flex-col max-w-full mb-16 py-4 border-1 rounded-xl">
          <label className="text-small text-center text-red-700 dark:text-red-200 font-medium">No Order Found!</label>
        </div>
      )}
      {selectedOrderID !== 0 && <RefundRequest isOpen={isOpen} onClose={onClose} orderID={selectedOrderID} />}
      {selectedOrder2 !== null && <OrderConfirmationModal orderData={selectedOrder2} isOpen={isOpen2} onClose={onClose2} action={action} processLoading={processLoading} setProcessLoading={setProcessLoading} />}
    </>
  );
}
