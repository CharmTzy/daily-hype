// Name: Codex
// Description: Admin profile landing page

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { Button, Chip } from "@nextui-org/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Page() {
  const { setCurrentActivePage, userInfo } = useAppState();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.AdminProfile);
  }, [setCurrentActivePage]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Profile</h1>
            <p className="mt-2 text-sm text-slate-600">A simple home for your own admin account details and the quickest actions related to your profile.</p>
          </div>
          <Chip color="primary" variant="flat">
            {userInfo?.role ?? "admin"}
          </Chip>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-2 text-lg font-medium text-slate-900">{userInfo?.name ?? "Unavailable"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 text-lg font-medium text-slate-900 break-all">{userInfo?.email ?? "Unavailable"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Login Method</p>
            <p className="mt-2 text-lg font-medium capitalize text-slate-900">{userInfo?.method ?? "Unavailable"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Account ID</p>
            <p className="mt-2 text-lg font-medium text-slate-900">{userInfo?.id ?? "Unavailable"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={userInfo ? `/list/user-update?userId=${userInfo.id}` : URL.UserList}>
            <Button color="primary">Edit account</Button>
          </Link>
          <Link href={URL.UserList}>
            <Button variant="bordered">Manage users</Button>
          </Link>
          <Link href={URL.Dashboard}>
            <Button variant="light">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
