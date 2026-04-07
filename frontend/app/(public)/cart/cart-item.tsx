// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useEffect, useState } from "react";
import { ICartDetail } from "@/enums/cart-interfaces";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import CartItemCheckbox from "./cart-item-checkbox";
import { extractColourData, extractSizeData } from "@/functions/cart-utils";
import CartItemProduct from "./cart-item-product";
import CartItemColour from "./cart-item-colour";
import CartItemSize from "./cart-item-size";
import CartItemQty from "./cart-item-qty";
import { updateCartData } from "@/functions/cart-functions";

interface ICartItemProps {
  data: ICartDetail;
  cart: ICartLocalStorage;
  setCart: React.Dispatch<React.SetStateAction<ICartLocalStorage[]>>;
  index: number;
  disabledCheckBox: boolean;
  setDisableCheckBox: React.Dispatch<React.SetStateAction<boolean[]>>;
  isAuthenticated: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function CartItem({ data, cart, setCart, index, disabledCheckBox, setDisableCheckBox, isAuthenticated, setReload, setDeleteIndex }: ICartItemProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [checked, setChecked] = useState<boolean>(false);
  const [selectedColourID, setSelectedColourID] = useState<number>(-1);
  const [selectedSizeID, setSelectedSizeID] = useState<number>(-1);
  const [maxQty, setMaxQty] = useState<number>(0);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [colourData, setColourData] = useState<{ colourid: number; colour: string }[]>(extractColourData(data));
  const [sizeData, setSizeData] = useState<{ sizeid: number; size: string }[]>([]);

  useEffect(() => {
    const detail = data.detail.find((d) => d.productdetailid === cart.productdetailid);
    if (detail) {
      setSelectedColourID(detail.colourid);
      setSizeData(extractSizeData(data, detail.colourid));
      setSelectedSizeID(detail.sizeid);
      setMaxQty(detail.qty);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setDisabled(maxQty <= 0);
    setDisableCheckBox((prev) => [...prev.slice(0, index), maxQty <= 0, ...prev.slice(index + 1)]);
  }, [maxQty]);

  useEffect(() => {
    if (!loading && selectedColourID !== -1) {
      const detail = data.detail.find((d) => d.colourid === selectedColourID && d.sizeid === selectedSizeID);
      const detail2 = data.detail.find((d) => d.colourid === selectedColourID);

      if (isAuthenticated) {
        const productDetailID = detail ? detail.productdetailid : detail2 ? detail2.productdetailid : undefined;
        if (productDetailID !== undefined) {
          updateCartData(cart, productDetailID).then((result) => {
            if (result) {
              if (detail) {
                setMaxQty(detail.qty);
                setCart((prev) => {
                  const newData = [...prev];
                  newData[index].productdetailid = detail.productdetailid;
                  localStorage.setItem("cart", JSON.stringify(newData));
                  return newData;
                });
                setReload((prev) => !prev);
              } else {
                if (detail2) {
                  setSelectedSizeID(detail2.sizeid);
                  setMaxQty(detail2.qty);
                  setCart((prev) => {
                    const newData = [...prev];
                    newData[index].productdetailid = detail2.productdetailid;
                    localStorage.setItem("cart", JSON.stringify(newData));
                    return newData;
                  });
                  setReload((prev) => !prev);
                }
              }
            }
          });
        }
      } else {
        if (detail) {
          setMaxQty(detail.qty);
          setCart((prev) => {
            const newData = [...prev];
            newData[index].productdetailid = detail.productdetailid;
            localStorage.setItem("cart", JSON.stringify(newData));
            return newData;
          });
          setReload((prev) => !prev);
        } else {
          if (detail2) {
            setSelectedSizeID(detail2.sizeid);
            setMaxQty(detail2.qty);
            setCart((prev) => {
              const newData = [...prev];
              newData[index].productdetailid = detail2.productdetailid;
              localStorage.setItem("cart", JSON.stringify(newData));
              return newData;
            });
            setReload((prev) => !prev);
          }
        }
      }

      setSizeData(extractSizeData(data, selectedColourID));
    }
  }, [selectedColourID]);

  useEffect(() => {
    if (!loading && selectedSizeID !== -1) {
      const detail = data.detail.find((d) => d.colourid === selectedColourID && d.sizeid === selectedSizeID);
      if (isAuthenticated) {
        const productDetailID = detail ? detail.productdetailid : undefined;
        if (productDetailID !== undefined) {
          updateCartData(cart, productDetailID).then((result) => {
            if (result) {
              if (detail) {
                setMaxQty(detail.qty);
                setCart((prev) => {
                  const newData = [...prev];
                  newData[index].productdetailid = detail.productdetailid;
                  localStorage.setItem("cart", JSON.stringify(newData));
                  return newData;
                });
                setReload((prev) => !prev);
              }
            }
          });
        }
      } else {
        if (detail) {
          console.log("RELOAD HERE");
          setMaxQty(detail.qty);
          setCart((prev) => {
            const newData = [...prev];
            newData[index].productdetailid = detail.productdetailid;
            localStorage.setItem("cart", JSON.stringify(newData));
            return newData;
          });
          setReload((prev) => !prev);
        }
      }
    }
  }, [selectedSizeID]);

  useEffect(() => {
    if (!loading) {
      setCart((prev) => {
        const newArr = [...prev];
        newArr[index].checked = checked;
        localStorage.setItem("cart", JSON.stringify(newArr));
        return newArr;
      });
    }
  }, [checked]);

  useEffect(() => {
    if (cart.checked !== undefined) setChecked(cart.checked);
  }, [cart.checked]);

  return (
    <div className="flex w-full max-w-full items-center mt-4">
      <CartItemCheckbox checked={checked} setChecked={setChecked} disabled={disabledCheckBox} />
      <CartItemProduct url={data.url[0]} productname={data.productname} qty={maxQty} />
      <CartItemColour onChange={(colourid) => setSelectedColourID(colourid)} loading={loading} value={selectedColourID} data={colourData} />
      <CartItemSize loading={loading} onChange={(sizeid) => setSelectedSizeID(sizeid)} value={selectedSizeID} data={sizeData} />
      <CartItemQty
        qty={cart.qty}
        handleQtyChange={(newQty) => {
          if (newQty <= 0) {
            alert("The quantity cannot be 0!");
          } else if (newQty > maxQty) {
            alert("You have reached the maximum amount of stock for this product!");
          } else {
            if (isAuthenticated) {
              updateCartData({ productdetailid: cart.productdetailid, qty: newQty }, cart.productdetailid).then((result) => {
                if (result) {
                  setCart((prev) => {
                    const newArr = [...prev];
                    newArr[index].qty = newQty;
                    localStorage.setItem("cart", JSON.stringify(newArr));
                    return newArr;
                  });
                }
              });
            } else {
              setCart((prev) => {
                const newArr = [...prev];
                newArr[index].qty = newQty;
                localStorage.setItem("cart", JSON.stringify(newArr));
                return newArr;
              });
            }
          }
        }}
        handleDelete={() => setDeleteIndex(index)}
        disabled={disabled}
        price={data.unitprice}
      />
    </div>
  );
}
