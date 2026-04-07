// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import FileInput from "@/components/ui/file-input";
import { SuccessMessage } from "@/enums/global-enums";
import { IGetOrderItemByOrderIDData } from "@/enums/refund-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { createRefundRequest, getOrderItemByOrderID } from "@/functions/refund-functions";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface IRefundRequestProps {
  isOpen: boolean;
  onClose: () => void;
  orderID: number;
}

export default function RefundRequest({ isOpen, onClose, orderID }: IRefundRequestProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [textCount, setTextCount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [productData, setProductData] = useState<IGetOrderItemByOrderIDData[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refundQty, setRefundQty] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(0);

  useEffect(() => {
    getOrderItemByOrderID(orderID).then((result) => {
      if (result.error) {
        alert("Error in retrieving product data!");
      } else {
        console.log(result.data);
        setProductData(result.data || []);
      }
    });
  }, [orderID]);

  useEffect(() => {
    if (productData.length > 0) {
      setRefundAmount(parseFloat(productData[selectedProductIndex].unitprice) * refundQty);
    }
  }, [refundQty, productData]);

  useEffect(() => {
    setRefundQty(1);
  }, [selectedProductIndex]);

  return (
    <Modal size="5xl" isOpen={isOpen} onClose={onClose} hideCloseButton={true} isDismissable={false} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Request Refund</ModalHeader>
            <ModalBody>
              <div className="flex w-full">
                <div className="flex flex-col min-w-[150px]">
                  <label>OrderID:</label>
                  <label className="mt-4">Product Name:</label>
                  <label className="mt-6">Category:</label>
                  <label className="mt-8">Reason:</label>
                  <label className="mt-32">Qty:</label>
                  <label className="mt-4">Refunded Amount:</label>
                </div>
                <div className="flex me-auto ms-8 w-full flex-col mb-4">
                  <label>{orderID}</label>
                  <select
                    value={selectedProductIndex}
                    className="mt-2 px-4 py-3 text-[15px] bg-default-200 dark:bg-default-700 border-r-8 outline-none cursor-pointer"
                    onChange={(event) => {
                      setSelectedProductIndex(parseInt(event.target.value));
                    }}
                  >
                    {productData.map((item, index) => (
                      <option key={index} value={index}>
                        {item.productname + " (" + capitaliseWord(item.colourname) + ", " + item.sizename + ")"}
                      </option>
                    ))}
                  </select>
                  <select
                    onChange={(event) => {
                      setSelectedCategory(parseInt(event.target.value));
                    }}
                    value={selectedCategory}
                    className="mt-2 px-4 py-3 text-[15px] bg-default-200 dark:bg-default-700 border-r-8 outline-none cursor-pointer"
                  >
                    <option value="1">Missing Quantity</option>
                    <option value="2">Received wrong item</option>
                    <option value="3">Damaged item</option>
                    <option value="4">Faulty product</option>
                    <option value="5">Counterfeit product</option>
                  </select>
                  <textarea
                    onChange={(event) => {
                      setTextCount(event.target.value.length);
                      setReason(event.target.value);
                    }}
                    className="mt-2 px-2 py-2 text-[15px] h-32 bg-default-200 dark:bg-default-700"
                  ></textarea>
                  <label className={clsx("ms-auto text-[12px] mt-1 text-gray-500", textCount > 500 && "text-red-600")}>{textCount} / 500</label>
                  <div className="mt-1 flex items-center">
                    <button
                      className="me-4 text-2xl select-none"
                      onClick={() => {
                        setRefundQty((prev) => {
                          if (prev - 1 <= 0) return prev;
                          return prev - 1;
                        });
                      }}
                    >
                      -
                    </button>
                    <input type="number" value={refundQty} readOnly className="select-none border-1 h-9 bg-default-200 dark:bg-default-700 outline-none ps-5 max-w-[50px] text-[15px]" />
                    <button
                      className="ms-4 text-2xl select-none"
                      onClick={() => {
                        setRefundQty((prev) => {
                          if (prev + 1 > productData[selectedProductIndex].qty) return prev;
                          return prev + 1;
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <label className="mt-3 font-semibold select-none">${formatMoney(refundAmount.toString())}</label>
                </div>
              </div>
              <FileInput limit={9} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} />
              <label className="text-[13px]">* At least 1 image is necessary for refund request.</label>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" className="disabled:cursor-not-allowed" disabled={isLoading} variant="light" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="disabled:cursor-not-allowed"
                color="primary"
                disabled={textCount > 500 || textCount === 0 || uploadedImages.length <= 0 || productData.length <= 0 || isLoading}
                onClick={() => {
                  if (productData.length > 0 && textCount <= 500 && textCount > 0 && uploadedImages.length > 0 && uploadedImages.length <= 9) {
                    setIsLoading(true);
                    createRefundRequest(orderID, productData[selectedProductIndex].productdetailid, selectedCategory, refundQty, reason.trim(), uploadedImages)
                      .then((result) => {
                        console.log(result);
                        if (result.error) {
                          alert("Error in submitting refund request!");
                        } else {
                          if (result.message === SuccessMessage.CREATE_SUCCESS) {
                            alert("Refund request submitted successfully!");
                          } else {
                            alert("Error in submitting refund request!");
                          }
                        }
                      })
                      .finally(() => {
                        window.location.reload();
                      });
                  }
                }}
              >
                {isLoading ? <Spinner color="default" size="sm" /> : <>Submit</>}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
