"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Package, Truck } from "lucide-react";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { getUserChatRooms } from "@/functions/deliv-functions";

type ChatRoom = {
    roomid: number;
    deliveryid: number;
    trackingnumber: string;
    deliverystatusdetail: string;
    deliverydate: string;
    orderid: number;
    unread_count: number;
    last_message_at: string | null;
    last_message: string | null;
};

function formatDateTime(value: string | null) {
    if (!value) return "No messages yet";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(parsed);
}

function getStatusBadgeClass(statusDetail: string) {
    switch (statusDetail) {
        case "Delivery slot confirmed and awaiting pickup": return "bg-amber-50 text-amber-700 border-amber-200";
        case "Warehouse team is packing the order": return "bg-sky-50 text-sky-700 border-sky-200";
        case "Courier is arriving today": return "bg-violet-50 text-violet-700 border-violet-200";
        case "Delivered to customer": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "Delivered and received": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
}

export default function Page() {
    const router = useRouter();
    const { setCurrentActivePage, userInfo, headerCanLoad } = useAppState();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.SupportChat);
    }, [setCurrentActivePage]);

    useEffect(() => {
        if (!headerCanLoad) return;
        if (userInfo === null) {
            router.push(URL.SignIn);
            return;
        }
        getUserChatRooms()
            .then(setRooms)
            .catch(() => setError("We could not load your chats. Please try again."))
            .finally(() => setIsLoading(false));
    }, [headerCanLoad, userInfo, router]);

    const totalUnread = rooms.reduce((sum, r) => sum + Number(r.unread_count || 0), 0);

    return (
        <div className="w-full pb-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Support</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">My Chats</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Your chat threads with admin, organised by delivery.
                        </p>
                    </div>
                    <Link
                        href={URL.Delivery}
                        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        View Deliveries
                    </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                        { label: "Total Threads", value: rooms.length, icon: <MessageSquare className="h-4 w-4" /> },
                        { label: "Unread", value: totalUnread, icon: <MessageSquare className="h-4 w-4" /> },
                        { label: "Deliveries", value: new Set(rooms.map((r) => r.deliveryid)).size, icon: <Truck className="h-4 w-4" /> },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                                <span className="text-slate-400">{stat.icon}</span>
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {error && (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="mt-5 flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <div className="text-center">
                        <Spinner size="lg" />
                        <p className="mt-3 text-sm text-slate-500">Loading chats…</p>
                    </div>
                </div>
            ) : rooms.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <MessageSquare className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">No chats yet</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Chats are opened when your order has an active delivery. Go to deliveries to start a chat.
                    </p>
                    <Link
                        href={URL.Delivery}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
                    >
                        View Deliveries
                    </Link>
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {rooms.map((room) => {
                        const unread = Number(room.unread_count || 0);
                        return (
                            <article
                                key={room.roomid}
                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 flex-1 gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                        <Package className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-900">
                                                Order #{room.orderid}
                                            </span>
                                            <span className="text-xs text-slate-400">·</span>
                                            <span className="text-sm text-slate-500">
                                                Delivery #{room.deliveryid}
                                            </span>
                                            {unread > 0 && (
                                                <span className="rounded-full bg-[#fff5f2] px-2 py-0.5 text-xs font-semibold text-[#d45540]">
                                                    {unread} unread
                                                </span>
                                            )}
                                        </div>
                                        <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(room.deliverystatusdetail)}`}>
                                            {room.deliverystatusdetail || "Unknown status"}
                                        </span>
                                        <p className="mt-1 truncate text-xs text-slate-400">
                                            {room.trackingnumber ? `Tracking: ${room.trackingnumber}` : "No tracking number"}
                                        </p>
                                        {room.last_message && (
                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                <span className="text-slate-400">Last: </span>
                                                {room.last_message}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatDateTime(room.last_message_at)}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/chatfolder/chat/${room.roomid}?data=${room.deliveryid}`}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Open Chat
                                    {unread > 0 && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fb6050] px-1 text-[10px] font-semibold">
                                            {unread}
                                        </span>
                                    )}
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
