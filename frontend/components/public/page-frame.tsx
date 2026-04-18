"use client";

import { useEffect } from "react";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";

type PublicPageFrameProps = {
    children: React.ReactNode;
    activePage?: CurrentActivePage;
};

export default function PublicPageFrame({
    children,
    activePage = CurrentActivePage.None,
}: PublicPageFrameProps) {
    const { setCurrentActivePage } = useAppState();

    useEffect(() => {
        setCurrentActivePage(activePage);
    }, [activePage, setCurrentActivePage]);

    return <>{children}</>;
}
