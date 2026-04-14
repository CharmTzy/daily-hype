"use client";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { getAdminCartCount } from "@/functions/admin-cart-functions";
import { getProductListCount } from "@/functions/admin-product-functions";
import { getAdminRefundCount } from "@/functions/admin-refund-functions";
import { getAdminOrderCount } from "@/functions/order-functions";
import { getAdminReviewCount } from "@/functions/review-functions";
import { getAdminUserCount } from "@/functions/user-functions";
import { Button, Chip, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
type TDashboardCount = {
    label: string;
    value: number | null;
    href: string;
    description: string;
    accent: string;
};
function DashboardMetricCard({ label, value, href, description, accent }: TDashboardCount) {
    return (<Link href={href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value ?? "-"}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>Live</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
    </Link>);
}
export default function Page() {
    const { setCurrentActivePage, userInfo } = useAppState();
    const [counts, setCounts] = useState({
        users: null as number | null,
        products: null as number | null,
        orders: null as number | null,
        reviews: null as number | null,
        refunds: null as number | null,
        carts: null as number | null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const metrics = useMemo<TDashboardCount[]>(() => [
        {
            label: "Users",
            value: counts.users,
            href: URL.UserList,
            description: "Review customer accounts, status changes, and profile details.",
            accent: "bg-sky-100 text-sky-700",
        },
        {
            label: "Products",
            value: counts.products,
            href: URL.ProductList,
            description: "Manage catalog items, pricing, stock variants, and images.",
            accent: "bg-emerald-100 text-emerald-700",
        },
        {
            label: "Orders",
            value: counts.orders,
            href: URL.OrderList,
            description: "Track incoming orders, confirm them, and follow delivery progress.",
            accent: "bg-amber-100 text-amber-700",
        },
        {
            label: "Reviews",
            value: counts.reviews,
            href: URL.ReviewList,
            description: "Moderate reviews and keep product feedback clean and helpful.",
            accent: "bg-rose-100 text-rose-700",
        },
        {
            label: "Refunds",
            value: counts.refunds,
            href: URL.RefundList,
            description: "Monitor refund requests and spot issues in returns quickly.",
            accent: "bg-violet-100 text-violet-700",
        },
        {
            label: "Carts",
            value: counts.carts,
            href: URL.CartList,
            description: "Check abandoned or active carts when reviewing customer issues.",
            accent: "bg-slate-200 text-slate-700",
        },
    ], [counts]);
    const quickActions = [
        { label: "Add Product", href: URL.ProductForm, description: "Create a new catalog item" },
        { label: "Manage Orders", href: URL.OrderList, description: "Confirm and inspect orders" },
        { label: "Manage Users", href: URL.UserList, description: "Update roles and account status" },
        { label: "Review Stats", href: URL.ReviewStat, description: "Check review trends" },
        { label: "Product Stats", href: URL.ProductStat, description: "See sold quantity and monthly stats" },
        { label: "Delivery Tools", href: URL.DeliveryInsert, description: "Maintain delivery records" },
    ];
    const loadDashboard = async () => {
        setLoading(true);
        setError(null);
        const [users, products, orders, reviews, refunds, carts] = await Promise.all([
            getAdminUserCount(),
            getProductListCount(),
            getAdminOrderCount(),
            getAdminReviewCount(),
            getAdminRefundCount(),
            getAdminCartCount(),
        ]);
        setCounts({
            users: users.error ? null : users.data,
            products: products.error ? null : products.data,
            orders: orders.error ? null : orders.count,
            reviews: reviews.error ? null : reviews.data,
            refunds: refunds.error ? null : refunds.count,
            carts: carts.error ? null : carts.count,
        });
        const failed = [users, products, orders, reviews, refunds, carts].some((result) => result.error);
        if (failed) {
            setError("Some admin counts could not be loaded. The rest of the dashboard is still available.");
        }
        setLoading(false);
    };
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Dashboard);
        void loadDashboard();
    }, [setCurrentActivePage]);
    return (<div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
              <Chip color="primary" variant="flat" size="sm">
                {userInfo?.role ?? "admin"}
              </Chip>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Welcome back{userInfo?.name ? `, ${userInfo.name}` : ""}. This page gives you a clean snapshot of the store and the fastest paths into the admin tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={URL.ProductForm}>
              <Button color="primary">Add product</Button>
            </Link>
            <Button variant="bordered" onPress={() => void loadDashboard()}>
              Refresh data
            </Button>
          </div>
        </div>
      </div>

      {error && (<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>)}

      {loading ? (<div className="flex min-h-[280px] items-center justify-center">
          <Spinner label="Loading admin dashboard..." color="primary"/>
        </div>) : (<>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (<DashboardMetricCard key={metric.label} {...metric}/>))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr,1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                  <p className="mt-1 text-sm text-slate-600">Shortcuts for the tasks you are likely to do most often.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {quickActions.map((action) => (<Link key={action.label} href={action.href} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
                    <p className="font-medium text-slate-900">{action.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                  </Link>))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Workspace Notes</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Use <span className="font-medium text-slate-900">Product</span> and <span className="font-medium text-slate-900">Order</span> lists for day-to-day operations.
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  The new dashboard totals come from the live admin APIs, so you can quickly spot if data is missing after a deploy or database reset.
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  Profile and settings links in the sidebar are now working, so the admin area feels complete instead of dead-ending.
                </div>
              </div>
            </section>
          </div>
        </>)}
    </div>);
}

