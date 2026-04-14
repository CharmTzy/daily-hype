"use client";

import TypeCatalogPage from "@/components/product/type-catalog-page";
import { CurrentActivePage } from "@/enums/global-enums";

export default function WomanProduct() {
    return <TypeCatalogPage typeId={1} title="Women" activePage={CurrentActivePage.Woman} />;
}
