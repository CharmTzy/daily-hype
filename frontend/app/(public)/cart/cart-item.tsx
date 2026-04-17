"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ICartDetail } from "@/enums/cart-interfaces";
import { URL } from "@/enums/global-enums";
import { ICartLocalStorage } from "@/enums/global-interfaces";
import { extractColourData, extractSizeData } from "@/functions/cart-utils";
import { formatMoney } from "@/functions/formatter";
import { updateCartData } from "@/functions/cart-functions";
import CartItemCheckbox from "./cart-item-checkbox";
import CartItemProduct from "./cart-item-product";
import CartItemColour from "./cart-item-colour";
import CartItemSize from "./cart-item-size";
import CartItemQty from "./cart-item-qty";

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

export default function CartItem({
    data,
    cart,
    setCart,
    index,
    disabledCheckBox,
    setDisableCheckBox,
    isAuthenticated,
    setReload,
    setDeleteIndex,
}: ICartItemProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [checked, setChecked] = useState<boolean>(false);
    const [selectedColourID, setSelectedColourID] = useState<number>(-1);
    const [selectedSizeID, setSelectedSizeID] = useState<number>(-1);
    const [maxQty, setMaxQty] = useState<number>(0);
    const [colourData] = useState<{ colourid: number; colour: string }[]>(extractColourData(data));
    const [sizeData, setSizeData] = useState<{ sizeid: number; size: string }[]>([]);

    useEffect(() => {
        const detail = data.detail.find((item) => item.productdetailid === cart.productdetailid);
        if (detail) {
            setSelectedColourID(detail.colourid);
            setSizeData(extractSizeData(data, detail.colourid));
            setSelectedSizeID(detail.sizeid);
            setMaxQty(detail.qty);
            setLoading(false);
        }
    }, [cart.productdetailid, data]);

    useEffect(() => {
        setDisableCheckBox((prev) => [...prev.slice(0, index), maxQty <= 0, ...prev.slice(index + 1)]);
    }, [index, maxQty, setDisableCheckBox]);

    useEffect(() => {
        if (loading || selectedColourID === -1) {
            return;
        }

        const exactDetail = data.detail.find((item) => item.colourid === selectedColourID && item.sizeid === selectedSizeID);
        const fallbackDetail = data.detail.find((item) => item.colourid === selectedColourID);
        const nextDetail = exactDetail || fallbackDetail;

        setSizeData(extractSizeData(data, selectedColourID));

        if (!nextDetail) {
            return;
        }

        if (isAuthenticated) {
            updateCartData(cart, nextDetail.productdetailid).then((result) => {
                if (result) {
                    setSelectedSizeID(nextDetail.sizeid);
                    setMaxQty(nextDetail.qty);
                    setCart((prev) => {
                        const nextCart = [...prev];
                        nextCart[index].productdetailid = nextDetail.productdetailid;
                        localStorage.setItem("cart", JSON.stringify(nextCart));
                        return nextCart;
                    });
                    setReload((prev) => !prev);
                }
            });
            return;
        }

        setSelectedSizeID(nextDetail.sizeid);
        setMaxQty(nextDetail.qty);
        setCart((prev) => {
            const nextCart = [...prev];
            nextCart[index].productdetailid = nextDetail.productdetailid;
            localStorage.setItem("cart", JSON.stringify(nextCart));
            return nextCart;
        });
        setReload((prev) => !prev);
    }, [cart, data, index, isAuthenticated, loading, selectedColourID, selectedSizeID, setCart, setReload]);

    useEffect(() => {
        if (loading || selectedSizeID === -1) {
            return;
        }

        const detail = data.detail.find((item) => item.colourid === selectedColourID && item.sizeid === selectedSizeID);
        if (!detail) {
            return;
        }

        if (isAuthenticated) {
            updateCartData(cart, detail.productdetailid).then((result) => {
                if (result) {
                    setMaxQty(detail.qty);
                    setCart((prev) => {
                        const nextCart = [...prev];
                        nextCart[index].productdetailid = detail.productdetailid;
                        localStorage.setItem("cart", JSON.stringify(nextCart));
                        return nextCart;
                    });
                    setReload((prev) => !prev);
                }
            });
            return;
        }

        setMaxQty(detail.qty);
        setCart((prev) => {
            const nextCart = [...prev];
            nextCart[index].productdetailid = detail.productdetailid;
            localStorage.setItem("cart", JSON.stringify(nextCart));
            return nextCart;
        });
        setReload((prev) => !prev);
    }, [cart, data, index, isAuthenticated, loading, selectedColourID, selectedSizeID, setCart, setReload]);

    useEffect(() => {
        if (!loading) {
            setCart((prev) => {
                const nextCart = [...prev];
                nextCart[index].checked = checked;
                localStorage.setItem("cart", JSON.stringify(nextCart));
                return nextCart;
            });
        }
    }, [checked, index, loading, setCart]);

    useEffect(() => {
        if (cart.checked !== undefined) {
            setChecked(cart.checked);
        }
    }, [cart.checked]);

    const lineTotal = useMemo(() => parseFloat(data.unitprice) * cart.qty, [cart.qty, data.unitprice]);

    return (
        <div className="px-4 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_140px_140px_140px_120px] lg:items-center lg:gap-4">
                <div className="min-w-0">
                    <div className="flex items-start gap-4">
                        <div className="pt-2">
                            <CartItemCheckbox checked={checked} setChecked={setChecked} disabled={disabledCheckBox} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <CartItemProduct productid={data.productid} url={data.url[0]} productname={data.productname} qty={maxQty} />
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 pl-8 sm:grid-cols-2 lg:max-w-[430px] lg:pl-[8.5rem]">
                        <CartItemColour onChange={(colourid) => setSelectedColourID(colourid)} loading={loading} value={selectedColourID} data={colourData} />
                        <CartItemSize loading={loading} onChange={(sizeid) => setSelectedSizeID(sizeid)} value={selectedSizeID} data={sizeData} />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#faf7f3] px-4 py-3 lg:block lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">Unit Price</span>
                    <div className="text-right lg:text-left">
                        <p className="text-lg font-semibold text-slate-900">${formatMoney(data.unitprice)}</p>
                        <p className="mt-1 text-xs text-slate-400">Per piece</p>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#faf7f3] px-4 py-3 lg:block lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">Quantity</span>
                    <CartItemQty
                        qty={cart.qty}
                        handleQtyChange={(newQty) => {
                            if (newQty <= 0) {
                                alert("The quantity cannot be 0!");
                            }
                            else if (newQty > maxQty) {
                                alert("You have reached the maximum amount of stock for this product!");
                            }
                            else if (isAuthenticated) {
                                updateCartData({ productdetailid: cart.productdetailid, qty: newQty }, cart.productdetailid).then((result) => {
                                    if (result) {
                                        setCart((prev) => {
                                            const nextCart = [...prev];
                                            nextCart[index].qty = newQty;
                                            localStorage.setItem("cart", JSON.stringify(nextCart));
                                            return nextCart;
                                        });
                                    }
                                });
                            }
                            else {
                                setCart((prev) => {
                                    const nextCart = [...prev];
                                    nextCart[index].qty = newQty;
                                    localStorage.setItem("cart", JSON.stringify(nextCart));
                                    return nextCart;
                                });
                            }
                        }}
                        disabled={maxQty <= 0}
                    />
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#fff8f3] px-4 py-3 lg:block lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">Total</span>
                    <div className="text-right lg:text-left">
                        <p className="text-lg font-semibold text-[#d45540]">${formatMoney(lineTotal.toString())}</p>
                        <p className="mt-1 text-xs text-slate-400">For this row</p>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#faf7f3] px-4 py-3 lg:block lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">Actions</span>
                    <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-2">
                        <button
                            className="text-sm font-medium text-slate-600 transition hover:text-red-500"
                            onClick={() => setDeleteIndex(index)}
                            type="button"
                        >
                            Delete
                        </button>
                        <Link href={`${URL.ProductDetail}${data.productid}`} className="text-sm font-medium text-[#d45540] transition hover:text-[#b84335]">
                            View item
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
