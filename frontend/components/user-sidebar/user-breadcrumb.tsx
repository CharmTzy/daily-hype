// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { CurrentActivePage, URL } from "@/enums/global-enums";
import { capitaliseWord } from "@/functions/formatter";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";

export default function UserBreadCrumb({ currentActivePage }: { currentActivePage: CurrentActivePage }) {
  return (
    <div>
      <Breadcrumbs className="w-full mt-2 mb-8">
        <BreadcrumbItem href={URL.Home}>Home</BreadcrumbItem>
        <BreadcrumbItem>{capitaliseWord(currentActivePage)}</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  );
}
