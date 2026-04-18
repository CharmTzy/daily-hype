"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import PublicPageFrame from "@/components/public/page-frame";
import PageHero from "@/components/public/page-hero";
import { URL } from "@/enums/global-enums";

const feedbackTopics = [
    "Product quality",
    "Sizing and fit",
    "Delivery experience",
    "Checkout experience",
    "Website bug",
    "General suggestion",
];

const feedbackSignals = [
    "Share the page or journey where the issue happened.",
    "Mention the item name, size, and colour if the feedback is product-specific.",
    "Describe what you expected so the team can compare it with the current behaviour.",
];

export default function Page() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [topic, setTopic] = useState(feedbackTopics[0]);
    const [rating, setRating] = useState("4");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!message.trim()) {
            setError("Please share a short message before sending feedback.");
            return;
        }

        setError("");
        setSubmitted(true);

        const subject = encodeURIComponent(`[${topic}] DailyHype feedback`);
        const body = encodeURIComponent(
            [
                `Name: ${name || "Not provided"}`,
                `Email: ${email || "Not provided"}`,
                `Order number: ${orderNumber || "Not provided"}`,
                `Rating: ${rating}/5`,
                "",
                message.trim(),
            ].join("\n"),
        );

        window.location.href = `mailto:support@dailyhype.local?subject=${subject}&body=${body}`;
    };

    return (
        <PublicPageFrame>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <PageHero
                    eyebrow="Feedback"
                    title="Tell us what should feel better in the DailyHype experience."
                    description="This page now gives shoppers a real feedback route. It collects the key details and opens a prefilled email draft so the message can be sent directly to the support inbox."
                    actions={[
                        { href: URL.Contact, label: "Contact support" },
                        { href: URL.Help, label: "Browse help", variant: "secondary" },
                    ]}
                    stats={[
                        { label: "Best for", value: "UX issues, product notes, suggestions" },
                        { label: "Flow", value: "Prefilled email draft on submit" },
                        { label: "Tip", value: "Add context for faster triage" },
                    ]}
                />

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)] sm:p-8"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Name
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="min-h-[48px] rounded-[18px] border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
                                    placeholder="Your name"
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Email
                                <input
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    type="email"
                                    className="min-h-[48px] rounded-[18px] border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Order number
                                <input
                                    value={orderNumber}
                                    onChange={(event) => setOrderNumber(event.target.value)}
                                    className="min-h-[48px] rounded-[18px] border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
                                    placeholder="Optional"
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Topic
                                <select
                                    value={topic}
                                    onChange={(event) => setTopic(event.target.value)}
                                    className="min-h-[48px] rounded-[18px] border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
                                >
                                    {feedbackTopics.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Overall rating
                            <select
                                value={rating}
                                onChange={(event) => setRating(event.target.value)}
                                className="min-h-[48px] rounded-[18px] border border-slate-300 px-4 text-sm outline-none transition focus:border-slate-900"
                            >
                                <option value="5">5 / 5 Excellent</option>
                                <option value="4">4 / 5 Good</option>
                                <option value="3">3 / 5 Neutral</option>
                                <option value="2">2 / 5 Needs work</option>
                                <option value="1">1 / 5 Poor</option>
                            </select>
                        </label>

                        <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
                            Your message
                            <textarea
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                rows={7}
                                className="rounded-[22px] border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                                placeholder="What happened, what felt good, or what should be improved?"
                            />
                        </label>

                        {error ? (
                            <p className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </p>
                        ) : null}

                        {submitted ? (
                            <p className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                Your default mail app should open with a prefilled draft. If it does not, you can still copy the details into a message to support@dailyhype.local.
                            </p>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Prepare feedback email
                            </button>
                            <Link
                                href={URL.Contact}
                                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                Need direct support instead?
                            </Link>
                        </div>
                    </form>

                    <aside className="space-y-6">
                        <article className="rounded-[30px] border border-[#efe6dc] bg-[#faf8f5] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Helpful signals
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                What makes feedback easier to act on.
                            </h2>
                            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                                {feedbackSignals.map((signal) => (
                                    <li key={signal} className="rounded-[20px] border border-[#ece5dc] bg-white px-4 py-3">
                                        {signal}
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
                            <p className="text-sm font-semibold text-slate-900">When to use this page</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Use feedback for suggestions, storefront quality notes, product impressions, or issues that are not urgent support blockers.
                            </p>
                            <p className="mt-4 text-sm font-semibold text-slate-900">Need urgent help?</p>
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Head to the contact page when you need direct order support, refund follow-up, or help unblocking a live checkout problem.
                            </p>
                        </article>
                    </aside>
                </section>
            </div>
        </PublicPageFrame>
    );
}
