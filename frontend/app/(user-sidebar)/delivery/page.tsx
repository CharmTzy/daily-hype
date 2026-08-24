"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    MessageSquare,
    Package,
    Truck,
    Warehouse,
    ChevronRight,
} from "lucide-react";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Progress,
    Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import CustomPagination from "@/components/ui/pagination";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { formatMoney } from "@/functions/formatter";
import {
    getAllDeliveries,
    getAllDeliveriesCount,
    getCurrentUserId,
    getDeliveryStatusSteps,
} from "@/functions/deliv-functions";

type DeliveryItem = {
    name: string;
    description: string;
    image: string;
    price: string;
    quantity: number;
    colour: string;
    size: string;
};

type DeliveryRecord = {
    deliveryId: number;
    deliveryStatusDetail: string;
    orderId: number;
    orderDate: string;
    deliveryTime: string;
    estimatedDeliveryDate: string;
    deliveryAddress: string;
    shipping: {
        carrier: string;
        phone: string;
    };
    status: string;
    trackingNumber: string;
    items: DeliveryItem[];
    unreadMessageCount: number;
};

type DeliveryFilterState = {
    startDate: string;
    endDate: string;
    startOrderDate: string;
    endOrderDate: string;
    statusDetail: string;
    createdAtSortOrder: string;
    deliveryDateSortOrder: string;
};

const pageSize = 4;

const DEFAULT_DELIVERY_STEPS = [
    { label: "Confirmed", full: "Delivery slot confirmed and awaiting pickup" },
    { label: "Packing", full: "Warehouse team is packing the order" },
    { label: "On the way", full: "Courier is arriving today" },
    { label: "Delivered", full: "Delivered to customer" },
    { label: "Received", full: "Delivered and received" },
];

const defaultFilters: DeliveryFilterState = {
    startDate: "",
    endDate: "",
    startOrderDate: "",
    endOrderDate: "",
    statusDetail: "",
    createdAtSortOrder: "desc",
    deliveryDateSortOrder: "asc",
};

function getDateValue(value: string) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTimestamp(value: string) {
    return getDateValue(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function formatDateLabel(value: string) {
    const parsed = getDateValue(value);
    if (!parsed) return "TBC";
    return new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function formatDateTimeLabel(value: string) {
    const parsed = getDateValue(value);
    if (!parsed) return "To be confirmed";
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    }).format(parsed);
}

function getProgressValue(statusDetail: string, steps: { label: string; full: string }[]) {
    const index = steps.findIndex((s) => s.full === statusDetail);
    if (index === -1) return 0;
    return Math.round(((index + 1) / steps.length) * 100);
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

function getStatusDotClass(statusDetail: string) {
    switch (statusDetail) {
        case "Delivery slot confirmed and awaiting pickup": return "bg-amber-400";
        case "Warehouse team is packing the order": return "bg-sky-400";
        case "Courier is arriving today": return "bg-violet-400";
        case "Delivered to customer": return "bg-emerald-400";
        case "Delivered and received": return "bg-emerald-400";
        default: return "bg-slate-400";
    }
}

function getDeliveryStageIndex(statusDetail: string, steps: { label: string; full: string }[]) {
    const index = steps.findIndex((s) => s.full === statusDetail);
    return index === -1 ? 0 : index;
}

function getUnreadMessageCount(delivery: DeliveryRecord) {
    return Number(delivery.unreadMessageCount || 0);
}

function getItemQuantity(item: DeliveryItem) {
    return Number(item.quantity || 0);
}

function getDeliveryUnitCount(delivery: DeliveryRecord) {
    return delivery.items.reduce((total, item) => total + getItemQuantity(item), 0);
}

function getAllUnits(deliveries: DeliveryRecord[]) {
    return deliveries.reduce((total, d) => total + getDeliveryUnitCount(d), 0);
}

function getActiveFilterCount(filters: DeliveryFilterState) {
    let count = 0;
    if (filters.statusDetail) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.startOrderDate || filters.endOrderDate) count++;
    if (filters.createdAtSortOrder !== defaultFilters.createdAtSortOrder) count++;
    if (filters.deliveryDateSortOrder !== defaultFilters.deliveryDateSortOrder) count++;
    return count;
}

function getCarrierName(delivery: DeliveryRecord) {
    return delivery.shipping?.carrier || "DailyHype Delivery";
}

function getSupportPhone(delivery: DeliveryRecord) {
    return delivery.shipping?.phone || "Not provided";
}

function getRoleName(roleValue: unknown) {
    if (typeof roleValue === "string") return roleValue;
    if (roleValue && typeof roleValue === "object" && "rolename" in roleValue) {
        return String((roleValue as { rolename?: string }).rolename || "customer");
    }
    return "customer";
}

function getPrimaryItem(delivery: DeliveryRecord) {
    return delivery.items[0] ?? null;
}

function DeliveryStepBar({ statusDetail, steps }: { statusDetail: string; steps: { label: string; full: string }[] }) {
    const stageIndex = getDeliveryStageIndex(statusDetail, steps);
    return (
        <div className="mt-4">
            <div className="flex items-center gap-0">
                {steps.map((step, index) => {
                    const isCompleted = index <= stageIndex;
                    const isCurrent = index === stageIndex;
                    return (
                        <div key={step.full} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center gap-1.5 flex-1">
                                <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                                        isCompleted
                                            ? isCurrent
                                                ? "bg-[#fb6050] text-white shadow-[0_4px_12px_rgba(251,96,80,0.35)]"
                                                : "bg-slate-900 text-white"
                                            : "border border-slate-200 bg-white text-slate-400"
                                    }`}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={`text-center text-[10px] font-semibold leading-tight ${
                                        isCompleted ? "text-slate-900" : "text-slate-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-[2px] flex-1 mx-1 rounded-full transition-colors ${
                                        index < stageIndex ? "bg-slate-900" : "bg-slate-200"
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Page() {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();

    const [deliverySteps, setDeliverySteps] = useState(DEFAULT_DELIVERY_STEPS);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>("customer");
    const [filters, setFilters] = useState<DeliveryFilterState>(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<DeliveryFilterState>(defaultFilters);
    const [page, setPage] = useState(1);
    const [deliveryData, setDeliveryData] = useState<DeliveryRecord[]>([]);
    const [totalDeliveryCount, setTotalDeliveryCount] = useState(0);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [totalActiveCount, setTotalActiveCount] = useState(0);
    const [totalDeliveredCount, setTotalDeliveredCount] = useState(0);

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AllDelivery);
    }, [setCurrentActivePage]);

    useEffect(() => {
        getDeliveryStatusSteps()
            .then(setDeliverySteps)
            .catch(() => {});
    }, []);

    const statusFilters = useMemo(() => [
        { label: "All", value: "" },
        ...deliverySteps.map((s) => ({ label: s.label, value: s.full })),
    ], [deliverySteps]);

    useEffect(() => {
        let cancelled = false;
        getCurrentUserId()
            .then((result) => {
                if (cancelled) return;
                setCurrentUserId(Number(result[0]));
                setCurrentUserRole(getRoleName(result[1]));
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) {
                    setErrorMessage("Unable to load your delivery account.");
                    setIsLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (currentUserId === null) return;
        let cancelled = false;
        setIsLoading(true);
        setErrorMessage("");

        const baseFilters = { ...appliedFilters, statusDetail: "" };
        Promise.all([
            getAllDeliveries(currentUserId, {
                ...appliedFilters,
                limit: pageSize,
                offset: (page - 1) * pageSize,
            }),
            getAllDeliveriesCount(currentUserId, appliedFilters),
            getAllDeliveriesCount(currentUserId, { ...baseFilters, statusDetail: "Delivered to customer" }),
            getAllDeliveriesCount(currentUserId, { ...baseFilters, statusDetail: "Delivered and received" }),
            getAllDeliveriesCount(currentUserId, baseFilters),
        ])
            .then(([data, count, deliveredCount, receivedCount, grandTotal]) => {
                if (cancelled) return;
                const deliveredTotal = deliveredCount + receivedCount;
                setDeliveryData(Array.isArray(data) ? data : []);
                setTotalDeliveryCount(count);
                setTotalDeliveredCount(deliveredTotal);
                setTotalActiveCount(grandTotal - deliveredTotal);
                const pageCount = Math.max(1, Math.ceil(count / pageSize));
                if (page > pageCount) setPage(1);
            })
            .catch((error) => {
                console.error(error);
                if (!cancelled) {
                    setDeliveryData([]);
                    setTotalDeliveryCount(0);
                    setErrorMessage("We could not load your deliveries.");
                }
            })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [appliedFilters, currentUserId, page]);

    const handleFilterChange = (filterName: keyof DeliveryFilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
    };

    const handleApplyFilters = () => {
        setPage(1);
        setAppliedFilters({ ...filters });
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
        setAppliedFilters({ ...defaultFilters });
        setPage(1);
    };

    const navigateToChatRoom = async (delivery: DeliveryRecord) => {
        if (currentUserId === null) return;
        setIsChatLoading(delivery.deliveryId);
        try {
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/getRoomId?userUserID=${currentUserId}&deliveryID=${delivery.deliveryId}&role=${currentUserRole}`,
                { method: "GET", credentials: "include" },
            );
            if (!response.ok) throw new Error(response.statusText);
            const responseData = await response.json();
            const roomId = responseData.room_Id;
            if (!roomId) throw new Error("Chat room not found");
            router.push(`/chatfolder/chat/${roomId}?data=${delivery.deliveryId}`);
        } catch (error) {
            console.error(error);
            alert("Chat is not ready for this delivery yet.");
        } finally {
            setIsChatLoading(null);
        }
    };

    const unreadThreadCount = deliveryData.filter((d) => getUnreadMessageCount(d) > 0).length;
    const activeFilterCount = getActiveFilterCount(appliedFilters);
    const totalPages = Math.max(1, Math.ceil(totalDeliveryCount / pageSize));
    const showingFrom = deliveryData.length > 0 ? (page - 1) * pageSize + 1 : 0;
    const showingTo = deliveryData.length > 0 ? Math.min(totalDeliveryCount, showingFrom + deliveryData.length - 1) : 0;

    return (
        <div className="w-full pb-8">
            {/* Header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Delivery Dashboard</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Track your shipments</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Monitor delivery status, view packed items, and chat with admin from one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={URL.AllOrder}
                            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            View Orders
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                        >
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fb6050] text-[10px] font-semibold text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Active", value: totalActiveCount, icon: <Truck className="h-4 w-4" /> },
                        { label: "Delivered", value: totalDeliveredCount, icon: <CheckCircle2 className="h-4 w-4" /> },
                        { label: "Total", value: totalDeliveryCount, icon: <Package className="h-4 w-4" /> },
                        { label: "Unread", value: unreadThreadCount, icon: <MessageSquare className="h-4 w-4" /> },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                                <span className="text-slate-400">{stat.icon}</span>
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Filters panel */}
            {showFilters && (
                <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 sm:p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Filter Deliveries</p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {statusFilters.map((s) => (
                            <button
                                key={s.label}
                                type="button"
                                onClick={() => handleFilterChange("statusDetail", s.value)}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                    filters.statusDetail === s.value
                                        ? "border-slate-900 bg-slate-900 text-white"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: "Delivery From", key: "startDate" as const, value: filters.startDate },
                            { label: "Delivery To", key: "endDate" as const, value: filters.endDate },
                            { label: "Ordered From", key: "startOrderDate" as const, value: filters.startOrderDate },
                            { label: "Ordered To", key: "endOrderDate" as const, value: filters.endOrderDate },
                        ].map((field) => (
                            <label key={field.key} className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                                {field.label}
                                <input
                                    type="date"
                                    value={field.value}
                                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                />
                            </label>
                        ))}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                            Order Sort
                            <select
                                value={filters.createdAtSortOrder}
                                onChange={(e) => handleFilterChange("createdAtSortOrder", e.target.value)}
                                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                            >
                                <option value="desc">Newest first</option>
                                <option value="asc">Oldest first</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                            Delivery Sort
                            <select
                                value={filters.deliveryDateSortOrder}
                                onChange={(e) => handleFilterChange("deliveryDateSortOrder", e.target.value)}
                                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                            >
                                <option value="asc">Soonest first</option>
                                <option value="desc">Latest first</option>
                            </select>
                        </label>
                    </div>
                </section>
            )}

            {/* Results header */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Shipment Results</p>
                    <p className="mt-1 text-sm text-slate-500">
                        {deliveryData.length > 0
                            ? `Showing ${showingFrom}–${showingTo} of ${totalDeliveryCount} deliveries`
                            : isLoading
                            ? "Loading..."
                            : "No deliveries found"}
                    </p>
                </div>
                <CustomPagination
                    currentPage={page}
                    total={totalPages}
                    onChange={(current) => setPage(current)}
                    className="justify-end"
                />
            </div>

            {/* Error */}
            {errorMessage && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
                    {errorMessage}
                </div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <div className="text-center">
                        <Spinner size="lg" />
                        <p className="mt-3 text-sm text-slate-500">Loading deliveries…</p>
                    </div>
                </div>
            ) : deliveryData.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Package className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">No deliveries found</h3>
                    <p className="mt-2 text-sm text-slate-500">Try clearing filters or check back after placing an order.</p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {deliveryData.map((delivery) => {
                        const primaryItem = getPrimaryItem(delivery);
                        const unreadCount = getUnreadMessageCount(delivery);
                        const totalUnits = getDeliveryUnitCount(delivery);

                        return (
                            <article
                                key={delivery.deliveryId}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
                            >
                                {/* Card header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                                            Order #{delivery.orderId}
                                        </span>
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                                            Delivery #{delivery.deliveryId}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-[#fff5f2] px-3 py-1 text-xs font-semibold text-[#d45540]">
                                                {unreadCount} unread
                                            </span>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(delivery.deliveryStatusDetail)}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(delivery.deliveryStatusDetail)}`} />
                                        {delivery.deliveryStatusDetail}
                                    </span>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                                        <div>
                                            {/* Product preview */}
                                            <div className="flex gap-4">
                                                {primaryItem && (
                                                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                                                        <ResilientImage
                                                            src={primaryItem.image}
                                                            alt={primaryItem.name}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-base font-semibold text-slate-900">
                                                        {primaryItem?.name || "Delivery package"}
                                                        {delivery.items.length > 1 && (
                                                            <span className="ml-1 text-slate-400">+{delivery.items.length - 1} more</span>
                                                        )}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {delivery.items.length} product{delivery.items.length !== 1 ? "s" : ""} · {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        <span className="font-medium text-slate-700">ETA:</span> {formatDateLabel(delivery.deliveryTime)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Step bar */}
                                            <DeliveryStepBar statusDetail={delivery.deliveryStatusDetail} steps={deliverySteps} />

                                            {/* Info grid */}
                                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        Ordered
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateLabel(delivery.orderDate)}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">{formatDateTimeLabel(delivery.orderDate)}</p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        Estimated Arrival
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateLabel(delivery.deliveryTime)}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">{formatDateTimeLabel(delivery.deliveryTime)}</p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        <Warehouse className="h-3.5 w-3.5" />
                                                        Carrier
                                                    </div>
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">{getCarrierName(delivery)}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">{delivery.trackingNumber || "Tracking pending"}</p>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        Address
                                                    </div>
                                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{delivery.deliveryAddress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions sidebar */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Actions</p>
                                            <div className="mt-4 space-y-2.5">
                                                <Button
                                                    className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white"
                                                    onClick={() => setSelectedDelivery(delivery)}
                                                >
                                                    View Details
                                                </Button>
                                                <Link
                                                    href={`${URL.UserOrderDetail}${delivery.orderId}`}
                                                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                                >
                                                    View Order
                                                </Link>
                                                <Button
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                                                    onClick={() => navigateToChatRoom(delivery)}
                                                    isDisabled={isChatLoading === delivery.deliveryId}
                                                >
                                                    {isChatLoading === delivery.deliveryId ? (
                                                        <Spinner size="sm" color="default" />
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <MessageSquare className="h-4 w-4" />
                                                            Chat With Admin
                                                            {unreadCount > 0 && (
                                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fb6050] px-1 text-[10px] font-semibold text-white">
                                                                    {unreadCount}
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>

                                            {delivery.items.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Packed Items</p>
                                                    <div className="mt-2 space-y-2">
                                                        {delivery.items.slice(0, 2).map((item, i) => (
                                                            <div key={`${delivery.deliveryId}-${item.name}-${i}`} className="flex items-center gap-3">
                                                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] bg-white">
                                                                    <ResilientImage
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        fill
                                                                        sizes="40px"
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-xs font-semibold text-slate-900">{item.name}</p>
                                                                    <p className="text-xs text-slate-500">Qty {getItemQuantity(item)} · ${formatMoney(item.price)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {delivery.items.length > 2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedDelivery(delivery)}
                                                                className="flex items-center gap-1 text-xs font-semibold text-[#d45540] transition hover:text-[#b84335]"
                                                            >
                                                                +{delivery.items.length - 2} more items
                                                                <ChevronRight className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Bottom pagination */}
            {totalPages > 1 && !isLoading && (
                <div className="mt-6 flex justify-center">
                    <CustomPagination
                        currentPage={page}
                        total={totalPages}
                        onChange={(current) => setPage(current)}
                    />
                </div>
            )}

            {/* Detail modal */}
            <Modal
                size="5xl"
                isOpen={selectedDelivery !== null}
                onClose={() => setSelectedDelivery(null)}
                backdrop="blur"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-3 border-b border-slate-100">
                                {selectedDelivery && (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Delivery #{selectedDelivery.deliveryId}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(selectedDelivery.deliveryStatusDetail)}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(selectedDelivery.deliveryStatusDetail)}`} />
                                                {selectedDelivery.deliveryStatusDetail}
                                            </span>
                                        </div>
                                        <p className="text-xl font-semibold text-slate-900">Order #{selectedDelivery.orderId}</p>
                                        <DeliveryStepBar statusDetail={selectedDelivery.deliveryStatusDetail} steps={deliverySteps} />
                                    </>
                                )}
                            </ModalHeader>

                            <ModalBody className="py-6">
                                {selectedDelivery && (
                                    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery Info</p>
                                                <div className="mt-3 space-y-2.5 text-sm text-slate-600">
                                                    <p><strong className="text-slate-900">ETA:</strong> {formatDateTimeLabel(selectedDelivery.deliveryTime)}</p>
                                                    <p><strong className="text-slate-900">Tracking:</strong> {selectedDelivery.trackingNumber || "Pending"}</p>
                                                    <p><strong className="text-slate-900">Carrier:</strong> {getCarrierName(selectedDelivery)}</p>
                                                    <p><strong className="text-slate-900">Phone:</strong> {getSupportPhone(selectedDelivery)}</p>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Delivery Address</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-600">{selectedDelivery.deliveryAddress}</p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Progress</p>
                                                <Progress
                                                    className="mt-3 max-w-full"
                                                    value={getProgressValue(selectedDelivery.deliveryStatusDetail, deliverySteps)}
                                                    color="success"
                                                />
                                                <p className="mt-2 text-right text-xs text-slate-500">
                                                    {getProgressValue(selectedDelivery.deliveryStatusDetail, deliverySteps)}% complete
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Packed Items</p>
                                                <p className="text-sm text-slate-500">{selectedDelivery.items.length} product{selectedDelivery.items.length !== 1 ? "s" : ""}</p>
                                            </div>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {selectedDelivery.items.map((item, index) => (
                                                    <article
                                                        key={`${selectedDelivery.deliveryId}-${item.name}-${index}`}
                                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                    >
                                                        <div className="relative h-36 overflow-hidden rounded-xl bg-white">
                                                            <ResilientImage
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                sizes="(max-width: 1024px) 100vw, 260px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <h4 className="mt-3 text-sm font-semibold text-slate-900">{item.name}</h4>
                                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>
                                                        <p className="mt-2 text-xs text-slate-500">{item.colour}, {item.size}</p>
                                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                                                            <span>Qty {getItemQuantity(item)}</span>
                                                            <span className="font-semibold text-[#d45540]">${formatMoney(item.price)}</span>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>

                            <ModalFooter className="border-t border-slate-100">
                                {selectedDelivery && (
                                    <>
                                        <Link
                                            href={`${URL.UserOrderDetail}${selectedDelivery.orderId}`}
                                            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            View Order
                                        </Link>
                                        <Button
                                            className="rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                                            onClick={() => navigateToChatRoom(selectedDelivery)}
                                            isDisabled={isChatLoading === selectedDelivery.deliveryId}
                                        >
                                            {isChatLoading === selectedDelivery.deliveryId ? (
                                                <Spinner size="sm" color="default" />
                                            ) : "Open Chat"}
                                        </Button>
                                    </>
                                )}
                                <Button
                                    className="rounded-full bg-slate-900 text-sm font-semibold text-white"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
