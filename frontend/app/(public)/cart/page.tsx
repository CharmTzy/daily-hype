import type { Metadata } from "next";
import Cart from "@/app/(public)/cart/cart";
export const metadata: Metadata = {
    title: "DailyHype | Cart",
    description: "This is shopping cart page.",
};
export default function Page() {
    return <Cart />;
}

