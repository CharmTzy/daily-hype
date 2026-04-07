"use client";
import React, { useEffect, useState } from "react";

interface ReviewFormProps {
  params: { orderid: number; productdetailid: number };
}

export default function Page({ params }: ReviewFormProps) {
  const { orderid, productdetailid } = params;
  const [rating, setRating] = useState<number>(0);
  const [reviewDescription, setReviewDescription] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    console.log(id);
    document.getElementById("id")?.setAttribute("value", id || "");
  }, []);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic for handling form submission
    WriteReview();
  };

  const WriteReview = () => {
    fetch(`${process.env.BACKEND_URL}/api/createReview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderid,
        rating,
        reviewDescription,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data if needed
        console.log(data);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error writing review:", error);
      });
  };

  return (
    <div>
      <form id="reviewForm" onSubmit={submitReview} className="max-w-600 mx-auto p-20 border-solid border-gray-300 rounded-5">
        <input type="hidden" id="id" name="id" />

        <label className="font-bold block mb-5">Product Name: Sample Product</label>
        <br />
        <label className="font-bold block mb-5">Product Size: Large</label>
        <br />
        <label className="font-bold block mb-5">Product Color: Blue</label>
        <br />
        <br />

        <label htmlFor="rating" className="font-bold block">
          Rating:
        </label>
        <select id="rating" name="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className=" border-1 border-solid border-gray-300 rounded-4">
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <br />
        <br />

        <label htmlFor="reviewDescription" className="font-bold block">
          Review Description:
        </label>
        <br />
        <textarea id="reviewDescription" name="reviewDescription" rows={4} cols={50} className="w-full p-8 border-1 border-solid border-gray-300 rounded-4" value={reviewDescription} onChange={(e) => setReviewDescription(e.target.value)}></textarea>
        <br />
        <br />

        <label htmlFor="image" className="font-bold block">
          Upload Image:
        </label>
        <input type="file" id="image" name="image" className="w-full p-8 border-solid border-gray-300 rounded-4" />
        <br />
        <br />

        <input type="submit" value="Submit" className="bg-green-500 text-white p-2 rounded-4 cursor-pointer text-16" />
      </form>
    </div>
  );
}
