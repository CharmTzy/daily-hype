"use client";
import { NextUIProvider } from "@nextui-org/react";
import dynamic from "next/dynamic";
const ThemeProvider = dynamic(() => import("next-themes").then((module) => module.ThemeProvider), { ssr: false });
export default function UIProvider({ children }: {
    children: React.ReactNode;
}) {
    return (<NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </NextUIProvider>);
}

