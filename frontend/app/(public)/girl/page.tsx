"use client";

import TypeCatalogPage from "@/components/product/type-catalog-page";
import { CurrentActivePage } from "@/enums/global-enums";

export default function GirlProduct() {
    return <TypeCatalogPage typeId={3} title="Girl" activePage={CurrentActivePage.Girl} />;
}
