"use client";

import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const privacySections = [
    {
        title: "Information we collect",
        body: [
            "Account details such as your name, email address, and saved delivery information when you create or manage an account.",
            "Order, cart, and checkout information needed to process purchases and display order history.",
            "Product reviews, support requests, and feedback you choose to submit through the site.",
        ],
    },
    {
        title: "How we use your information",
        body: [
            "To operate the storefront, process orders, support checkout, and help with refunds or delivery follow-up.",
            "To improve search, browsing, merchandising, and the overall customer experience across devices.",
            "To respond to support requests, feedback, and account-related questions.",
        ],
    },
    {
        title: "Payments and security",
        body: [
            "Payments are handled through a Stripe-backed flow so card processing is separated from normal storefront browsing.",
            "Access tokens, saved account state, and delivery details are used to keep shopper journeys authenticated and recoverable.",
            "Reasonable safeguards should be maintained before production launch, including secure environment settings and key rotation.",
        ],
    },
    {
        title: "Sharing and service providers",
        body: [
            "DailyHype may rely on third-party services for payments, media storage, email delivery, hosting, and analytics support.",
            "Information should only be shared where it is required to operate the ecommerce service or fulfil legitimate support tasks.",
            "Production deployments should document the exact providers and regional data-handling expectations in use.",
        ],
    },
    {
        title: "Your choices",
        body: [
            "You can review and update saved addresses, account details, and certain profile settings from your shopper account.",
            "You may contact support if you need help with account access, order records, or feedback connected to your personal information.",
            "Cookies or browser storage used for the cart and account experience can also be cleared from your browser settings.",
        ],
    },
];

export default function Page() {
    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Privacy Policy"
                    title="How DailyHype handles shopper information across the storefront experience."
                    description="This policy page replaces the previous placeholder with a clearer explanation of the kinds of shopper data involved in account, order, payment, and support journeys."
                    actions={[
                        { href: URL.Contact, label: "Contact support" },
                        { href: URL.TermsNConditions, label: "Read terms", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Scope", value: "Accounts, orders, checkout, support" },
                        { label: "Focus", value: "Clarity over placeholder copy" },
                        { label: "Related", value: "See terms and contact pages" },
                    ]}
                />

                <section className="mt-8 space-y-6">
                    {privacySections.map((section) => (
                        <article
                            key={section.title}
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
