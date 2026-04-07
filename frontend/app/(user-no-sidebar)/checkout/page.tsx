// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { IAddress } from "@/enums/address-interfaces";
import { ICheckOutCart } from "@/enums/cart-interfaces";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { ICheckOutProductDetail } from "@/enums/product-interfaces";
import { createOrder, initialiseCheckOut } from "@/functions/order-functions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StripeCheckout from "./stripe-checkout";
import OrderSummary from "./order-summary";
import DeliveryCheckout from "./delivery-checkout";
import { useDisclosure } from "@nextui-org/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReportIcon from "@mui/icons-material/Report";

const AddressModal = dynamic(() => import("./address-modal"), { ssr: false });

export default function Page() {
  const { cart, userInfo, setCurrentActivePage, setCart } = useAppState();
  const [productData, setProductData] = useState<ICheckOutProductDetail[]>([]);
  const [cartData, setCartData] = useState<ICheckOutCart[]>([]);
  const [addressData, setAddressData] = useState<IAddress[]>([]);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<number>(-1);
  const [orderID, setOrderID] = useState<number>(-1);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);
    if (userInfo === null) {
      alert(ErrorMessage.UNAURHOTIZED);
      router.push(URL.SignOut);
    } else {
      const checkedCartItems = cart.filter((c) => c.checked === true);
      if (checkedCartItems && checkedCartItems.length > 0) {
        initialiseCheckOut(checkedCartItems).then((result) => {
          if (result.error) {
            alert(result.error);
          } else {
            const clientSecret = result.clientsecret || "";
            const addressdata = result.address || [];
            const cartdata = result.cart || [];
            const productdata = result.product || [];

            setClientSecret(clientSecret);
            setCartData(cartdata);
            setProductData(productdata);
            setAddressData(addressdata);
            setSelectedAddress(addressdata.findIndex((a) => a.is_default === true));
            setIsLoading(false);

            let total = 0;
            cartdata.forEach((c, index) => {
              total += c.qty * parseFloat(productdata[index].unitprice);
            });
            total += total * 0.09 + 1.5;
            setTotalAmount(isNaN(total) ? 0 : Math.round(total * 100));
          }
        });
      } else {
        alert("You have no item selected!");
        router.push(URL.Cart);
      }
    }
  }, []);

  return (
    <div className="flex px-32 my-8 w-full justify-between">
      <div className="flex flex-col w-[650px]">
        <div className="flex items-center">
          <label className="font-semibold text-[18px]">Shipping Address</label>
          {!isLoading && selectedAddress === -1 && <ReportIcon className="ms-2 text-red-500" />}
          {selectedAddress !== -1 && (
            <label className="ms-12 text-blue-500 cursor-pointer" onClick={onOpen}>
              Edit
            </label>
          )}
        </div>
        {selectedAddress === -1 && (
          <label className="mt-3">
            Please add your shipping address&nbsp;
            <Link className="text-blue-500" href={URL.AddressBook}>
              here
            </Link>
            .
          </label>
        )}
        {selectedAddress !== -1 && <DeliveryCheckout addressData={addressData[selectedAddress]} />}
        <label className="font-semibold text-[18px] mt-8">Order Summary</label>
        <OrderSummary productData={productData} totalAmount={totalAmount} cartData={cartData} />
      </div>
      <div className="flex flex-col w-[450px]">
        <label className="font-semibold text-[18px]">Payment Information</label>
        <StripeCheckout
          orderID={orderID}
          clientSecret={clientSecret}
          isLoading={isLoading}
          totalAmount={totalAmount}
          onClick={() => {
            setIsLoading(true);
            if (selectedAddress === -1) {
              alert("Please select address");
              setIsLoading(false);
              return;
            }
            createOrder(parseInt(addressData[selectedAddress].address_id, 10), cartData).then((result) => {
              if (result.error) {
                console.error(result.error);
                alert("Order Failed");
                router.push(URL.Cart);
              } else {
                setCart((prev) => {
                  let newArr = [...prev];
                  newArr = newArr.filter((c) => c.checked !== true);
                  localStorage.setItem("cart", JSON.stringify(newArr));
                  return newArr;
                });
                setOrderID(result.orderid || -1);
              }
            });
          }}
        />
      </div>
      <AddressModal addressData={addressData} isOpen={isOpen} onClose={onClose} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />
    </div>
  );
}
