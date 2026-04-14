"use client";

import TypeCatalogPage from "@/components/product/type-catalog-page";
import { CurrentActivePage } from "@/enums/global-enums";

export default function ManProduct() {
    return <TypeCatalogPage typeId={2} title="Men" activePage={CurrentActivePage.Man} />;
}
