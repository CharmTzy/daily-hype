"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductReviews() {
  interface Review {
    productID: number;
  }

  const [productID, setProductID] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const { productid } = useParams<{ productid: string }>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (productid) {
      console.log(productid);
      const parsedProductId = Number(productid);
      setProductID(parsedProductId);
      fetchReviews(parsedProductId);
    }
  }, [productid]);

  const fetchReviews = (productId: number) => {
    console.log("hello" + productId);
    fetch(`${process.env.BACKEND_URL}/api/review/${productId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);
        setReviews(data.review);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
      });
  };

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating === null || isNaN(rating) ? null : rating);
};


  
const filteredReviews = reviews.filter((review) => {
  if (selectedRating !== null && review.rating !== selectedRating) {
      return false;
  }
  return true;
});


  const formatDateString = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  const renderStarIcons = (rating: number) => {
    console.log(averageRating());
    const stars = [];
    let roundedRating = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        // Full star
        stars.push(
          <StarIcon key={i} className={`text-yellow-400 w-4 h-4`} />
        );
      } else if (i === roundedRating + 1 && rating % 1 !== 0) {
        // Half star
        stars.push(
          <StarHalfIcon key={i} className={`text-yellow-400 w-4 h-4`} />
        );
      } else {
        // Empty star
        stars.push(
          <StarIcon key={i} className={`text-gray-300 w-4 h-4`} />
        );
      }
    }

    return stars;
  };

  const averageRating = () => {
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return totalRating / reviews.length;
  };







  return (
    <div>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        <div className="mt-4 border-b border-gray-200">
          <div className="flex justify-between items-center pb-6">
            <div className="flex items-center">
              <h3 className="text-4xl font-bold text-gray-900 mr-2 dark:text-white">
                {averageRating().toFixed(2)}
              </h3>
              <div className="flex items-center">
                {renderStarIcons(averageRating())}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="rating-filter">
            <select className="border border-black"
              onChange={(e) => handleRatingFilter(parseInt(e.target.value))}
            >
             <option value={String(null)}>All Ratings</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} Stars
                </option>
              ))}
            </select>
           
          </div>

          {filteredReviews.map((review, index) => (
            <div key={index} className="mt-6">
              <div className="mt-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-20 max-w-[40%]">
                    <h4 className="text-lg font-bold text-gray-900 w-52 dark:text-white">
                      {review.name}
                    </h4>

                    <div className="flex w-52">
                      {renderStarIcons(review.rating)}
                    </div>
                  </div>
                  <div className="flex space-x-4 ml-20">
                    {review.urls.map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Review Image ${i + 1}`}
                        className="w-20 h-20"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDateString(review.createdat)}
                  </span>
                </div>
                <div className="flex text-gray-600 justify-items-start space-x-20 max-w-[70%] mb-12">
                  <div className="flex-col w-52">
                    <p>Colour: {review.colorname}</p>
                    <p>Size: {review.sizename}</p>
                  </div>
                  <div className="flex ">
                    <p>Description: {review.reviewdescription}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center space-x-2">
            <ThumbsUpIcon className="text-gray-500 w-5 h-5" />
            <span className="text-sm text-gray-500">
            Helpful ({filteredReviews.length})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarHalfIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2" />
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ThumbsUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}
