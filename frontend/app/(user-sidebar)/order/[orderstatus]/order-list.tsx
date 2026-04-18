"use client";

import { Button, Link, Spinner, Tooltip, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { IGetOrderData } from "@/enums/order-interfaces";
import { capitaliseWord, formatDateByMonthDayYear, formatMoney } from "@/functions/formatter";
import { URL } from "@/enums/global-enums";
import RefundRequest from "./refund-request";

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
    delivered: "Confirm receipt once it arrives. Reviews and refunds become available after that step.",
    cancelled: "Your order is cancelled and the refund is being processed.",
    confirmed: "Your order is being prepared. Cancellation is still available before the parcel is delivered.",
    received: "Received items can now be reviewed or included in a refund request.",
    refunded: "",
};

export default function OrderList({ orderData, initialLoadComplete }: OrderListProps) {
    const router = useRouter();
    const [selectedOrderID, setSelectedOrderID] = useState<number>(0);
    const [selectedOrder, setSelectedOrder] = useState<IGetOrderData | null>(null);
    const [processLoading, setProcessLoading] = useState(false);
    const [action, setAction] = useState<"Cancel" | "Received">("Cancel");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isConfirmationOpen,
        onOpen: openConfirmation,
        onClose: closeConfirmation,
    } = useDisclosure();

    return (
        <>
            {orderData.map((order) => {
                const canCancel = order.orderstatus === "in progress" || order.orderstatus === "confirmed";

                return (
                    <div className="mb-8 flex flex-col" key={order.orderid}>
                        <div className="flex items-center justify-start rounded-tl-lg rounded-tr-lg border px-6 py-4">
                            <Link
                                href={URL.UserOrderDetail + order.orderid}
                                className="me-8 min-w-28 max-w-28 cursor-pointer text-small text-black underline"
                                style={{ textUnderlineOffset: "3px" }}
                            >
                                #{order.orderid}
                            </Link>
                            <label className="me-auto ms-2 text-small">
                                {formatDateByMonthDayYear(order.createdat)}
                            </label>
                            <label className="ms-auto text-small capitalize">{order.orderstatus}</label>
                            <Tooltip
                                offset={12}
                                content={
                                    <div className="ms-2 max-w-lg px-2 py-2 text-small">
                                        {orderStatusInfoText[order.orderstatus as keyof OrderStatusInfoText]}
                                    </div>
                                }
                            >
                                <div className="relative ms-2 h-[15px] w-[15px] cursor-pointer">
                                    <Image src="/icons/info.svg" fill alt="Info Icon" />
                                </div>
                            </Tooltip>
                        </div>

                        <div className="border pt-4">
                            {order.productdetails.map((item) => (
                                <div className="mb-4 flex items-center px-4" key={`${order.orderid}-${item.productdetailid}`}>
                                    <div className="relative h-[90px] w-[80px] overflow-hidden rounded-lg border">
                                        <Image fill src={item.image} alt={item.productname} />
                                    </div>

                                    <div className="ml-4 flex min-w-[350px] max-w-[350px] flex-col self-start">
                                        <Link className="cursor-pointer text-medium text-black">
                                            {item.productname}
                                        </Link>
                                        <label className="mt-2 text-[14px] text-slate-600">
                                            Color: {capitaliseWord(item.colour)}, Size: {item.size}
                                        </label>
                                        <label className="mt-1 text-[14px]">x{item.qty}</label>
                                    </div>

                                    <label className={clsx("ms-56 self-center")}>
                                        ${formatMoney(item.unitprice)}
                                    </label>

                                    {order.orderstatus === "received" ? (
                                        <Button
                                            className="ms-auto"
                                            color="default"
                                            variant="bordered"
                                            onClick={() => {
                                                router.push(
                                                    `${URL.WriteReview}/${order.orderid}/${item.productdetailid}`,
                                                );
                                            }}
                                        >
                                            {item.reviewid ? "Edit Review" : "Write Review"}
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-end rounded-br-lg rounded-bl-lg border px-4 py-3">
                            <label className="mb-5 mr-1 font-semibold">
                                Total: ${formatMoney(order.totalamount)}
                            </label>

                            <div className="flex justify-end">
                                {canCancel ? (
                                    <Button
                                        className="mr-3 disabled:cursor-not-allowed"
                                        size="md"
                                        disabled={processLoading}
                                        color="danger"
                                        onClick={() => {
                                            setAction("Cancel");
                                            setSelectedOrder(order);
                                            openConfirmation();
                                        }}
                                    >
                                        {processLoading ? (
                                            <Spinner size="sm" color="default" />
                                        ) : (
                                            "Cancel Order"
                                        )}
                                    </Button>
                                ) : null}

                                {order.orderstatus === "delivered" ? (
                                    <Button
                                        className="mr-3 disabled:cursor-not-allowed"
                                        color="success"
                                        disabled={processLoading}
                                        size="md"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setAction("Received");
                                            openConfirmation();
                                        }}
                                    >
                                        Order Received
                                    </Button>
                                ) : null}

                                {order.orderstatus === "received" ? (
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
                                ) : null}
                            </div>
                        </div>
                    </div>
                );
            })}

            {initialLoadComplete && orderData.length <= 0 ? (
                <div className="mb-16 flex max-w-full flex-col rounded-xl border py-4">
                    <label className="text-center text-small font-medium text-red-700">
                        No Order Found!
                    </label>
                </div>
            ) : null}

            {selectedOrderID !== 0 ? (
                <RefundRequest isOpen={isOpen} onClose={onClose} orderID={selectedOrderID} />
            ) : null}

            {selectedOrder !== null ? (
                <OrderConfirmationModal
                    orderData={selectedOrder}
                    isOpen={isConfirmationOpen}
                    onClose={closeConfirmation}
                    action={action}
                    processLoading={processLoading}
                    setProcessLoading={setProcessLoading}
                />
            ) : null}
        </>
    );
}
