"use client";
import { useAppState } from "@/app/app-provider";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
export default function PublicContent({ children }: {
    children: React.ReactNode;
}) {
    const { headerCanLoad } = useAppState();
    return (
        <>
            {headerCanLoad && (
                <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                    <Header />
                    <main className="min-h-[calc(100vh-81px)]">{children}</main>
                    <Footer />
                </div>
            )}
        </>
    );
}
