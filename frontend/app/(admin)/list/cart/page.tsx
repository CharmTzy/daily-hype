// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import CartList from "./cart-list";
import { deleteAdminCart, getAdminCart, getAdminCartCount } from "@/functions/admin-cart-functions";
import { IAdminCartData } from "@/enums/admin-cart-interfaces";
import Image from "next/image";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import clsx from "clsx";

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [refresh, setRefresh] = useState<boolean>(true);
  const [selectedCart, setSelectedCart] = useState<IAdminCartData | null>(null);
  const [cartData, setCartData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [cartCount, setCartCount] = useState<number>(1);
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const formatCartList = (data: IAdminCartData[]) => {
    return data.map((item, index) => {
      return [
        item.cartid.toString(),
        <div key={index} className="mx-auto w-[70px] relative h-[70px] max-w-[70px] max-h-[70px] flex justify-center items-center overflow-hidden">
          <Image src={item.product.url} fill={true} alt={item.product.productname} />
        </div>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.name}
        </label>,
        <label key={index} className="text-[14px] flex justify-center">
          {item.product.productname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.product.colourname}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.product.sizename}
        </label>,
        <label key={index} className="text-[14px] flex justify-center capitalize">
          {item.qty}
        </label>,
        <label key={index} className={clsx("text-[14px] flex justify-center capitalize font-medium", item.product.qty <= 0 && "text-red-500", item.product.qty > 0 && "text-green-500")}>
          {item.product.qty > 0 ? "Available" : "Out of Stock"}
        </label>,
        <div className="flex justify-center" key={index}>
          <Button
            color="danger"
            size="sm"
            onClick={() => {
              setSelectedCart(item);
              onOpen();
            }}
          >
            Delete
          </Button>
        </div>,
      ] as [string, ...React.ReactNode[]];
    });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.CartList);
  }, []);

  useEffect(() => {
    if (refresh) {
      Promise.all([getAdminCartCount(), getAdminCart(0, limit)])
        .then(([result1, result2]) => {
          if (result1.error || result2.error) {
            alert("Error in getting cart data!");
          } else {
            const data = result2.data || [];
            setCartData(formatCartList(data));
            setCartCount(result1.count ?? 1);
          }
        })
        .finally(() => {
          setRefresh(false);
        });
    }
  }, [refresh]);

  useEffect(() => {
    if (!refresh) {
      setIsLoading(true);
    }
  }, [pageNo]);

  useEffect(() => {
    if (!refresh) {
      setPageNo(0);
      setIsLoading(true);
    }
  }, [limit]);

  useEffect(() => {
    if (isLoading && !refresh) {
      getAdminCart(pageNo, limit).then((result) => {
        const data = result.data || [];
        setCartData(formatCartList(data));
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return (
    <>
      {!refresh && <CartList cartCount={cartCount} cartData={cartData} pageNo={pageNo} setLimit={setLimit} setPageNo={setPageNo} />}
      {selectedCart && (
        <Modal size="2xl" isOpen={isOpen} onClose={onClose} isDismissable={false} hideCloseButton={true}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Confirmation Message</ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete Cart #{selectedCart.cartid}?</p>
                  <div className="flex w-full">
                    <div className="w-[100px] h-[100px] mt-2 relative">
                      <Image src={selectedCart.product.url} fill={true} alt={selectedCart.product.productname} />
                    </div>
                    <div className="flex flex-col ms-4 mt-2">
                      <label className="text-[15px]">Product: {selectedCart.product.productname}</label>
                      <label className="text-[15px] mt-2">User: {selectedCart.name}</label>
                      <label className={clsx("text-[15px] mt-2", selectedCart.product.qty <= 0 && "text-red-500", selectedCart.product.qty > 0 && "text-green-500")}>{selectedCart.product.qty > 0 ? "Available" : "Out of Stock"}</label>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    disabled={deleteLoading}
                    onPress={() => {
                      setDeleteLoading(true);
                      deleteAdminCart(parseInt(selectedCart.cartid, 10)).then((result) => {
                        if (result.error) {
                          alert("Error in deleting " + selectedCart.cartid + ".");
                          onClose();
                        } else {
                          alert(selectedCart.cartid + " is successfully deleted.");
                          onClose();
                          setRefresh(true);
                        }
                        setDeleteLoading(false);
                      });
                    }}
                  >
                    {deleteLoading ? <Spinner color="default" size="sm" /> : <>Delete</>}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
