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
    icons: ["/images/logo.png"],
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
