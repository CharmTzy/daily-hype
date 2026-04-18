"use client";

import Link from "next/link";
import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const sitemapGroups = [
    {
        title: "Shop",
        links: [
            { label: "Home", href: URL.Home, description: "Homepage merchandising and featured product sections." },
            { label: "Explore", href: URL.Explore, description: "Browse the full product catalog with filters." },
            { label: "Search", href: URL.Search, description: "Search by keyword, sort, and shopper-friendly filters." },
            { label: "Man", href: URL.Man, description: "Menswear collection landing page." },
            { label: "Woman", href: URL.Woman, description: "Womenswear collection landing page." },
            { label: "Baby", href: URL.Baby, description: "Baby collection landing page." },
            { label: "Cart", href: URL.Cart, description: "Review selected items before checkout." },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "About", href: URL.About, description: "Project and brand overview." },
            { label: "Help", href: URL.Help, description: "Searchable FAQs, payment guidance, and support topics." },
            { label: "Contact", href: URL.Contact, description: "Support lanes for orders, help, and partnerships." },
            { label: "Feedback", href: URL.Feedback, description: "Send shopper feedback through a prefilled email draft." },
            { label: "Privacy Policy", href: URL.PrivacyPolicy, description: "How shopper information is handled." },
            { label: "Terms", href: URL.TermsNConditions, description: "Usage expectations for the site." },
        ],
    },
    {
        title: "Account",
        links: [
            { label: "Sign In", href: URL.SignIn, description: "Access an existing shopper account." },
            { label: "Sign Up", href: URL.SignUp, description: "Create a new account for saved journeys." },
            { label: "Profile", href: URL.Profile, description: "Manage profile details after sign-in." },
            { label: "Address Book", href: URL.AddressBook, description: "Save and update delivery destinations." },
            { label: "Orders", href: URL.AllOrder, description: "Check order status and purchase history." },
            { label: "Delivery", href: URL.Delivery, description: "Review delivery-related account views." },
        ],
    },
];

export default function Page() {
    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Sitemap"
                    title="A clearer map of the public and shopper-facing DailyHype routes."
                    description="The sitemap now reflects the storefront, support, and account experience so shoppers are not left guessing where to go next."
                    actions={[
                        { href: URL.Explore, label: "Browse products" },
                        { href: URL.Help, label: "Get help", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Sections", value: "Shop, support, account" },
                        { label: "Purpose", value: "Clear navigation and discovery" },
                        { label: "Note", value: "Some account pages require sign-in" },
                    ]}
                />

                <section className="mt-8 grid gap-6 xl:grid-cols-3">
                    {sitemapGroups.map((group) => (
                        <article
                            key={group.title}
                            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                        >
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                {group.title}
                            </h2>
                            <div className="mt-6 space-y-4">
                                {group.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="block rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                                    >
                                        <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">{link.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </PublicPageFrame>
    );
}
