"use client";

import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const termsSections = [
    {
        id: "site-usage",
        title: "Using the site",
        body: [
            "DailyHype is intended for lawful browsing, shopping, account creation, and normal ecommerce interactions.",
            "Users should avoid attempting to interfere with the storefront, checkout flow, admin routes, or account security mechanisms.",
        ],
    },
    {
        id: "catalogue",
        title: "Products, pricing, and availability",
        body: [
            "Product pricing, size availability, colour options, and stock levels may change as the catalog is updated.",
            "Images and descriptions are presented to help shoppers make informed decisions, but final availability is subject to what remains in stock at checkout time.",
        ],
    },
    {
        id: "orders-payment",
        title: "Orders and payment",
        body: [
            "Adding an item to cart does not reserve it indefinitely. Orders are only finalised after successful payment confirmation.",
            "Checkout totals, delivery information, and payment confirmation should be reviewed carefully before completing the transaction.",
        ],
    },
    {
        id: "account-responsibilities",
        title: "Accounts and shopper responsibilities",
        body: [
            "You are responsible for keeping your account credentials secure and for maintaining accurate delivery and contact details.",
            "Order history, saved addresses, reviews, and delivery updates rely on the accuracy of the account information you provide.",
        ],
    },
    {
        id: "returns-support",
        title: "Returns, refunds, and support",
        body: [
            "Refund or return-related requests may depend on the order state, the issue reported, and any supporting information provided.",
            "Support teams may request order identifiers, item details, or images when reviewing damaged, incorrect, or otherwise eligible cases.",
        ],
    },
    {
        id: "changes-contact",
        title: "Changes and contact",
        body: [
            "DailyHype may revise content, policies, or storefront behaviour over time as the project evolves.",
            "Use the contact page for questions about these terms, support expectations, or order-related issues.",
        ],
    },
];

export default function Page() {
    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Terms and Conditions"
                    title="The main expectations for using the DailyHype storefront."
                    description="These terms now provide a proper public-facing baseline for shopping, account use, checkout, support, and policy changes instead of a placeholder line."
                    actions={[
                        { href: URL.Contact, label: "Contact support" },
                        { href: URL.PrivacyPolicy, label: "Read privacy policy", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Focus", value: "Shopping, checkout, support" },
                        { label: "Audience", value: "Shoppers and account holders" },
                        { label: "Companion", value: "Privacy and help pages" },
                    ]}
                />

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    {termsSections.map((section) => (
                        <article
                            key={section.title}
                            id={section.id}
                            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                        >
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                {section.title}
                            </h2>
                            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                                {section.body.map((paragraph) => (
                                    <p key={paragraph} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </PublicPageFrame>
    );
}
