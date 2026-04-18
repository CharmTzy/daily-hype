"use client";

import Link from "next/link";
import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const brandPillars = [
    {
        title: "Curated browsing",
        description:
            "DailyHype is designed to feel easier to browse than a generic storefront, with focused collections, stronger category discovery, and clearer product presentation.",
    },
    {
        title: "Shopper-first journeys",
        description:
            "Saved carts, checkout review, address selection, order history, reviews, and refund pathways all work together to support the full customer journey.",
    },
    {
        title: "Operational depth",
        description:
            "Behind the storefront, the project already includes catalog, order, refund, delivery, review, and admin workflows for a more complete commerce demo.",
    },
];

const shopperFeatures = [
    "Browse by collection, category, keyword, colour, size, and search filters.",
    "Review product details with richer colour, size, stock, and checkout context.",
    "Save items to cart, return later, and continue into a Stripe-backed checkout flow.",
    "Manage addresses, orders, delivery status, and reviews from the account area.",
];

const projectHighlights = [
    "Next.js storefront with responsive layouts tuned for mobile, tablet, and desktop.",
    "Express and PostgreSQL backend supporting products, carts, orders, reviews, refunds, and users.",
    "Admin tools for catalog, users, order handling, review moderation, and reporting.",
    "A cleaner public support layer so shoppers can actually find help, policies, and contact details.",
];

const teamMembers = [
    "Zay Yar Tun",
    "Wai Yan Aung",
    "Ang Wei Liang",
    "Thu Htet San",
    "Angie Toh Anqi",
];

export default function Page() {
    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="About DailyHype"
                    title="A fashion-commerce project rebuilt to feel more complete and shopper-ready."
                    description="DailyHype started as a student-built fashion marketplace and now presents itself more like a modern ecommerce storefront, with stronger support pages, richer product context, and a cleaner public shopping flow."
                    actions={[
                        { href: URL.Explore, label: "Explore the catalog" },
                        { href: URL.Contact, label: "Contact support", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Experience", value: "Curated storefront flow" },
                        { label: "Coverage", value: "Shopper and admin journeys" },
                        { label: "Theme", value: "Fashion-led, clean, consistent" },
                    ]}
                />

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    {brandPillars.map((pillar) => (
                        <article
                            key={pillar.title}
                            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)]"
                        >
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                                {pillar.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-500">{pillar.description}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <article className="rounded-[30px] border border-[#efe6dc] bg-[#faf8f5] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            What shoppers can do
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            More than a catalog landing page.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            {shopperFeatures.map((feature) => (
                                <li key={feature} className="rounded-[20px] border border-[#ece5dc] bg-white px-4 py-3">
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            What this build includes
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                            Full-stack commerce foundations.
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                            {projectHighlights.map((highlight) => (
                                <li key={highlight} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="mt-8 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Project team
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                Built collaboratively and restored with a stronger storefront layer.
                            </h2>
                        </div>
                        <Link
                            href={URL.Help}
                            className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                        >
                            Visit help centre
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {teamMembers.map((member) => (
                            <div key={member} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-5">
                                <p className="text-sm font-semibold text-slate-900">{member}</p>
                                <p className="mt-2 text-sm text-slate-500">DailyHype project contributor</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </PublicPageFrame>
    );
}
