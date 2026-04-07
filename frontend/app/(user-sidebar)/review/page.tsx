"use client";

import {
  Button,
  Checkbox,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

interface Review {
  reviewid: number;
  name: string;
  productname: string;
  rating: number;
  reviewdescription: string;
  createdat: string;
  updatedat: string;
}

export default function PostedReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState("");
  const [reviewdescription, setReviewDescription] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isAddMode, setAddMode] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    fetchReviews();
  }, []);

  // useEffect(() => {
  //   if (!isOpen) {
  //     if (!isAddMode) {
  //       setEmpty();
  //     }
  //   }
  // }, [isOpen]);

  // const setEmpty = () => {
  //   setfullName("");
  //   setPhone("");
  //   setPostal_code("");
  //   setStreet("");
  //   setBuilding("");
  //   setUnit_no("");
  //   setRegion("");
  //   setDefault(false);
  // };

  const fetchReviews = () => {
    fetch(`${process.env.BACKEND_URL}/api/getAllReviews`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          alert("Review Error");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.reviews);
        setReviews(data.reviews);
      })
      .catch((error) => {
        console.error("Error fetching reviews", error);
      });
  };

  const deleteReview = (reviewid: number) => {
    fetch(`${process.env.BACKEND_URL}/api/deleteReview/${reviewid}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reviewid }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete review");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const openEditModal = (reviewid: number) => {
    setAddMode(false);
    // getReview(reviewid);
    onOpen();
  };

  const getReview = (reviewid: number) => {
    console.log("reviewid: ", reviewid);
    fetch(`${process.env.BACKEND_URL}/api/getReview/${reviewid}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch review details");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setRating(data.review);
        setReviewDescription(data.review.reviewdescription);
      })
      .catch((error) => {
        console.error("Error fetching review details:", error);
      });
  };

  const editReview = (reviewid: number) => {
    if (!selectedReview) {
      console.error("No review selected for editing");
      return;
    }

    fetch(`${process.env.BACKEND_URL}/api/updateReview/${reviewid}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reviewid: selectedReview.reviewid,
        rating,
        reviewdescription,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error == "Review already exists") {
          alert("Review already exists. Edit with new one!");
        }
        console.log("Review edited successfully:", data);
        onClose();
        fetchReviews();
        setSelectedReview(null);
      })
      .catch((error) => {
        console.error("Error editing review:", error);
      });
  };

  const addOrEditReview = () => {
    console.log("Inside addOrEditReview");
    if (isAddMode) {
      // addReview();
    } else {
      editReview(165);
    }
  };

  const calculateElapsedTime = (createdAt: string): string => {
    const createdTime = new Date(createdAt);
    const now = new Date();
    const elapsedTime = now.getTime() - createdTime.getTime();

    // Convert milliseconds to human-readable format (e.g., "2 days ago")
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return `${seconds} seconds ago`;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {reviews.map((review, index) => (
          <div key={index} className="flex gap-4 p-4">
            <div className="grid gap-4 flex-1">
              <div className="flex gap-4 items-start">
                <div className="grid gap-0.5 text-sm">
                  <h3 className="font-semibold">{review.productname}</h3>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {calculateElapsedTime(review.createdat)}
                  </time>
                </div>

                <div className="flex items-center gap-0.5 ml-auto">
                  {/* Display stars based on the rating */}
                  {Array.from({ length: review.rating }, (_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-primary" />
                  ))}
                  {Array.from({ length: 5 - review.rating }, (_, i) => (
                    <StarIcon
                      key={i + review.rating}
                      className="w-5 h-5 fill-muted stroke-muted-foreground"
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm leading-loose text-gray-500 dark:text-gray-400">
                <p>{review.reviewdescription}</p>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    openEditModal(review.reviewid);
                    setAddMode(false);
                    getReview(review.reviewid);
                  }}
                >
                  Edit
                </Button>
                <Button
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => deleteReview(review.reviewid)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isOpen && (
        <>
          <Modal
            size="4xl"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            scrollBehavior="inside"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>Edit Review</ModalHeader>
                  <ModalBody>
                    <form className="space-y-4 my-8">
                      {/* <div className="flex flex-col">
                  <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={rating} onChange={(e) => setRating(e.target.value)} label="Rating*" />
                </div> */}
                      <div className="flex flex-col">
                        <label className="text-gray-600 dark:text-gray-400">
                          Rating*
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-none"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* <div className="flex">
                        <div className="flex flex-col w-full">
                          <Input
                            classNames={{
                              inputWrapper:
                                "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 w-full rounded-none",
                            }}
                            value={reviewdescription}
                            onChange={(e) =>
                              setReviewDescription(e.target.value)
                            }
                            label="Description*"
                          />
                        </div>
                      </div> */}
                      <div className="flex">
                        <div className="flex flex-col w-full">
                          <label className="text-gray-600 dark:text-gray-400">
                            Description*
                          </label>
                          <textarea
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-none"
                            value={reviewdescription}
                            onChange={(e) =>
                              setReviewDescription(e.target.value)
                            }
                            rows={4} // Adjust the number of rows as needed
                          />
                        </div>
                      </div>

                      <div
                        className="flex items-center"
                        style={{ marginTop: "3xrem" }}
                      >
                        <Button
                          className="w-52 h-10 bg-black dark:bg-white text-white dark:text-black rounded-none text-lg"
                          onClick={addOrEditReview}
                        >
                          {isAddMode ? "Save" : "Confirm"}
                        </Button>
                      </div>
                    </form>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </div>
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
