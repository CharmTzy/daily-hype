"use client";

import Link from "next/link";
import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const supportChannels = [
    {
        title: "Customer support",
        detail: "support@dailyhype.local",
        description: "Questions about orders, products, checkout, refunds, or account help.",
        href: "mailto:support@dailyhype.local",
    },
    {
        title: "Order assistance",
        detail: "Help centre and order history",
        description: "Use your order list for the fastest route into delivery and order progress updates.",
        href: URL.AllOrder,
        internal: true,
    },
    {
        title: "Partnership enquiries",
        detail: "partners@dailyhype.local",
        description: "For collaborations, retail partnerships, or business-related conversations.",
        href: "mailto:partners@dailyhype.local",
    },
];

const supportChecklist = [
    "Your order number, if the request is tied to a completed purchase.",
    "The exact product name, colour, and size when the issue is item-specific.",
    "Screenshots or photos if you are reporting a damaged item or storefront problem.",
    "A short summary of what you expected and what actually happened.",
];

const commonRequests = [
    "Order status or delivery delays",
    "Checkout issues and payment confirmation",
    "Sizing and stock questions",
    "Refund or return-related follow-up",
];

export default function Page() {
    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Contact"
                    title="Reach the right DailyHype support lane faster."
                    description="The contact page now gives shoppers a clearer path for order support, general help, and feedback follow-up without sending them into placeholder screens."
                    actions={[
                        { href: URL.Help, label: "Open help centre" },
                        { href: URL.Feedback, label: "Send feedback", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Channels", value: "Support, orders, partnerships" },
                        { label: "Best for", value: "Issues needing human follow-up" },
                        { label: "Tip", value: "Include order details for faster review" },
                    ]}
                />

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    {supportChannels.map((channel) => {
                        const card = (
                            <article className="h-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    {channel.title}
                                </p>
                                <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                                    {channel.detail}
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-slate-500">{channel.description}</p>
                            </article>
                        );

                        return channel.internal ? (
                            <Link key={channel.title} href={channel.href}>
                                {card}
                            </Link>
                        ) : (
                            <a key={channel.title} href={channel.href} className="block">
                                {card}
                            </a>
                        );
                    })}
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-[30px] border border-[#efe6dc] bg-[#faf8f5] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Before you send a message
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            Include the details that help support act faster.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            {supportChecklist.map((item) => (
                                <li key={item} className="rounded-[20px] border border-[#ece5dc] bg-white px-4 py-3">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Common requests
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            What people usually contact us about.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            {commonRequests.map((request) => (
                                <li key={request} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                    {request}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-900">Need the self-service route first?</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Try the help centre before contacting support for delivery, account, and payment questions that already have guided answers.
                            </p>
                            <Link
                                href={URL.Help}
                                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                Go to help centre
                            </Link>
                        </div>
                    </article>
                </section>
            </div>
        </PublicPageFrame>
    );
}
