import { getBestSellingByLimit, getLatestProductsByLimit } from "@/functions/product-functions";
import HomeContent from "./home-content";

export const revalidate = 300;

export default async function Home() {
    const [latestResult, bestSellingResult] = await Promise.all([
        getLatestProductsByLimit(12),
        getBestSellingByLimit(12),
    ]);
    return (
        <HomeContent
            latestProduct={latestResult.data ?? []}
            bestSelling={bestSellingResult.data ?? []}
        />
    );
}
