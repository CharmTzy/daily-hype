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
};

const defaultCounts: DashboardCounts = {
    allOrders: 0,
    inProgressOrders: 0,
};

const shortcuts = [
    { title: "Profile Settings", description: "Update your name, phone, and image.", href: URL.Profile, action: "Open" },
    { title: "Address Book", description: "Manage your saved delivery addresses.", href: URL.AddressBook, action: "Open" },
    { title: "Order History", description: "View and track all your orders.", href: URL.AllOrder, action: "Open" },
    { title: "Deliveries", description: "Follow courier progress and delivery dates.", href: URL.Delivery, action: "Open" },
];

export default function PersonalPage() {
    const { setCurrentActivePage, userInfo, cart } = useAppState();
    const [counts, setCounts] = useState<DashboardCounts>(defaultCounts);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.PersonalCenter);
    }, [setCurrentActivePage]);

    useEffect(() => {
        Promise.all([
            getOrdersCount("", OrderStatusValue.All, MonthValue.All, "0"),
            getOrdersCount("", OrderStatusValue.InProgress, MonthValue.All, "0"),
        ])
            .then(([all, inProgress]) => {
                setCounts({
                    allOrders: all.count ?? 0,
                    inProgressOrders: inProgress.count ?? 0,
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const profileImage = normaliseProfileImage(userInfo?.image);

    return (
        <div className="w-full pb-8">
            {/* Profile header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                        <ResilientImage
                            src={profileImage}
                            fallbackSrc={DEFAULT_PROFILE_IMAGE}
                            alt="Profile avatar"
                            width={80}
                            height={80}
                            className="h-20 w-20 flex-shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Personal Center</p>
                            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">
                                {userInfo?.name ? userInfo.name : "My Account"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">{userInfo?.email}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={URL.Profile}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Edit Profile
                        </Link>
                        <Link
                            href={URL.AllOrder}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                        >
                            My Orders
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total Orders</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "—" : counts.allOrders}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">In Progress</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "—" : counts.inProgressOrders}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bag Items</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{cart.length}</p>
                </div>
            </div>

            {/* Quick access */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {shortcuts.map((s) => (
                    <Link
                        key={s.title}
                        href={s.href}
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                        <div>
                            <p className="font-semibold text-slate-900">{s.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                        </div>
                        <span className="ml-4 flex-shrink-0 text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500">&rsaquo;</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
