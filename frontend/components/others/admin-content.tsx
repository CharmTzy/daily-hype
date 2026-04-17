"use client";
import { useAppState } from "@/app/app-provider";
import { ErrorMessage, URL } from "@/enums/global-enums";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSideBar from "../admin-sidebar/admin-sidebar";
export default function AdminContent({ children }: {
    children: React.ReactNode;
}) {
    const { userInfo, headerCanLoad } = useAppState();
    const router = useRouter();
    useEffect(() => {
        if (userInfo === null && headerCanLoad) {
            alert(ErrorMessage.UNAURHOTIZED);
            router.push(URL.SignOut);
        }
        else {
            if (userInfo?.role === "customer") {
                alert(ErrorMessage.UNAURHOTIZED);
                router.push(URL.SignOut);
            }
        }
    }, [headerCanLoad, router, userInfo]);
    return (<>
      {headerCanLoad && (<div className="flex">
          <AdminSideBar />
          <main className="w-full ms-[250px] overflow-hidden">{children}</main>
        </div>)}
    </>);
}
