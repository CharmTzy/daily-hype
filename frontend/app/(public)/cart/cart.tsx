// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CartItemSkeleton from "@/app/(public)/cart/cart-item-skeleton";
import { getCartDetail, removeItemFromCart } from "@/functions/cart-functions";
import { ICartDetail } from "@/enums/cart-interfaces";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import SelectAllCheckBox from "./select-all-checkbox";
import CartSummary from "./cart-summary";
import { removeDuplicateCartData } from "@/functions/cart-utils";

const CartItem = dynamic(() => import("@/app/(public)/cart/cart-item"), { loading: () => <CartItemSkeleton /> });

export default function Cart() {
  const { cart, setCart, headerCanLoad, userInfo, setCurrentActivePage } = useAppState();

  const [cartDetail, setCartDetail] = useState<ICartDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [disableCheckBox, setDisableCheckBox] = useState<boolean[]>([]);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [reload, setReload] = useState<boolean>(false);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);

  const isAuthenticated = userInfo !== null;
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);
    if (headerCanLoad) {
      getCartDetail(isAuthenticated, cart || []).then((result) => {
        if (result.error) {
          if (result.error === ErrorMessage.UNAURHOTIZED) {
            alert("Unauthorized Access!");
            router.push(URL.SignOut);
          } else if (result.error === ErrorMessage.TokenExpired) {
            alert("Token Expired");
            router.push(URL.SignOut);
          }
        } else {
          const data = result.data || [];
          const cart = result.cart || [];
          setCart(cart);
          localStorage.setItem("cart", JSON.stringify(cart));
          setCartDetail(data);
          setDisableCheckBox(data.map(() => false));
        }
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (deleteIndex !== -1) {
      if (isAuthenticated) {
        removeItemFromCart(cart[deleteIndex].productdetailid).then((result) => {
          if (result) {
            setCart((prev) => {
              const newArr = prev.filter((p, i) => i !== deleteIndex);
              localStorage.setItem("cart", JSON.stringify(newArr));
              return newArr;
            });
            setCartDetail((prev) => {
              const newArr = prev.filter((p, i) => i !== deleteIndex);
              return newArr;
            });
          }
        });
      } else {
        setCart((prev) => {
          const newArr = prev.filter((p, i) => i !== deleteIndex);
          localStorage.setItem("cart", JSON.stringify(newArr));
          return newArr;
        });
        setCartDetail((prev) => {
          const newArr = prev.filter((p, i) => i !== deleteIndex);
          return newArr;
        });
      }
    }
  }, [deleteIndex]);

  useEffect(() => {
    console.log("Reload: " + reload);
    if (!loading) {
      const originalCart = [...cart];
      let result = removeDuplicateCartData(cart, cartDetail);
      if (result.cart.length !== originalCart.length) {
        localStorage.setItem("cart", JSON.stringify(result.cart));
        setCart(result.cart);
        if (result.data) {
          setCartDetail(result.data);
        }
        location.reload();
      }
    }
  }, [reload]);

  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      const detail = cartDetail.find(({ detail }) => detail.some((d) => d.productdetailid === item.productdetailid));
      if (item.checked === true) {
        const unitPrice = detail ? parseFloat(detail.unitprice) : 0;
        total += item.qty * unitPrice;
      }
    });
    setSubTotal(total);

    const condition = cart.some((c) => c.checked === undefined || c.checked === false);
    if (condition) setCheckAll(false);
    else setCheckAll(true);
  }, [cart]);

  return (
    <div className="flex flex-col w-full px-16 my-8">
      <label className="text-xl font-semibold">Shopping Cart</label>
      <div className="flex flex-col w-full mt-8">
        <SelectAllCheckBox toShow={!loading && cartDetail.length > 0} checkAll={checkAll} setCheckAll={setCheckAll} setCart={setCart} disabled={disableCheckBox.some((d) => d === true)} />
        <div className="flex flex-col mt-4">
          {!loading &&
            cartDetail.map((item: ICartDetail, index: number) => {
              return <CartItem isAuthenticated={isAuthenticated} data={item} cart={cart[index]} disabledCheckBox={disableCheckBox[index]} setDisableCheckBox={setDisableCheckBox} setCart={setCart} setDeleteIndex={setDeleteIndex} setReload={setReload} index={index} key={index} />;
            })}
        </div>
        <CartSummary toShow={!loading && cartDetail.length > 0} disabled={!cart.some((c) => c.checked === true)} subTotal={subTotal} isAuthenticated={isAuthenticated} theme={theme || "light"} />
      </div>
    </div>
  );
}
