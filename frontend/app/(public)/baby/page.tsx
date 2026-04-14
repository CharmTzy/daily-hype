"use client";

import TypeCatalogPage from "@/components/product/type-catalog-page";
import { CurrentActivePage } from "@/enums/global-enums";

export default function BabyProduct() {
    return <TypeCatalogPage typeId={5} title="Baby" activePage={CurrentActivePage.Baby} />;
}
