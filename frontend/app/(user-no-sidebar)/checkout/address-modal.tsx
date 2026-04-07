// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

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
  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Your Addresses</ModalHeader>
            <ModalBody>
              {addressData.map((a, index) => (
                <div key={index} className={clsx("flex flex-col w-full hover:bg-slate-200 dark:hover:bg-slate-700 p-4 cursor-pointer", index === selectedAddress && "bg-slate-200 dark:bg-slate-700")} onClick={() => setSelectedAddress(index)}>
                  <div className="flex items-center ms-4">
                    <Chip className="mr-20" color="primary">
                      {a.fullname}
                    </Chip>
                    <label>{a.phone}</label>
                  </div>
                  <div className="flex items-center mt-2 ms-4">
                    <label>
                      Blk {a.block_no}, {a.street}
                    </label>
                  </div>
                  <div className="ms-4">
                    <label>{a.unit_no ? a.unit_no + ", " : ""}</label>
                    <label>{a.building}</label>
                  </div>
                  <div className="ms-4">
                    <label>Singapore {a.postal_code}</label>
                  </div>
                </div>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
