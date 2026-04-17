"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { MonthValue, OrderStatusValue } from "@/enums/order-enums";
import { getOrdersCount } from "@/functions/order-functions";
import { DEFAULT_PROFILE_IMAGE, normaliseProfileImage } from "@/functions/profile-image";

type DashboardCounts = {
    allOrders: number;
    inProgressOrders: number;
    deliveredOrders: number;
    receivedOrders: number;
    savedAddresses: number;
};

const defaultCounts: DashboardCounts = {
    allOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    receivedOrders: 0,
    savedAddresses: 0,
};

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
        </div>
    );
}

function ShortcutCard({
    title,
    description,
    href,
    actionLabel,
}: {
    title: string;
    description: string;
    href: URL;
    actionLabel: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
            <p className="text-lg font-semibold text-slate-900">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900">
                {actionLabel}
                <span className="ml-2 transition group-hover:translate-x-1">&rsaquo;</span>
            </span>
        </Link>
    );
}

export default function PersonalPage() {
    const { setCurrentActivePage, userInfo, cart } = useAppState();
    const [counts, setCounts] = useState<DashboardCounts>(defaultCounts);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.PersonalCenter);
    }, [setCurrentActivePage]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [allOrders, inProgressOrders, deliveredOrders, receivedOrders, addressResponse] = await Promise.all([
                    getOrdersCount("", OrderStatusValue.All, MonthValue.All, "0"),
                    getOrdersCount("", OrderStatusValue.InProgress, MonthValue.All, "0"),
                    getOrdersCount("", OrderStatusValue.Delivered, MonthValue.All, "0"),
                    getOrdersCount("", OrderStatusValue.Received, MonthValue.All, "0"),
                    fetch(`${process.env.BACKEND_URL}/api/getAllAddresses`, {
                        method: "GET",
                        credentials: "include",
                    })
                        .then((response) => response.json())
                        .catch(() => ({ addresses: [] })),
                ]);

                setCounts({
                    allOrders: allOrders.count ?? 0,
                    inProgressOrders: inProgressOrders.count ?? 0,
                    deliveredOrders: deliveredOrders.count ?? 0,
                    receivedOrders: receivedOrders.count ?? 0,
                    savedAddresses: Array.isArray(addressResponse.addresses) ? addressResponse.addresses.length : 0,
                });
            }
            finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const profileImage = normaliseProfileImage(userInfo?.image);

    return (
        <div className="w-full pb-8">
            <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-[#fff4f1] p-6 shadow-sm shadow-slate-100 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <ResilientImage
                            src={profileImage}
                            fallbackSrc={DEFAULT_PROFILE_IMAGE}
                            alt="Profile avatar"
                            width={104}
                            height={104}
                            className="h-[104px] w-[104px] rounded-full border border-slate-200 object-cover bg-white"
                        />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Personal Center</p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                Welcome back{userInfo?.name ? `, ${userInfo.name}` : ""}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                                Keep your account details up to date, review current orders, and jump back into the parts
                                of the store you use most often.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                                    {userInfo?.email}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 capitalize">
                                    Sign-in method: {userInfo?.method || "normal"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Link
                            href={URL.Profile}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Edit Profile
                        </Link>
                        <Link
                            href={URL.AllOrder}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                        >
                            View Orders
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="Orders" value={loading ? 0 : counts.allOrders} helper="All orders placed on your account" />
                <MetricCard label="In Progress" value={loading ? 0 : counts.inProgressOrders} helper="Orders still being prepared or packed" />
                <MetricCard label="Delivered" value={loading ? 0 : counts.deliveredOrders} helper="Orders that reached your destination" />
                <MetricCard label="Received" value={loading ? 0 : counts.receivedOrders} helper="Orders you have confirmed as received" />
                <MetricCard label="Saved Addresses" value={loading ? 0 : counts.savedAddresses} helper="Address book entries ready for checkout" />
            </section>

            <section className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick Access</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Manage your account faster</h2>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <ShortcutCard
                            title="Profile Settings"
                            description="Update your name, phone number, gender, and profile image from one place."
                            href={URL.Profile}
                            actionLabel="Open profile"
                        />
                        <ShortcutCard
                            title="Address Book"
                            description="Keep your delivery addresses organised so checkout stays quick and accurate."
                            href={URL.AddressBook}
                            actionLabel="Manage addresses"
                        />
                        <ShortcutCard
                            title="Order History"
                            description="Track current purchases, revisit previous orders, and take action when needed."
                            href={URL.AllOrder}
                            actionLabel="See order list"
                        />
                        <ShortcutCard
                            title="Deliveries"
                            description="Follow delivery updates, dates, and courier progress for active shipments."
                            href={URL.Delivery}
                            actionLabel="Track deliveries"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Account Snapshot</p>
                        <div className="mt-5 space-y-4 text-sm text-slate-600">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <p className="font-semibold text-slate-900">Shopping bag</p>
                                    <p className="mt-1 leading-6">Items currently saved in your cart and ready for checkout.</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                                    {cart.length}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <p className="font-semibold text-slate-900">Ready for review</p>
                                    <p className="mt-1 leading-6">Delivered items can be reviewed once you confirm receipt.</p>
                                </div>
                                <span className="rounded-full bg-[#fff1ed] px-3 py-1 text-sm font-semibold text-[#fb6050]">
                                    {loading ? 0 : counts.receivedOrders}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-slate-900">Support</p>
                                    <p className="mt-1 leading-6">Need a hand with orders, delivery, or returns? Support pages are one tap away.</p>
                                </div>
                                <Link
                                    href={URL.Help}
                                    className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                                >
                                    Help
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm shadow-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Need Assistance?</p>
                        <h2 className="mt-3 text-2xl font-semibold">We kept the useful links close.</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            Check delivery help, return guidance, or reach out directly when you need support with your account.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href={URL.Help}
                                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                            >
                                Help Centre
                            </Link>
                            <Link
                                href={URL.Contact}
                                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Contact Us
                            </Link>
                            <Link
                                href={URL.Feedback}
                                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Send Feedback
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
