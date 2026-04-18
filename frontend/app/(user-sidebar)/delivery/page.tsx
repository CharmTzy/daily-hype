"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Filter,
    MapPin,
    MessageSquare,
    Package,
    RefreshCcw,
    ShieldCheck,
    Truck,
    Warehouse,
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
    updatechatleavestatus,
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
const deliverySteps = [
    "Order confirmed",
    "Ready for pickup by company",
    "On the way",
    "Product delivered",
];

const statusFilters = [
    { label: "All", value: "" },
    { label: "Confirmed", value: "Order confirmed" },
    { label: "Pickup", value: "Ready for pickup by company" },
    { label: "On The Way", value: "On the way" },
    { label: "Delivered", value: "Product delivered" },
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
    if (!value) {
        return null;
    }

    const parsedValue = new Date(value);

    if (Number.isNaN(parsedValue.getTime())) {
        return null;
    }

    return parsedValue;
}

function getTimestamp(value: string) {
    return getDateValue(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function formatDateLabel(value: string) {
    const parsedValue = getDateValue(value);

    if (!parsedValue) {
        return "TBC";
    }

    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsedValue);
}

function formatDateTimeLabel(value: string) {
    const parsedValue = getDateValue(value);

    if (!parsedValue) {
        return "To be confirmed";
    }

    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(parsedValue);
}

function getProgressValue(statusDetail: string) {
    switch (statusDetail) {
        case "Order confirmed":
            return 25;
        case "Ready for pickup by company":
            return 50;
        case "On the way":
            return 75;
        case "Product delivered":
            return 100;
        default:
            return 0;
    }
}

function getStatusClasses(statusDetail: string) {
    switch (statusDetail) {
        case "Order confirmed":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "Ready for pickup by company":
            return "border-sky-200 bg-sky-50 text-sky-700";
        case "On the way":
            return "border-slate-200 bg-slate-100 text-slate-700";
        case "Product delivered":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        default:
            return "border-slate-200 bg-slate-100 text-slate-600";
    }
}

function getDeliveryStageIndex(statusDetail: string) {
    const index = deliverySteps.findIndex((step) => step === statusDetail);
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
    return deliveries.reduce((total, delivery) => total + getDeliveryUnitCount(delivery), 0);
}

function getActiveFilterCount(filters: DeliveryFilterState) {
    let count = 0;

    if (filters.statusDetail) {
        count += 1;
    }

    if (filters.startDate || filters.endDate) {
        count += 1;
    }

    if (filters.startOrderDate || filters.endOrderDate) {
        count += 1;
    }

    if (filters.createdAtSortOrder !== defaultFilters.createdAtSortOrder) {
        count += 1;
    }

    if (filters.deliveryDateSortOrder !== defaultFilters.deliveryDateSortOrder) {
        count += 1;
    }

    return count;
}

function getStatusMessage(statusDetail: string) {
    switch (statusDetail) {
        case "Order confirmed":
            return "Your order is packed into the delivery queue and waiting for handoff.";
        case "Ready for pickup by company":
            return "Your parcel is prepared and ready for the shipping partner.";
        case "On the way":
            return "Your package is in transit and moving toward the delivery address.";
        case "Product delivered":
            return "Your parcel reached the destination and was marked as delivered.";
        default:
            return "Your shipment is being prepared for the next delivery update.";
    }
}

function getCarrierName(delivery: DeliveryRecord) {
    return delivery.shipping?.carrier || "DailyHype Delivery";
}

function getSupportPhone(delivery: DeliveryRecord) {
    return delivery.shipping?.phone || "Not provided";
}

function getRoleName(roleValue: unknown) {
    if (typeof roleValue === "string") {
        return roleValue;
    }

    if (roleValue && typeof roleValue === "object" && "rolename" in roleValue) {
        return String((roleValue as { rolename?: string }).rolename || "customer");
    }

    return "customer";
}

function getPrimaryItem(delivery: DeliveryRecord) {
    return delivery.items[0] ?? null;
}

export default function Page() {
    const router = useRouter();
    const { setCurrentActivePage } = useAppState();

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

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AllDelivery);
    }, [setCurrentActivePage]);

    useEffect(() => {
        updatechatleavestatus(0, false).catch((error) => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        let cancelled = false;

        getCurrentUserId()
            .then((result) => {
                if (cancelled) {
                    return;
                }

                setCurrentUserId(Number(result[0]));
                setCurrentUserRole(getRoleName(result[1]));
            })
            .catch((error) => {
                console.error(error);

                if (!cancelled) {
                    setErrorMessage("Unable to load your delivery account right now.");
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (currentUserId === null) {
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setErrorMessage("");

        Promise.all([
            getAllDeliveries(currentUserId, {
                ...appliedFilters,
                limit: pageSize,
                offset: (page - 1) * pageSize,
            }),
            getAllDeliveriesCount(currentUserId, appliedFilters),
        ])
            .then(([data, count]) => {
                if (cancelled) {
                    return;
                }

                setDeliveryData(Array.isArray(data) ? data : []);
                setTotalDeliveryCount(count);

                const pageCount = Math.max(1, Math.ceil(count / pageSize));

                if (page > pageCount) {
                    setPage(1);
                }
            })
            .catch((error) => {
                console.error(error);

                if (!cancelled) {
                    setDeliveryData([]);
                    setTotalDeliveryCount(0);
                    setErrorMessage("We could not load your deliveries.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [appliedFilters, currentUserId, page]);

    const handleFilterChange = (filterName: keyof DeliveryFilterState, value: string) => {
        setFilters((previous) => ({
            ...previous,
            [filterName]: value,
        }));
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
        if (currentUserId === null) {
            return;
        }

        setIsChatLoading(delivery.deliveryId);

        try {
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/getRoomId?userUserID=${currentUserId}&deliveryID=${delivery.deliveryId}&role=${currentUserRole}`,
                {
                    method: "GET",
                    credentials: "include",
                },
            );

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const responseData = await response.json();
            const roomId = responseData.room_Id;

            if (!roomId) {
                throw new Error("Chat room not found");
            }

            router.push(`/chatfolder/chat/${roomId}?data=${delivery.deliveryId}`);
        } catch (error) {
            console.error(error);
            alert("Chat is not ready for this delivery yet.");
        } finally {
            setIsChatLoading(null);
        }
    };

    const upcomingDelivery = deliveryData
        .filter((delivery) => delivery.deliveryStatusDetail !== "Product delivered")
        .sort((first, second) => getTimestamp(first.deliveryTime) - getTimestamp(second.deliveryTime))[0];

    const deliveredCount = deliveryData.filter(
        (delivery) => delivery.deliveryStatusDetail === "Product delivered",
    ).length;
    const activeCount = deliveryData.length - deliveredCount;
    const unreadThreadCount = deliveryData.filter((delivery) => getUnreadMessageCount(delivery) > 0).length;
    const visibleUnits = getAllUnits(deliveryData);
    const activeFilterCount = getActiveFilterCount(appliedFilters);
    const totalPages = Math.max(1, Math.ceil(totalDeliveryCount / pageSize));
    const showingFrom = deliveryData.length > 0 ? (page - 1) * pageSize + 1 : 0;
    const showingTo = deliveryData.length > 0 ? Math.min(totalDeliveryCount, showingFrom + deliveryData.length - 1) : 0;
    const highlightedDelivery = upcomingDelivery ?? deliveryData[0] ?? null;

    return (
        <div className="w-full pb-12">
            <div className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 lg:px-8">
                <section className="overflow-hidden rounded-[2.25rem] border border-[#eee3d8] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(249,246,241,0.98)_40%,_rgba(244,239,233,1)_100%)] p-6 shadow-[0_20px_44px_rgba(15,23,42,0.05)] sm:p-8">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">
                                Delivery Dashboard
                            </p>
                            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-[2.9rem]">
                                Follow every shipment with the kind of clarity shoppers expect from a real
                                ecommerce account.
                            </h1>
                            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                                Review your active packages, spot delivered orders quickly, open support chat
                                with admin, and jump into full shipment details without leaving the account
                                area.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href={URL.AllOrder}
                                    className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white"
                                >
                                    View All Orders
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleApplyFilters}
                                    className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700"
                                >
                                    Refresh Results
                                </button>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <article className="rounded-[1.6rem] border border-white/80 bg-white/88 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Active
                                        </span>
                                        <Truck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{activeCount}</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Packages still moving through the delivery journey.
                                    </p>
                                </article>

                                <article className="rounded-[1.6rem] border border-white/80 bg-white/88 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Delivered
                                        </span>
                                        <CheckCircle2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{deliveredCount}</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Parcels already marked as completed at the destination.
                                    </p>
                                </article>

                                <article className="rounded-[1.6rem] border border-white/80 bg-white/88 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Support
                                        </span>
                                        <MessageSquare className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{unreadThreadCount}</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Delivery conversations waiting for your attention.
                                    </p>
                                </article>

                                <article className="rounded-[1.6rem] border border-white/80 bg-white/88 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Units
                                        </span>
                                        <Package className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="mt-4 text-3xl font-semibold text-slate-900">{visibleUnits}</p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Product units visible in the deliveries on this page.
                                    </p>
                                </article>
                            </div>
                        </div>

                        <aside className="rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Shipment Highlight
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">
                                        {highlightedDelivery ? `Delivery #${highlightedDelivery.deliveryId}` : "No delivery selected"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-[#faf8f5] p-5">
                                {highlightedDelivery ? (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                    highlightedDelivery.deliveryStatusDetail,
                                                )}`}
                                            >
                                                {highlightedDelivery.deliveryStatusDetail}
                                            </span>
                                            {getUnreadMessageCount(highlightedDelivery) > 0 ? (
                                                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                                                    {getUnreadMessageCount(highlightedDelivery)} unread
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            ETA
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                                            {formatDateLabel(highlightedDelivery.deliveryTime)}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {getStatusMessage(highlightedDelivery.deliveryStatusDetail)}
                                        </p>

                                        <div className="mt-5 grid gap-3">
                                            <div className="rounded-[1.25rem] border border-white bg-white p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Tracking
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {highlightedDelivery.trackingNumber || "Tracking pending"}
                                                </p>
                                            </div>
                                            <div className="rounded-[1.25rem] border border-white bg-white p-4">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Carrier
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                                    {getCarrierName(highlightedDelivery)}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-semibold text-slate-900">
                                            Your delivery area is ready.
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                            As soon as your orders are assigned to shipments, the tracking cards,
                                            delivery status, and admin support chat will appear here.
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Secure post-purchase support
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            Delivery chat stays available so customers can confirm addresses, ask
                                            about delays, or follow up on missing packages in real time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-8">
                        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Filter className="h-5 w-5 text-slate-500" />
                                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                            Delivery Filters
                                        </p>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                        Narrow the shipment view the same way shoppers expect in a polished account.
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {activeFilterCount > 0
                                            ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied to the current results.`
                                            : "No filters are currently applied."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApplyFilters}
                                        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {statusFilters.map((status) => {
                                    const isActive = filters.statusDetail === status.value;

                                    return (
                                        <button
                                            key={status.label}
                                            type="button"
                                            onClick={() => handleFilterChange("statusDetail", status.value)}
                                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                isActive
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : "border-slate-200 bg-slate-50 text-slate-600"
                                            }`}
                                        >
                                            {status.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Delivery From
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(event) => handleFilterChange("startDate", event.target.value)}
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Delivery To
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(event) => handleFilterChange("endDate", event.target.value)}
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Ordered From
                                    <input
                                        type="date"
                                        value={filters.startOrderDate}
                                        onChange={(event) =>
                                            handleFilterChange("startOrderDate", event.target.value)
                                        }
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Ordered To
                                    <input
                                        type="date"
                                        value={filters.endOrderDate}
                                        onChange={(event) =>
                                            handleFilterChange("endOrderDate", event.target.value)
                                        }
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Order Sort
                                    <select
                                        value={filters.createdAtSortOrder}
                                        onChange={(event) =>
                                            handleFilterChange("createdAtSortOrder", event.target.value)
                                        }
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        <option value="desc">Newest first</option>
                                        <option value="asc">Oldest first</option>
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                                    Delivery Sort
                                    <select
                                        value={filters.deliveryDateSortOrder}
                                        onChange={(event) =>
                                            handleFilterChange("deliveryDateSortOrder", event.target.value)
                                        }
                                        className="h-12 rounded-[1rem] border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400"
                                    >
                                        <option value="asc">Soonest first</option>
                                        <option value="desc">Latest first</option>
                                    </select>
                                </label>
                            </div>
                        </section>

                        <section>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                                        Shipment Results
                                    </p>
                                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                        Delivery activity designed like a premium order-tracking page.
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {deliveryData.length > 0
                                            ? `Showing ${showingFrom}-${showingTo} of ${totalDeliveryCount} deliveries.`
                                            : `Page ${page} is currently empty.`}
                                    </p>
                                </div>

                                <CustomPagination
                                    currentPage={page}
                                    total={totalPages}
                                    onChange={(current) => setPage(current)}
                                    className="justify-end"
                                />
                            </div>

                            {errorMessage ? (
                                <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                                    {errorMessage}
                                </div>
                            ) : null}

                            {isLoading ? (
                                <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
                                    <div className="text-center">
                                        <Spinner size="lg" />
                                        <p className="mt-4 text-sm text-slate-500">Loading deliveries...</p>
                                    </div>
                                </div>
                            ) : deliveryData.length === 0 ? (
                                <div className="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                        <Package className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                                        No deliveries match these filters
                                    </h3>
                                    <p className="mt-3 text-sm text-slate-500">
                                        Try clearing the filters or switch back to all deliveries.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 space-y-5">
                                    {deliveryData.map((delivery) => {
                                        const stageIndex = getDeliveryStageIndex(delivery.deliveryStatusDetail);
                                        const primaryItem = getPrimaryItem(delivery);
                                        const unreadCount = getUnreadMessageCount(delivery);
                                        const totalUnitsInDelivery = getDeliveryUnitCount(delivery);

                                        return (
                                            <article
                                                key={delivery.deliveryId}
                                                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)]"
                                            >
                                                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_290px]">
                                                    <div className="p-5 sm:p-6">
                                                        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                                        Order #{delivery.orderId}
                                                                    </span>
                                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                                        Delivery #{delivery.deliveryId}
                                                                    </span>
                                                                    {unreadCount > 0 ? (
                                                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                                                                            {unreadCount} unread message
                                                                            {unreadCount === 1 ? "" : "s"}
                                                                        </span>
                                                                    ) : null}
                                                                </div>

                                                                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                                                                    {primaryItem?.name || "Delivery package"}
                                                                    {delivery.items.length > 1
                                                                        ? ` + ${delivery.items.length - 1} more item${delivery.items.length - 1 === 1 ? "" : "s"}`
                                                                        : ""}
                                                                </h3>
                                                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                                    {getStatusMessage(delivery.deliveryStatusDetail)}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
                                                                    delivery.deliveryStatusDetail,
                                                                )}`}
                                                            >
                                                                {delivery.deliveryStatusDetail}
                                                            </span>
                                                        </div>

                                                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_0.95fr]">
                                                            <div className="rounded-[1.6rem] border border-slate-200 bg-[#faf8f5] p-5">
                                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                                            Shipment Progress
                                                                        </p>
                                                                        <p className="mt-2 text-lg font-semibold text-slate-900">
                                                                            {delivery.deliveryStatusDetail}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-500">
                                                                        {getProgressValue(delivery.deliveryStatusDetail)}%
                                                                        complete
                                                                    </span>
                                                                </div>

                                                                <Progress
                                                                    className="mt-4 max-w-full"
                                                                    value={getProgressValue(delivery.deliveryStatusDetail)}
                                                                    color="success"
                                                                />

                                                                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                                    {deliverySteps.map((step, index) => {
                                                                        const isCompleted = index <= stageIndex;

                                                                        return (
                                                                            <div
                                                                                key={step}
                                                                                className={`rounded-[1.2rem] border px-3 py-3 text-sm ${
                                                                                    isCompleted
                                                                                        ? "border-slate-900 bg-white text-slate-900"
                                                                                        : "border-slate-200 bg-white/80 text-slate-400"
                                                                                }`}
                                                                            >
                                                                                <span className="block text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                                                                                    Step {index + 1}
                                                                                </span>
                                                                                <span className="mt-2 block leading-5">
                                                                                    {step}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-4 sm:grid-cols-2">
                                                                <div className="rounded-[1.45rem] border border-slate-200 bg-white p-4">
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                        <CalendarDays className="h-4 w-4" />
                                                                        Ordered
                                                                    </div>
                                                                    <p className="mt-3 text-base font-semibold text-slate-900">
                                                                        {formatDateLabel(delivery.orderDate)}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                        {formatDateTimeLabel(delivery.orderDate)}
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-[1.45rem] border border-slate-200 bg-white p-4">
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                        <Clock3 className="h-4 w-4" />
                                                                        Estimated Arrival
                                                                    </div>
                                                                    <p className="mt-3 text-base font-semibold text-slate-900">
                                                                        {formatDateLabel(delivery.deliveryTime)}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                        {formatDateTimeLabel(delivery.deliveryTime)}
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-[1.45rem] border border-slate-200 bg-white p-4">
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                        <Warehouse className="h-4 w-4" />
                                                                        Carrier
                                                                    </div>
                                                                    <p className="mt-3 text-base font-semibold text-slate-900">
                                                                        {getCarrierName(delivery)}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                        {delivery.trackingNumber || "Tracking pending"}
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-[1.45rem] border border-slate-200 bg-white p-4">
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                        <MapPin className="h-4 w-4" />
                                                                        Delivery Address
                                                                    </div>
                                                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                                                                        {delivery.deliveryAddress}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6">
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                                        Packed Items
                                                                    </p>
                                                                    <p className="mt-2 text-sm text-slate-500">
                                                                        {delivery.items.length} product
                                                                        {delivery.items.length === 1 ? "" : "s"} /{" "}
                                                                        {totalUnitsInDelivery} unit
                                                                        {totalUnitsInDelivery === 1 ? "" : "s"}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedDelivery(delivery)}
                                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                                                                >
                                                                    View Full Details
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </button>
                                                            </div>

                                                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                                                {delivery.items.slice(0, 2).map((item, index) => (
                                                                    <article
                                                                        key={`${delivery.deliveryId}-${item.name}-${index}`}
                                                                        className="flex gap-4 rounded-[1.45rem] border border-slate-200 bg-slate-50 p-4"
                                                                    >
                                                                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] bg-white">
                                                                            <ResilientImage
                                                                                src={item.image}
                                                                                alt={item.name}
                                                                                fill
                                                                                sizes="160px"
                                                                                className="object-cover"
                                                                            />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate text-base font-semibold text-slate-900">
                                                                                {item.name}
                                                                            </p>
                                                                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                                                {item.description}
                                                                            </p>
                                                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                                                                <span>
                                                                                    {item.colour}, {item.size}
                                                                                </span>
                                                                                <span>Qty {getItemQuantity(item)}</span>
                                                                                <span>${formatMoney(item.price)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </article>
                                                                ))}

                                                                {delivery.items.length > 2 ? (
                                                                    <div className="flex min-h-[122px] items-center justify-center rounded-[1.45rem] border border-dashed border-slate-300 bg-white p-4 text-center">
                                                                        <div>
                                                                            <p className="text-base font-semibold text-slate-900">
                                                                                +{delivery.items.length - 2} more item
                                                                                {delivery.items.length - 2 === 1
                                                                                    ? ""
                                                                                    : "s"}
                                                                            </p>
                                                                            <p className="mt-2 text-sm text-slate-500">
                                                                                Open full details to review every
                                                                                product in this shipment.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <aside className="border-t border-slate-200 bg-[#fcfbf9] p-5 xl:border-l xl:border-t-0">
                                                        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                                Actions
                                                            </p>

                                                            <div className="mt-4 space-y-3">
                                                                <Button
                                                                    className="h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white"
                                                                    onClick={() => setSelectedDelivery(delivery)}
                                                                >
                                                                    View Package Details
                                                                </Button>
                                                                <Link
                                                                    href={`${URL.UserOrderDetail}${delivery.orderId}`}
                                                                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
                                                                >
                                                                    View Order
                                                                </Link>
                                                                <Button
                                                                    className="h-12 w-full rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700"
                                                                    onClick={() => navigateToChatRoom(delivery)}
                                                                    isDisabled={isChatLoading === delivery.deliveryId}
                                                                >
                                                                    {isChatLoading === delivery.deliveryId ? (
                                                                        <Spinner size="sm" color="default" />
                                                                    ) : (
                                                                        "Chat With Admin"
                                                                    )}
                                                                </Button>
                                                            </div>

                                                            <div className="mt-5 rounded-[1.25rem] bg-slate-50 p-4">
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    Support snapshot
                                                                </p>
                                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                                    Use chat for address checks, delay follow-up, or
                                                                    delivery questions tied to this shipment.
                                                                </p>
                                                                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                                                    <span>Unread thread updates</span>
                                                                    <span className="font-semibold text-slate-900">
                                                                        {unreadCount}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </aside>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-5">
                        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                            <div className="flex items-start gap-3">
                                <RefreshCcw className="mt-0.5 h-5 w-5 text-slate-500" />
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Account View
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">
                                        Delivery updates stay organized.
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-500">
                                The delivery page now keeps shipment progress, product previews, and admin chat
                                actions together so shoppers do not need to bounce between multiple pages.
                            </p>
                        </div>

                        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Quick Notes
                            </p>

                            <div className="mt-4 space-y-3">
                                <div className="rounded-[1.2rem] bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Tracking visibility</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Every card shows the carrier, tracking number, ETA, and a staged progress
                                        bar.
                                    </p>
                                </div>

                                <div className="rounded-[1.2rem] bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Support chat</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Customers can jump into the real-time admin thread directly from each
                                        shipment.
                                    </p>
                                </div>

                                <div className="rounded-[1.2rem] bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Post-purchase clarity</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Product previews and full package details are surfaced before a customer
                                        even opens the order page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

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
                            <ModalHeader className="flex flex-col gap-3 border-b border-slate-200">
                                {selectedDelivery ? (
                                    <>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                Delivery #{selectedDelivery.deliveryId}
                                            </span>
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                    selectedDelivery.deliveryStatusDetail,
                                                )}`}
                                            >
                                                {selectedDelivery.deliveryStatusDetail}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-2xl font-semibold text-slate-900">
                                                Order #{selectedDelivery.orderId}
                                            </span>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {getStatusMessage(selectedDelivery.deliveryStatusDetail)}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </ModalHeader>

                            <ModalBody className="py-6">
                                {selectedDelivery ? (
                                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                                        <div className="space-y-5">
                                            <div className="rounded-[1.6rem] border border-slate-200 bg-[#faf8f5] p-5">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Delivery Snapshot
                                                </p>
                                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                                    <p>
                                                        <strong className="text-slate-900">Estimated delivery:</strong>{" "}
                                                        {formatDateTimeLabel(selectedDelivery.deliveryTime)}
                                                    </p>
                                                    <p>
                                                        <strong className="text-slate-900">Tracking number:</strong>{" "}
                                                        {selectedDelivery.trackingNumber || "Tracking pending"}
                                                    </p>
                                                    <p>
                                                        <strong className="text-slate-900">Carrier:</strong>{" "}
                                                        {getCarrierName(selectedDelivery)}
                                                    </p>
                                                    <p>
                                                        <strong className="text-slate-900">Support phone:</strong>{" "}
                                                        {getSupportPhone(selectedDelivery)}
                                                    </p>
                                                </div>

                                                <Progress
                                                    className="mt-5 max-w-full"
                                                    value={getProgressValue(selectedDelivery.deliveryStatusDetail)}
                                                    color="success"
                                                />
                                            </div>

                                            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Delivery Address
                                                </p>
                                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                                    {selectedDelivery.deliveryAddress}
                                                </p>
                                            </div>

                                            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Shipment Steps
                                                </p>
                                                <div className="mt-4 grid gap-3">
                                                    {deliverySteps.map((step, index) => {
                                                        const isCompleted =
                                                            index <=
                                                            getDeliveryStageIndex(
                                                                selectedDelivery.deliveryStatusDetail,
                                                            );

                                                        return (
                                                            <div
                                                                key={step}
                                                                className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
                                                                    isCompleted
                                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                                        : "border-slate-200 bg-slate-50 text-slate-500"
                                                                }`}
                                                            >
                                                                {step}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Packed Items
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {selectedDelivery.items.length} product
                                                    {selectedDelivery.items.length === 1 ? "" : "s"}
                                                </p>
                                            </div>

                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                {selectedDelivery.items.map((item, index) => (
                                                    <article
                                                        key={`${selectedDelivery.deliveryId}-${item.name}-${index}`}
                                                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                                                    >
                                                        <div className="relative h-44 overflow-hidden rounded-[1.2rem] bg-white">
                                                            <ResilientImage
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                sizes="(max-width: 1024px) 100vw, 260px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <h4 className="mt-4 text-base font-semibold text-slate-900">
                                                            {item.name}
                                                        </h4>
                                                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                            {item.description}
                                                        </p>
                                                        <p className="mt-3 text-sm text-slate-600">
                                                            {item.colour}, {item.size}
                                                        </p>
                                                        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                                            <span>Qty {getItemQuantity(item)}</span>
                                                            <span>${formatMoney(item.price)}</span>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </ModalBody>

                            <ModalFooter className="border-t border-slate-200">
                                {selectedDelivery ? (
                                    <>
                                        <Link
                                            href={`${URL.UserOrderDetail}${selectedDelivery.orderId}`}
                                            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
                                        >
                                            View Order
                                        </Link>
                                        <Button
                                            className="rounded-full border border-slate-300 bg-white text-slate-700"
                                            onClick={() => navigateToChatRoom(selectedDelivery)}
                                            isDisabled={isChatLoading === selectedDelivery.deliveryId}
                                        >
                                            {isChatLoading === selectedDelivery.deliveryId ? (
                                                <Spinner size="sm" color="default" />
                                            ) : (
                                                "Open Chat"
                                            )}
                                        </Button>
                                    </>
                                ) : null}
                                <Button
                                    className="rounded-full bg-slate-900 text-white"
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
