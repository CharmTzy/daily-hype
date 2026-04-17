"use client";
import clsx from "clsx";
import Link from "next/link";
import { ReactNode } from "react";
import BrandLogo from "@/components/brand/brand-logo";
import { URL } from "@/enums/global-enums";

interface IAuthShellProps {
    title: string;
    description: string;
    panelTitle: string;
    panelDescription: string;
    children: ReactNode;
    panelContent?: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export default function AuthShell({ title, description, panelTitle, panelDescription, children, panelContent, footer, className }: IAuthShellProps) {
    return (<div className="min-h-screen bg-[#f5efe7] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:min-h-[calc(100vh-3rem)]">
        <section className="hidden w-[42%] flex-col justify-between bg-[#111827] px-10 py-12 text-white lg:flex">
          <div className="space-y-12">
            <Link href={URL.Home} className="inline-flex">
              <BrandLogo size="md" variant="inverse"/>
            </Link>
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                DailyHype
              </span>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">{panelTitle}</h1>
              <p className="max-w-md text-base leading-7 text-white/72">{panelDescription}</p>
            </div>
          </div>
          {panelContent ? <div className="space-y-4 text-sm text-white/78">{panelContent}</div> : null}
        </section>
        <section className={clsx("flex flex-1 flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12", className)}>
          <div className="space-y-8 sm:space-y-10">
            <div className="lg:hidden">
              <Link href={URL.Home} className="inline-flex">
                <BrandLogo size="sm"/>
              </Link>
            </div>
            <div className="mx-auto w-full max-w-xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">{title}</h2>
              <p className="text-sm leading-7 text-slate-500 sm:text-base">{description}</p>
            </div>
            <div className="mx-auto w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:p-8">
              {children}
            </div>
          </div>
          {footer ? <div className="mx-auto mt-8 w-full max-w-xl text-sm text-slate-500">{footer}</div> : null}
        </section>
      </div>
    </div>);
}
