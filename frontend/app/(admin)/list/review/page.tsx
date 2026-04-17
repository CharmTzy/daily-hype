"use client";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import CustomTable from "@/components/ui/table";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { IAdminReview } from "@/enums/review-interfaces";
import { formatDecimal } from "@/functions/formatter";
import { getAdminReview, getAdminReviewCount, handleDeleteButton } from "@/functions/review-functions";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const columns = ["Review ID", "Review Image", "Customer Name", "Product Name", "Rating", "Description", "Action"];
const avatarFallback = "/icons/avatar-placeholder.svg";

function renderReviewRows(data: IAdminReview[]) {
    return data.map((item, index) => {
        const reviewImage = item.urls?.find((url): url is string => Boolean(url));
        return [
            item.reviewid.toString(),
            reviewImage ? (<ResilientImage className="mx-auto rounded-xl object-cover" src={reviewImage} fallbackSrc="/images/image-not-found.jpg" width={70} height={90} alt={item.productname}/>) : (<ResilientImage className="mx-auto rounded-xl object-cover" src="/images/image-not-found.jpg" width={70} height={90} alt="Image Not Found"/>),
            <div key={`customer-${index}`} className="flex items-center justify-center gap-3 text-[14px]">
                <ResilientImage className="h-10 w-10 rounded-full object-cover" src={item.profileurl} fallbackSrc={avatarFallback} width={40} height={40} alt={item.name}/>
                <label>{item.name}</label>
            </div>,
            <label key={`product-${index}`} className="flex justify-center text-center text-[14px]">
                {item.productname}
            </label>,
            <label key={`rating-${index}`} className="flex justify-center text-[14px]">
                {formatDecimal(item.rating.toString(), 1)}
            </label>,
            <label key={`description-${index}`} className="flex justify-center text-[14px] text-center">
                {item.reviewdescription}
            </label>,
            <div className="flex flex-col" key={`action-${index}`}>
                <Button color="danger" size="sm" onClick={() => handleDeleteButton(item.reviewid)}>
                    Delete
                </Button>
            </div>,
        ] as [string, ...React.ReactNode[]];
    });
}

export default function Page() {
    const { setCurrentActivePage } = useAppState();
    const [reviewData, setReviewData] = useState<[
        string,
        ...React.ReactNode[]
    ][]>([]);
    const [reviewCount, setReviewCount] = useState<number>(1);
    const [pageNo, setPageNo] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [limit, setLimit] = useState<number>(10);
    const router = useRouter();
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.ReviewList);
        Promise.all([getAdminReviewCount(), getAdminReview(0, limit)]).then(([result1, result2]) => {
            if (result1.error) {
                console.error(result1.error);
                if (result1.error === ErrorMessage.UNAURHOTIZED) {
                    alert(ErrorMessage.UNAURHOTIZED);
                    router.push(URL.SignOut);
                }
            }
            else {
                const data = result1.data || 1;
                setReviewCount(data);
                if (result2.error) {
                }
                else {
                    const data = result2.data || [];
                    setReviewData(renderReviewRows(data));
                }
            }
        });
    }, []);
    useEffect(() => {
        setIsLoading(true);
    }, [pageNo]);
    useEffect(() => {
        setPageNo(0);
        setIsLoading(true);
    }, [limit]);
    useEffect(() => {
        if (isLoading) {
            getAdminReview(pageNo, limit).then((result) => {
                const data = result.data || [];
                setReviewData(renderReviewRows(data));
                setIsLoading(false);
            });
        }
    }, [isLoading]);
    return (<>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-4">
          <label className="text-large font-semibold">Review List</label>
        </div>
        <div className="mb-5">
          <CustomTable columns={columns} onClick={(clickedValue) => {
            alert(clickedValue);
        }} rows={reviewData} setRowsPerPage={setLimit} page={pageNo} setPage={setPageNo} totalCount={reviewCount}/>
        </div>
      </div>
    </>);
}
