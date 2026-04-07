// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { IGetOrderItemData } from "@/enums/admin-order-interfaces";
import { SuccessMessage, URL } from "@/enums/global-enums";
import { IAdminOrder } from "@/enums/order-interfaces";
import { cancelOrder, confirmOrder, getOrderItem } from "@/functions/admin-order-functions";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IOrderConfirmationModalProps {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOrder: IAdminOrder;
  setSelectedOrder: React.Dispatch<React.SetStateAction<IAdminOrder | null>>;
  isOpen: boolean;
  onClose: () => void;
  processLoading: boolean;
  setProcessLoading: React.Dispatch<React.SetStateAction<boolean>>;
  action: "Confirm" | "Cancel";
}

export default function OrderConfirmationModal({ setRefresh, selectedOrder, setSelectedOrder, isOpen, onClose, processLoading, setProcessLoading, action }: IOrderConfirmationModalProps) {
  const [orderItemData, setOrderItemData] = useState<IGetOrderItemData[]>([]);
  const router = useRouter();

  useEffect(() => {
    getOrderItem(selectedOrder.orderid, selectedOrder.userid).then((result) => {
      if (result.error) {
        alert("Error in retrieving order item data!");
      } else {
        setOrderItemData(result.data || []);
      }
    });
  }, [selectedOrder]);

  useEffect(() => {
    if (!isOpen) {
      setOrderItemData([]);
      setSelectedOrder(null);
    }
  }, [isOpen]);

  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Confirmation Message</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to {action === "Confirm" ? "confirm" : "cancel"} Order #{selectedOrder.orderid}?
              </p>
              <div className="flex w-full">
                <div className="flex flex-col w-full mt-2">
                  <label className="text-[15px]">User: {selectedOrder.name}</label>
                  {orderItemData.map((item, index) => {
                    return (
                      <div key={index} className="flex max-w-full w-full mt-2">
                        <div className="w-[60px] h-[70px] relative">
                          <Image src={item.url} fill={true} alt={item.productname} />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[14px] ms-2">{item.productname}</label>
                          <label className="text-[14px] ms-2">
                            {capitaliseWord(item.colourname)}, {item.sizename}
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
              <Button color="default" variant="light" disabled={processLoading} onClick={onClose}>
                Close
              </Button>
              <Button
                color={action === "Confirm" ? "primary" : "danger"}
                disabled={processLoading}
                onClick={() => {
                  setProcessLoading(true);
                  if (action === "Confirm") {
                    confirmOrder(selectedOrder.orderid)
                      .then((result) => {
                        if (result.error) {
                          alert("Error in confirming order " + selectedOrder.orderid + "!");
                        } else {
                          if (result.message === SuccessMessage.UPDATE_SUCCESS) {
                            alert(SuccessMessage.UPDATE_SUCCESS);
                            router.push(URL.ConfirmOrder + "?orderId=" + selectedOrder.orderid);
                          } else {
                            alert("Error in confirming order " + selectedOrder.orderid + "!");
                          }
                        }
                        setProcessLoading(false);
                      })
                      .catch((error) => {
                        console.error(error);
                        setProcessLoading(false);
                        alert("Internal Server Error");
                      });
                  } else {
                    cancelOrder(selectedOrder.orderid).then((result) => {
                      if (result.error) {
                        alert("Error in cancelling order " + selectedOrder.orderid + "!");
                      } else {
                        if (result.message === SuccessMessage.UPDATE_SUCCESS) {
                          alert("Order " + selectedOrder.orderid + " has been cancelled successfully!");
                          onClose();
                          setRefresh(true);
                        } else {
                          alert("Error in cancelling order " + selectedOrder.orderid + "!");
                        }
                      }
                      setProcessLoading(false);
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
