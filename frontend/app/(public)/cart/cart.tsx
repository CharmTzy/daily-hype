"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import CartItemSkeleton from "@/app/(public)/cart/cart-item-skeleton";
import { ICartDetail } from "@/enums/cart-interfaces";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { getCartDetail, removeItemFromCart } from "@/functions/cart-functions";
import { removeDuplicateCartData } from "@/functions/cart-utils";
import SelectAllCheckBox from "./select-all-checkbox";
import CartSummary from "./cart-summary";

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
    const router = useRouter();
    const selectedItemCount = cart.filter((item) => item.checked === true).length;

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.None);
        if (!headerCanLoad) {
            return;
        }

        getCartDetail(isAuthenticated, cart || []).then((result) => {
            if (result.error) {
                if (result.error === ErrorMessage.UNAURHOTIZED) {
                    alert("Unauthorized Access!");
                    router.push(URL.SignOut);
                }
                else if (result.error === ErrorMessage.TokenExpired) {
                    alert("Token Expired");
                    router.push(URL.SignOut);
                }
            }
            else {
                const nextCartDetail = result.data || [];
                const nextCart = result.cart || [];
                setCart(nextCart);
                localStorage.setItem("cart", JSON.stringify(nextCart));
                setCartDetail(nextCartDetail);
                setDisableCheckBox(nextCartDetail.map(() => false));
            }
            setLoading(false);
        });
    }, [headerCanLoad, isAuthenticated, router, setCart, setCurrentActivePage]);

    useEffect(() => {
        if (deleteIndex === -1 || !cart[deleteIndex]) {
            return;
        }

        if (isAuthenticated) {
            removeItemFromCart(cart[deleteIndex].productdetailid).then((result) => {
                if (result) {
                    setCart((prev) => {
                        const nextCart = prev.filter((_, index) => index !== deleteIndex);
                        localStorage.setItem("cart", JSON.stringify(nextCart));
                        return nextCart;
                    });
                    setCartDetail((prev) => prev.filter((_, index) => index !== deleteIndex));
                    setDeleteIndex(-1);
                }
            });
            return;
        }

        setCart((prev) => {
            const nextCart = prev.filter((_, index) => index !== deleteIndex);
            localStorage.setItem("cart", JSON.stringify(nextCart));
            return nextCart;
        });
        setCartDetail((prev) => prev.filter((_, index) => index !== deleteIndex));
        setDeleteIndex(-1);
    }, [cart, deleteIndex, isAuthenticated, setCart]);

    useEffect(() => {
        if (loading) {
            return;
        }

        const deduplicated = removeDuplicateCartData(cart, cartDetail);
        if (deduplicated.cart.length !== cart.length) {
            localStorage.setItem("cart", JSON.stringify(deduplicated.cart));
            setCart(deduplicated.cart);
            if (deduplicated.data) {
                setCartDetail(deduplicated.data);
            }
        }
    }, [cart, cartDetail, loading, reload, setCart]);

    useEffect(() => {
        let total = 0;
        cart.forEach((item) => {
            const detail = cartDetail.find(({ detail: productDetail }) => productDetail.some((currentDetail) => currentDetail.productdetailid === item.productdetailid));
            if (item.checked === true) {
                const unitPrice = detail ? parseFloat(detail.unitprice) : 0;
                total += item.qty * unitPrice;
            }
        });
        setSubTotal(total);
        setCheckAll(cart.length > 0 && cart.every((item) => item.checked === true));
    }, [cart, cartDetail]);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[34px] border border-[#efe6dc] bg-[#faf8f5] px-4 py-6 shadow-[0_20px_48px_rgba(15,23,42,0.04)] sm:px-6 lg:px-8">
                <section className="rounded-[28px] border border-[#ece5dc] bg-white px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Shopping Cart</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your DailyHype bag</h1>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="rounded-[22px] border border-[#f0ddd4] bg-[#fff8f3] px-4 py-3 text-sm text-slate-600">
                                <span className="font-semibold text-slate-900">{cartDetail.length}</span> item{cartDetail.length === 1 ? "" : "s"} in bag
                            </div>
                            <div className="rounded-[22px] border border-[#ffd9d2] bg-[#fff5f2] px-4 py-3 text-sm text-[#d45540]">
                                <span className="font-semibold">{selectedItemCount}</span> selected for checkout
                            </div>
                        </div>
                    </div>
                </section>

                {!loading && cartDetail.length === 0 ? (
                    <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                            Browse new arrivals and add a few favourites. We&apos;ll keep them here until you&apos;re ready to check out.
                        </p>
                        <Link
                            href={URL.Explore}
                            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
                        >
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        <SelectAllCheckBox
                            toShow={!loading && cartDetail.length > 0}
                            checkAll={checkAll}
                            setCheckAll={setCheckAll}
                            setCart={setCart}
                            disabled={disableCheckBox.some((isDisabled) => isDisabled === true)}
                            itemCount={cartDetail.length}
                            selectedCount={selectedItemCount}
                        />

                        <section className="overflow-hidden rounded-[28px] border border-[#ece5dc] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                            <div className="flex flex-col gap-3 border-b border-[#efe7de] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">DailyHype Store</p>
                                    <p className="mt-1 text-sm text-slate-500">Marketplace-inspired cart layout with your selected fashion pieces grouped in one place.</p>
                                </div>
                                <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d45540] shadow-[0_8px_20px_rgba(251,96,80,0.08)]">
                                    Ready for checkout
                                </div>
                            </div>

                            <div className="divide-y divide-[#f1e9e2]">
                                {!loading &&
                                    cartDetail.map((item: ICartDetail, index: number) => (
                                        <CartItem
                                            isAuthenticated={isAuthenticated}
                                            data={item}
                                            cart={cart[index]}
                                            disabledCheckBox={disableCheckBox[index]}
                                            setDisableCheckBox={setDisableCheckBox}
                                            setCart={setCart}
                                            setDeleteIndex={setDeleteIndex}
                                            setReload={setReload}
                                            index={index}
                                            key={`${item.productid}-${cart[index]?.productdetailid || index}`}
                                        />
                                    ))}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-[#efe7de] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-sm text-slate-600">
                                    Shipping perks and final tax calculations appear at checkout. Orders above <span className="font-semibold text-slate-900">$50.00</span> unlock your best delivery value.
                                </p>
                                <Link
                                    href={URL.Explore}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </section>

                        <CartSummary
                            toShow={!loading && cartDetail.length > 0}
                            disabled={!cart.some((item) => item.checked === true)}
                            subTotal={subTotal}
                            isAuthenticated={isAuthenticated}
                            itemCount={cartDetail.length}
                            selectedCount={selectedItemCount}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
