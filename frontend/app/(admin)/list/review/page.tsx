// Name: Angie
// Admin No:
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import CustomTable from "@/components/ui/table";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { formatDecimal } from "@/functions/formatter";
import { getAdminReview, getAdminReviewCount, handleDeleteButton } from "@/functions/review-functions";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const columns = ["Review ID", "Review Image", "Customer Name", "Product Name", "Rating", "Description", "Action"];

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [reviewData, setReviewData] = useState<[string, ...React.ReactNode[]][]>([]);
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
      } else {
        const data = result1.data || 1;
        setReviewCount(data);
        if (result2.error) {
        } else {
          const data = result2.data || [];
          setReviewData(
            data.map((item, index) => {
              return [
                item.reviewid.toString(),
                item.urls[0] === null ? <Image className="mx-auto" src="/images/image-not-found.jpg" width={70} height={90} alt="Image Not Found" /> : <Image className="mx-auto" src={item.urls[0]} width={70} height={90} alt={item.productname} />,
                <label key={index} className="flex justify-center text-[14px]">
                  {item.name}
                </label>,
                <label key={index} className="flex justify-center text-center text-[14px]">
                  {item.productname}
                </label>,
                <label key={index} className="flex justify-center text-[14px]">
                  {formatDecimal(item.rating.toString(), 1)}
                </label>,
                <label key={index} className="flex justify-center text-[14px] text-center">
                  {item.reviewdescription}
                </label>,
                <div className="flex flex-col" key={index}>
                  {/* <Button className="mb-2" color="primary" size="sm">
                    Update
                  </Button> */}
                  <Button color="danger" size="sm" onClick={() => handleDeleteButton(item.reviewid)}>
                    Delete
                  </Button>
                </div>,
              ];
            })
          );
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
        setReviewData(
          data.map((item, index) => {
            return [
              item.reviewid.toString(),
              item.urls[0] === null ? <Image className="mx-auto" src="/images/image-not-found.jpg" width={70} height={90} alt="Image Not Found" /> : <Image className="mx-auto" src={item.urls[0]} width={70} height={90} alt={item.productname} />,
              <label key={index} className="flex justify-center text-[14px]">
                {item.name}
              </label>,
              <label key={index} className="flex justify-center text-center text-[14px]">
                {item.productname}
              </label>,
              <label key={index} className="flex justify-center text-[14px]">
                {formatDecimal(item.rating.toString(), 1)}
              </label>,
              <label key={index} className="flex justify-center text-[14px] text-center">
                {item.reviewdescription}
              </label>,
              <div className="flex flex-col" key={index}>
                {/* <Button className="mb-2" color="primary" size="sm">
                  Update
                </Button> */}
                <Button color="danger" size="sm" onClick={() => {handleDeleteButton(item.reviewid); window.location.reload()}}>
                    Delete
                  </Button>
              </div>,
            ];
          })
        );
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return (
    <>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-4">
          <label className="text-large font-semibold">Review List</label>
        </div>
        <div className="mb-5">
          <CustomTable
            columns={columns}
            onClick={(clickedValue) => {
              alert(clickedValue);
            }}
            rows={reviewData}
            setRowsPerPage={setLimit}
            page={pageNo}
            setPage={setPageNo}
            totalCount={reviewCount}
          />
        </div>
      </div>
    </>
  );
}
