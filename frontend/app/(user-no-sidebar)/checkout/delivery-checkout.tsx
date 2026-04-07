// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { IAddress } from "@/enums/address-interfaces";
import { Chip } from "@nextui-org/react";

interface IDeliveryCheckoutProps {
  addressData: IAddress;
}

export default function DeliveryCheckout({ addressData }: IDeliveryCheckoutProps) {
  return (
    <div className="flex flex-col w-full ms-2">
      <div className="flex flex-col mt-4 w-full">
        <div className="flex items-center">
          <Chip className="mr-20" color="primary">
            {addressData.fullname}
          </Chip>
          <label>{addressData.phone}</label>
        </div>
        <div className="flex items-center mt-4">
          <label>
            Blk {addressData.block_no}, {addressData.street}
          </label>
        </div>
        <div>
          <label>{addressData.unit_no ? addressData.unit_no + ", " : ""}</label>
          <label>{addressData.building}</label>
        </div>
        <div>
          <label>Singapore {addressData.postal_code}</label>
        </div>
      </div>
    </div>
  );
}
