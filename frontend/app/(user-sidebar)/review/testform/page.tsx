"use client";

import React, { useEffect } from "react";
// import "../review.css"; // Import the CSS file

interface ReviewFormProps {
  // Define any props you might need
}

const ReviewForm: React.FC<ReviewFormProps> = () => {
  useEffect(() => {
    // Your existing window.onload logic
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      alert("Please log in first!");
      return;
    }

    // loadHeaderFooter();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    console.log(id);
    document.getElementById("id")?.setAttribute("value", id || "");
    // fillFormIfReviewExists(id);
  }, []); // Empty dependency array ensures the effect runs once on mount

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic for handling form submission
  };

  return (
    <div>
      <form id="reviewForm" onSubmit={submitReview}>
        <input type="hidden" id="id" name="id" />

        <label>Product Name: Sample Product</label>
        <br />
        <label>Product Size: Large</label>
        <br />
        <label>Product Color: Blue</label>
        <br />
        <br />

        <label htmlFor="rating">Rating:</label>
        <select id="rating" name="rating">
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <br />
        <br />

        <label htmlFor="reviewDescription">Review Description:</label>
        <br />
        <textarea
          id="reviewDescription"
          name="reviewDescription"
          rows={4}
          cols={50}
        ></textarea>
        <br />
        <br />

        <label htmlFor="image">Upload Image:</label>
        <input type="file" id="image" name="image" />
        <br />
        <br />

        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default ReviewForm;
