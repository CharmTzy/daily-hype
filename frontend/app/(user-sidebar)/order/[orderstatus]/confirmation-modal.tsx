// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { SuccessMessage } from "@/enums/global-enums";
import { IGetOrderData } from "@/enums/order-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { cancelOrder, receiveOrder } from "@/functions/order-functions";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import Image from "next/image";

interface IOrderConfirmationModalProps {
  orderData: IGetOrderData;
  isOpen: boolean;
  onClose: () => void;
  action: "Cancel" | "Received";
  processLoading: boolean;
  setProcessLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OrderConfirmationModal({ orderData, isOpen, onClose, action, processLoading, setProcessLoading }: IOrderConfirmationModalProps) {
  return (
    <Modal size="3xl" isOpen={isOpen} hideCloseButton={true} isDismissable={false} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Confirmation Message</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to {action === "Cancel" ? "cancel" : "complete"} Order #{orderData.orderid}?
              </p>
              <div className="flex w-full">
                <div className="flex flex-col w-full mt-2">
                  {orderData.productdetails.map((item, index) => {
                    return (
                      <div key={index} className="flex max-w-full w-full mt-2">
                        <div className="w-[60px] h-[70px] relative">
                          <Image src={item.image} fill={true} alt={item.productname} />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[14px] ms-2">{item.productname}</label>
                          <label className="text-[14px] ms-2">
                            {capitaliseWord(item.colour)}, {item.size}
                          </label>
                          <label className="text-[14px] ms-2">x{item.qty}</label>
                        </div>
                        <label className="text-[14px] ms-auto mt-4 mr-20">${formatMoney(item.unitprice)}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" className="disabled:cursor-not-allowed" variant="light" disabled={processLoading} onClick={onClose}>
                Close
              </Button>
              <Button
                color={action === "Cancel" ? "danger" : "success"}
                disabled={processLoading}
                className="disabled:cursor-not-allowed"
                onClick={() => {
                  setProcessLoading(true);
                  if (action === "Cancel") {
                    cancelOrder(parseInt(orderData.orderid, 10)).then((result) => {
                      if (result.error) {
                        alert("Error in cancelling order " + orderData.orderid + "!");
                      } else {
                        if (result.message === SuccessMessage.UPDATE_SUCCESS) {
                          alert("Order " + orderData.orderid + " has been cancelled successfully!");
                          window.location.reload();
                        } else {
                          alert("Error in cancelling order " + orderData.orderid + "!");
                        }
                      }
                      window.location.reload();
                    });
                  } else {
                    receiveOrder(parseInt(orderData.orderid, 10)).then((result) => {
                      if (result.error) {
                        alert("Error in updating order " + orderData.orderid + "!");
                      } else {
                        if (result.message === SuccessMessage.UPDATE_SUCCESS) {
                          alert("Order " + orderData.orderid + " has been updated to received successfully!");
                          window.location.reload();
                        } else {
                          alert("Error in updating order " + orderData.orderid + "!");
                        }
                      }
                    });
                  }
                }}
              >
                {processLoading ? <Spinner color="default" size="sm" /> : <>{action}</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
