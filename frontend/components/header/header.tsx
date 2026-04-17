"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import SearchIcon from "@/icons/search-icon";
import CartLink from "./cart-link";
import HeaderProfile from "./header-profile";
import HeaderAuthButton from "./header-auth-button";
import BrandLogo from "@/components/brand/brand-logo";

type NavItem = {
    label: string;
    url: URL;
    activePage: CurrentActivePage;
};

const primaryNav: NavItem[] = [
    { label: "Home", url: URL.Home, activePage: CurrentActivePage.Home },
    { label: "Explore", url: URL.Explore, activePage: CurrentActivePage.Explore },
    { label: "Search", url: URL.Search, activePage: CurrentActivePage.Search },
    { label: "Man", url: URL.Man, activePage: CurrentActivePage.Man },
    { label: "Woman", url: URL.Woman, activePage: CurrentActivePage.Woman },
    { label: "Boy", url: URL.Boy, activePage: CurrentActivePage.Boy },
    { label: "Girl", url: URL.Girl, activePage: CurrentActivePage.Girl },
    { label: "Baby", url: URL.Baby, activePage: CurrentActivePage.Baby },
];

const supportNav = [
    { label: "About", url: URL.About },
    { label: "Help", url: URL.Help },
    { label: "Contact", url: URL.Contact },
];

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export default function Header() {
    const { userInfo, currentActivePage, cart } = useAppState();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (userInfo && (userInfo.role === "admin" || userInfo.role === "manager")) {
            router.push(URL.Dashboard);
        }
    }, [router, userInfo]);

    useEffect(() => {
        if (!mobileMenuOpen) {
            document.body.style.removeProperty("overflow");
            return;
        }

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.removeProperty("overflow");
        };
    }, [mobileMenuOpen]);

    const activeLabel = useMemo(() => {
        return primaryNav.find((item) => item.activePage === currentActivePage)?.label || "Shop";
    }, [currentActivePage]);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-[75px] items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>

                        <Link href={URL.Home} className="ml-2 flex min-w-0 items-center">
                            <BrandLogo size="xs" />
                        </Link>
                    </div>

                    <nav className="hidden items-center lg:flex lg:flex-1 lg:justify-center">
                        <div className="flex items-center">
                            {primaryNav.map((item) => (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    className={`ms-7 text-sm transition hover:text-slate-950 ${
                                        currentActivePage === item.activePage
                                            ? "font-semibold text-slate-950"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <Link
                            href={URL.Search}
                            aria-label="Search products"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                        >
                            <SearchIcon width={18} height={18} />
                        </Link>
                        <CartLink noOfItem={cart && cart.length ? cart.length : 0} />
                        <HeaderProfile userInfo={userInfo} />
                        <div className="hidden items-center sm:flex">
                            <HeaderAuthButton toShow={userInfo === null} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden">
                    {primaryNav.map((item) => (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                currentActivePage === item.activePage
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-600"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {mobileMenuOpen ? (
                <div className="lg:hidden">
                    <button
                        type="button"
                        aria-label="Close mobile menu backdrop"
                        onClick={closeMobileMenu}
                        className="fixed inset-0 top-[126px] z-40 bg-slate-950/50"
                    />
                    <div className="fixed inset-x-0 top-[126px] z-50 mx-3 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl sm:mx-6">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                {activeLabel}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Shop by collection, search quickly, or jump into your account.
                            </p>
                        </div>

                        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-5 py-5">
                            <div className="grid gap-2">
                                {primaryNav.map((item) => (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                            currentActivePage === item.activePage
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-50 text-slate-700"
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span aria-hidden="true">&rsaquo;</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-6 grid gap-2 sm:grid-cols-3">
                                {supportNav.map((item) => (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        onClick={closeMobileMenu}
                                        className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            {userInfo === null ? (
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <Link
                                        href={URL.SignIn}
                                        onClick={closeMobileMenu}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={URL.SignUp}
                                        onClick={closeMobileMenu}
                                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
