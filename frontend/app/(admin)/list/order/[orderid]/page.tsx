// Name: Codex
// Description: Admin order detail page

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { IGetOrderDetailOrder, IGetOrderDetailOrderDetail } from "@/enums/admin-order-interfaces";
import { capitaliseWord, formatDateByMonthDayYear24Hour, formatMoney } from "@/functions/formatter";
import { getAdminOrderDetail } from "@/functions/order-functions";
import { Button, Chip, Spinner } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const statusColorMap: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  "in progress": "default",
  confirmed: "primary",
  delivered: "warning",
  received: "success",
  cancelled: "danger",
  returned: "danger",
};

export default function Page() {
  const params = useParams();
  const { setCurrentActivePage } = useAppState();
  const [order, setOrder] = useState<IGetOrderDetailOrder | null>(null);
  const [items, setItems] = useState<IGetOrderDetailOrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderParam = Array.isArray(params?.orderid) ? params.orderid[0] : params?.orderid;
  const orderId = Number(orderParam);

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.OrderList);
  }, [setCurrentActivePage]);

  useEffect(() => {
    if (isNaN(orderId)) {
      setError("Invalid order id.");
      setLoading(false);
      return;
    }

    getAdminOrderDetail(orderId).then((result) => {
      if (result.error) {
        setError(result.error);
      } else {
        setOrder(result.order);
        setItems(result.orderdetail);
      }
      setLoading(false);
    });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner label="Loading order details..." color="primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Order Detail</h1>
          <p className="mt-3 text-sm text-red-600">{error ?? "Unable to load this order."}</p>
          <div className="mt-5">
            <Link href={URL.OrderList}>
              <Button color="primary">Back to orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">Order #{order.orderid}</h1>
                <Chip color={statusColorMap[order.orderstatus] ?? "default"} variant="flat">
                  {capitaliseWord(order.orderstatus)}
                </Chip>
              </div>
              <p className="mt-2 text-sm text-slate-600">Placed on {formatDateByMonthDayYear24Hour(order.createdat)} by {order.name}.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={URL.OrderList}>
                <Button variant="bordered">Back to orders</Button>
              </Link>
              <Link href={URL.ConfirmOrder}>
                <Button color="primary">Delivery form</Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Customer</p>
              <p className="mt-2 text-lg font-medium text-slate-900">{order.name}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Payment Method</p>
              <p className="mt-2 text-lg font-medium capitalize text-slate-900">{order.paymentmethod}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Items</p>
              <p className="mt-2 text-lg font-medium text-slate-900">{order.totalqty}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="mt-2 text-lg font-medium text-slate-900">${formatMoney(order.totalamount)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr,1fr]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Delivery Address</p>
              <p className="mt-2 text-base leading-7 text-slate-900">{order.deliveryaddress}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Charges</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Shipping Fee</span>
                  <span>${formatMoney(order.shippingfee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST</span>
                  <span>{order.gst}%</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Total</span>
                  <span>${formatMoney(order.totalamount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
          <div className="mt-5 space-y-4">
            {items.length === 0 && <p className="text-sm text-slate-500">No order items were returned for this order.</p>}
            {items.map((item, index) => (
              <div key={`${item.productdetailid}-${index}`} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[100px,1fr,160px]">
                <div className="relative mx-auto h-[100px] w-[100px] overflow-hidden rounded-lg bg-white">
                  <Image src={item.image || "/images/image-not-found.jpg"} alt={item.productname} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">{item.productname}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-white px-3 py-1">Size: {item.size}</span>
                    <span className="rounded-full bg-white px-3 py-1">Colour: {item.colour}</span>
                    <span className="rounded-full bg-white px-3 py-1">Qty: {item.qty}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center text-sm text-slate-700 md:items-end">
                  <p>Unit price: ${formatMoney(item.unitprice)}</p>
                  <p className="mt-2 font-semibold text-slate-900">Subtotal: ${formatMoney((parseFloat(item.unitprice) * item.qty).toString())}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
