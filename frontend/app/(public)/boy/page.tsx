"use client";

import TypeCatalogPage from "@/components/product/type-catalog-page";
import { CurrentActivePage } from "@/enums/global-enums";

export default function BoyProduct() {
    return <TypeCatalogPage typeId={4} title="Boy" activePage={CurrentActivePage.Boy} />;
}
