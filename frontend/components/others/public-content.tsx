"use client";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
export default function PublicContent({ children }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-slate-950">
            <Header />
            <main className="min-h-[calc(100vh-81px)]">{children}</main>
            <Footer />
        </div>
    );
}
