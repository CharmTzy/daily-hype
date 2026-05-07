"use client";
import { IAddress } from "@/enums/address-interfaces";
import { Chip } from "@nextui-org/react";

interface IDeliveryCheckoutProps {
    addressData: IAddress;
}

export default function DeliveryCheckout({ addressData }: IDeliveryCheckoutProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <Chip color="primary" className="font-semibold">
                    {addressData.fullname}
                </Chip>
                <span className="text-sm font-medium text-slate-700">{addressData.phone}</span>
                {addressData.is_default ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200">
                        Default
                    </span>
                ) : null}
            </div>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                <p>Blk {addressData.block_no}, {addressData.street}</p>
                <p>{addressData.unit_no ? `${addressData.unit_no}, ` : ""}{addressData.building}</p>
                <p>Singapore {addressData.postal_code}</p>
            </div>
        </div>
    );
}
