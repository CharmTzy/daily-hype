import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UIProvider from "./nextui-provider";
import AppProvider from "./app-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
const inter = Inter({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "DailyHype - Curated Fashion & Lifestyle",
    description: "Shop the latest in everyday fashion - tops, hoodies, dresses, outerwear and accessories for women, men, kids and babies. Free local shipping over $80, fast Singapore delivery, hassle-free returns.",
    keywords: ["clothing", "fashion", "online shopping", "Singapore", "tops", "dresses", "hoodies", "kids fashion", "baby clothes"],
    openGraph: {
        title: "DailyHype - Curated Fashion & Lifestyle",
        description: "Shop curated fashion drops with shopper-first checkout, fast Singapore delivery and easy returns.",
        siteName: "DailyHype",
        type: "website",
    },
    icons: {
        icon: "/images/logo.png",
        shortcut: "/images/logo.png",
        apple: "/images/logo.png",
    },
};
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "661445928383-tf4kpsnredt5pfb5479dbiebrip5pjfl.apps.googleusercontent.com";
    return (<html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <UIProvider>
            <AppProvider>{children}</AppProvider>
          </UIProvider>
        </GoogleOAuthProvider>
      </body>
    </html>);
}
