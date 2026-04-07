// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

"use client";

import { IGetOrderItemByOrderIDData } from "@/enums/refund-interfaces";
import { IProductDetailsWithNames } from "@/enums/product-interfaces";
import { createRefundRequest, getOrderItemByOrderID } from "@/functions/refund-functions";
import { updateProductDetailQuantity } from "@/functions/admin-product-functions";


import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Input } from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface IProductDetailProps {
    isOpen: boolean;
    onClose: () => void;
    onModalClose: () => void;
    productDetails: IProductDetailsWithNames;
}

export default function DetailUpdate({ isOpen, onClose, onModalClose, productDetails }: IProductDetailProps) {
    const [quantity, setQuantity] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [productData, setProductData] = useState<IGetOrderItemByOrderIDData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setQuantity(productDetails.quantity);
        // getOrderItemByOrderID(orderID).then((result) => {
        //   if (result.error) {
        //     alert("Error in retrieving product data!");
        //   } else {
        //     console.log(result.data);
        //     setProductData(result.data || []);
        //   }
        // });
    }, []);

    return (
        <Modal size="xl" isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Update Product</ModalHeader>
                        <ModalBody>
                            <div className="flex w-[500px]">
                                <div className="flex flex-col min-w-[150px]">
                                    <label className="">Product Detail ID:</label>
                                    <label className="mt-[40px]">Colour:</label>
                                    <label className="mt-[40px]">Size:</label>
                                    <label className="mt-[40px]">Qunatity:</label>
                                </div>
                                <div className="flex me-auto ms-8 min-w-[150px] flex-col mb-4">
                                    <label>{productDetails.productdetailid}</label>
                                    <select
                                        disabled
                                        className="mt-[20px] px-4 py-4 text-[15px] bg-default-200 dark:bg-default-700 border-r-8 outline-none cursor-pointer"

                                    >
                                        <option key={productDetails.colourid} value={productDetails.colourid}>
                                            {productDetails.colour}
                                        </option>
                                    </select>
                                    <select
                                        disabled
                                        className="mt-[20px] px-4 py-4 text-[15px] bg-default-200 dark:bg-default-700 border-r-8 outline-none cursor-pointer"

                                    >
                                        <option key={productDetails.sizeid} value={productDetails.sizeid}>
                                            {productDetails.size}
                                        </option>
                                    </select>
                                    <Input
                                        value={quantity}
                                        onValueChange={setQuantity}
                                        className="mt-3 px-2 py-2 text-[15px] dark:bg-default-700"
                                    />
                                </div>
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                className="disabled:cursor-not-allowed"
                                color="primary"
                                disabled={quantity == undefined || isLoading}
                                onPress={() => {
                                    const productdetail = {
                                        productdetailid: productDetails.productdetailid,
                                        quantity: quantity
                                    }
                                    setIsLoading(true);
                                    updateProductDetailQuantity(productdetail).then(() => {
                                        alert("Successfully Updated");
                                        setIsLoading(false);
                                        onModalClose();
                                        onClose();
                                    })

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
