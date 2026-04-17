"use client";
import { IAddress } from "@/enums/address-interfaces";
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import clsx from "clsx";
interface IAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    addressData: IAddress[];
    selectedAddress: number;
    setSelectedAddress: (index: number) => void;
}
export default function AddressModal({ isOpen, onClose, addressData, selectedAddress, setSelectedAddress }: IAddressModalProps) {
    return (<Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (<>
            <ModalHeader className="flex flex-col gap-1">Choose a delivery address</ModalHeader>
            <ModalBody>
              {addressData.map((a, index) => (<div key={index} className={clsx("flex flex-col w-full rounded-[22px] border border-slate-200 p-4 transition cursor-pointer hover:border-slate-300 hover:bg-slate-50", index === selectedAddress && "border-slate-900 bg-slate-50")} onClick={() => setSelectedAddress(index)}>
                  <div className="flex items-center ms-4 gap-3">
                    <Chip className="font-semibold" color="primary">
                      {a.fullname}
                    </Chip>
                    <label className="text-sm font-medium text-slate-700">{a.phone}</label>
                    {a.is_default ? <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ring-1 ring-slate-200">Default</span> : null}
                  </div>
                  <div className="flex items-center mt-3 ms-4 text-sm text-slate-600">
                    <label>
                      Blk {a.block_no}, {a.street}
                    </label>
                  </div>
                  <div className="ms-4 text-sm text-slate-600">
                    <label>{a.unit_no ? a.unit_no + ", " : ""}</label>
                    <label>{a.building}</label>
                  </div>
                  <div className="ms-4 text-sm text-slate-600">
                    <label>Singapore {a.postal_code}</label>
                  </div>
                </div>))}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </ModalFooter>
          </>)}
      </ModalContent>
    </Modal>);
}
