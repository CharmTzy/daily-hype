"use client";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import Link from "next/link";
import { useEffect } from "react";
const settingGroups = [
    {
        title: "Catalog",
        description: "Maintain products, categories, colours, and sizes.",
        links: [
            { label: "Product form", href: URL.ProductForm },
            { label: "Product list", href: URL.ProductList },
            { label: "Product stats", href: URL.ProductStat },
        ],
    },
    {
        title: "Operations",
        description: "Handle orders, refunds, and delivery updates.",
        links: [
            { label: "Order list", href: URL.OrderList },
            { label: "Refund list", href: URL.RefundList },
            { label: "Delivery tools", href: URL.DeliveryInsert },
        ],
    },
    {
        title: "Account",
        description: "Keep your admin account and access flow tidy.",
        links: [
            { label: "Admin profile", href: URL.AdminProfile },
            { label: "User list", href: URL.UserList },
            { label: "Sign out", href: URL.SignOut },
        ],
    },
];
export default function Page() {
    const { setCurrentActivePage } = useAppState();
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AdminSetting);
    }, [setCurrentActivePage]);
    return (<div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page gathers the admin control points that were previously unfinished, so you have a cleaner place to jump into the right workflow.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {settingGroups.map((group) => (<section key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{group.description}</p>
              <div className="mt-4 space-y-2">
                {group.links.map((item) => (<Link key={item.label} href={item.href} className="block rounded-lg border border-transparent bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:text-slate-900">
                    {item.label}
                  </Link>))}
              </div>
            </section>))}
        </div>
      </div>
    </div>);
}

