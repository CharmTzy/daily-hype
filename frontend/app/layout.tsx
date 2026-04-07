import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UIProvider from "./nextui-provider";
import AppProvider from "./app-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DailyHype",
  description: "This is a clothing e-commerce website",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: "/images/logo.png",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: "/images/logo.png",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-slate-900`}>
        <GoogleOAuthProvider clientId="661445928383-tf4kpsnredt5pfb5479dbiebrip5pjfl.apps.googleusercontent.com">
          <UIProvider>
            <AppProvider>{children}</AppProvider>
          </UIProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
