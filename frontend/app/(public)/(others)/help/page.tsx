"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accordion, AccordionItem, Input } from "@nextui-org/react";
import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const quickTopics = [
    {
        href: "#buy",
        title: "How to buy",
        description: "Go from discovery to checkout with a cleaner, more guided shopping flow.",
    },
    {
        href: "#payment",
        title: "Payment methods",
        description: "Understand how checkout, payment confirmation, and order creation work together.",
    },
    {
        href: "#delivery",
        title: "Delivery and tracking",
        description: "Find where delivery status and shipping progress appear after checkout.",
    },
    {
        href: "#returns",
        title: "Returns and refunds",
        description: "See how eligible post-purchase issues can be handled and escalated.",
    },
];

const faqItems = [
    {
        key: "order-status",
        question: "How do I check my order status?",
        keywords: ["order", "status", "tracking", "delivery"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                Once you are signed in, open your{" "}
                <Link className="font-semibold text-slate-900" href={URL.AllOrder}>
                    order list
                </Link>{" "}
                to review order progress, delivery updates, and completed purchases.
            </p>
        ),
    },
    {
        key: "address-change",
        question: "Can I update my delivery address after placing an order?",
        keywords: ["address", "change", "delivery", "shipping"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                The safest route is to check the order status first. If the order has not moved too far into fulfilment, contact support and include the order reference plus your updated address details.
            </p>
        ),
    },
    {
        key: "payment-methods",
        question: "What payment methods are supported?",
        keywords: ["payment", "card", "stripe", "checkout"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                DailyHype uses a Stripe-backed checkout flow for secure card payments. You will review the order first, then confirm payment before the order is finalised.
            </p>
        ),
    },
    {
        key: "refund-support",
        question: "What should I do if I received the wrong or damaged item?",
        keywords: ["refund", "damaged", "wrong item", "return"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                Reach out through the contact or feedback pages with the order number, item name, and clear photos if needed. The refund and order-management workflows are built to support eligible issues.
            </p>
        ),
    },
    {
        key: "password-reset",
        question: "How do I reset my password?",
        keywords: ["password", "account", "signin", "login"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                Use the forgot-password option from the{" "}
                <Link className="font-semibold text-slate-900" href={URL.SignIn}>
                    sign-in page
                </Link>{" "}
                if you can no longer access your account with your current password.
            </p>
        ),
    },
    {
        key: "address-book",
        question: "Where can I manage saved delivery addresses?",
        keywords: ["address book", "saved address", "delivery address"],
        answer: (
            <p className="pe-6 text-sm leading-7 text-slate-600">
                Open the{" "}
                <Link className="font-semibold text-slate-900" href={URL.AddressBook}>
                    address book
                </Link>{" "}
                in your account to add, review, or update delivery addresses before checkout.
            </p>
        ),
    },
];

export default function Page() {
    const [searchText, setSearchText] = useState("");

    const filteredFaqs = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) {
            return faqItems;
        }

        return faqItems.filter((item) => {
            const haystack = [item.question, ...item.keywords].join(" ").toLowerCase();
            return haystack.includes(query);
        });
    }, [searchText]);

    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Help Centre"
                    title="Find order, payment, delivery, and refund answers faster."
                    description="This help centre now gives shoppers a clearer self-service path, with focused guidance on buying, paying, tracking orders, and getting support after checkout."
                    actions={[
                        { href: URL.Contact, label: "Contact support" },
                        { href: URL.Feedback, label: "Send feedback", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Coverage", value: "Buying, payment, delivery" },
                        { label: "Support", value: "Refund and feedback guidance" },
                        { label: "Format", value: "Searchable FAQs and quick links" },
                    ]}
                />

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {quickTopics.map((topic) => (
                        <Link
                            key={topic.href}
                            href={topic.href}
                            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)]"
                        >
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                {topic.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-500">{topic.description}</p>
                        </Link>
                    ))}
                </section>

                <section
                    id="buy"
                    className="mt-8 rounded-[30px] border border-[#efe6dc] bg-[#faf8f5] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        How to buy
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                        A cleaner path from browsing to checkout.
                    </h2>
                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-[24px] border border-[#ece5dc] bg-white p-5">
                            <p className="text-sm font-semibold text-slate-900">1. Browse with intent</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Start from the homepage, explore page, or search page to narrow products by category, size, colour, and overall fit for the moment.
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-[#ece5dc] bg-white p-5">
                            <p className="text-sm font-semibold text-slate-900">2. Review product details</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Check the available colours, sizes, stock status, and shopping notes before adding the item to your cart or moving directly into checkout.
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-[#ece5dc] bg-white p-5">
                            <p className="text-sm font-semibold text-slate-900">3. Confirm and pay</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Review your cart, choose the right address, and complete payment securely through the Stripe-backed checkout flow.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <article
                        id="payment"
                        className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Payment methods
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            Secure card checkout with clearer confirmation steps.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Orders are reviewed first so totals, addresses, and selected items stay visible before payment.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Stripe handles payment confirmation, and the order is only completed after the payment succeeds.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                If a payment does not complete, the checkout flow now surfaces clearer recovery messaging.
                            </li>
                        </ul>
                    </article>

                    <article
                        id="delivery"
                        className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Delivery and tracking
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            Where shipment updates, addresses, and chat support live.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Open the delivery dashboard after checkout to track progress, review shipment details, and confirm where the parcel is headed.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                The order list shows status changes, while the delivery page gives a fuller tracking view with support actions and shipment-specific details.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                If you need realtime follow-up from admin, open the related delivery and use the built-in chat path from that shipment.
                            </li>
                        </ul>
                    </article>
                </section>

                <section className="mt-8">
                    <article
                        id="returns"
                        className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Returns and refunds
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            Support for eligible post-purchase issues.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Include the order number, item details, and photos if you are reporting damage or the wrong item.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Refund-related workflows exist in the platform, which makes it easier to review issues and follow up from the account side.
                            </li>
                            <li className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                Use the contact or feedback channels when you need help that is not obvious from order status alone.
                            </li>
                        </ul>
                    </article>
                </section>

                <section
                    id="faq"
                    className="mt-8 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                FAQ search
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                Search help topics instantly.
                            </h2>
                        </div>
                        <Input
                            isClearable
                            value={searchText}
                            onValueChange={setSearchText}
                            placeholder="Search orders, addresses, refunds, passwords..."
                            className="w-full lg:max-w-md"
                            variant="bordered"
                            classNames={{
                                inputWrapper: "rounded-full border border-slate-300 bg-white",
                                input: "text-sm",
                            }}
                        />
                    </div>

                    <div className="mt-6">
                        {filteredFaqs.length > 0 ? (
                            <Accordion
                                variant="splitted"
                                itemClasses={{ title: "text-medium font-semibold text-slate-900" }}
                            >
                                {filteredFaqs.map((item) => (
                                    <AccordionItem
                                        key={item.key}
                                        aria-label={item.question}
                                        title={item.question}
                                    >
                                        {item.answer}
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                <p className="text-lg font-semibold text-slate-900">No help topics matched that search</p>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Try broader words like order, delivery, payment, or refund, or contact support directly for assistance.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </PublicPageFrame>
    );
}
