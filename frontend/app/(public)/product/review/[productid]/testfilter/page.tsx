// export default function Page() {
//   return <div>THis is review</div>;
// }
"use client";

import React, { useEffect } from "react";
// import "./review.css"; // Import the CSS file
// import { loadHeaderFooter } from "./js/headerFooter";
// import { getReview, displayReviewsByRating, displayAverageRating } from "./js/review"; // Assuming you have these functions in review.js

const ReviewsPage: React.FC = () => {
  useEffect(() => {
    // loading header and footer html files
    // loadHeaderFooter();

    // initially display all reviews in "reviews" class
    // getReview();

    // data manipulation
    // apply rating filter
    const ratingFilter = document.getElementById(
      "ratingFilter"
    ) as HTMLSelectElement;
    ratingFilter.addEventListener("change", function () {
      const selectedRating = ratingFilter.value;
      //   displayReviewsByRating(selectedRating);
    });

    // Calculate and display the average rating
    // displayAverageRating();
  }, []);

  return (
    <div>
      <label>Product Name: Sample Product</label>
      <br />
      <label>Product Size: Large</label>
      <br />
      <label>Product Color: Blue</label>
      <br />
      <br />
      <label>Average Rating: 4.2</label>

      <div className="average-rating">
        {/* This is where the average rating will be displayed */}
      </div>

      <div className="filter">
        <label htmlFor="ratingFilter">Rating:</label>
        <select id="ratingFilter">
          <option value="all">All Ratings</option>
          <option value="5">5 stars (8)</option>
          <option value="4">4 stars (14)</option>
          <option value="3">3 stars (1)</option>
          <option value="2">2 stars (1)</option>
          <option value="1">1 star (0)</option>
        </select>

        <label htmlFor="sizeFilter">Size:</label>
        <select id="sizeFilter">
          <option value="all">All Sizes</option>
          <option value="XXL">XXL</option>
          <option value="XL">XL</option>
          <option value="L">L</option>
          <option value="M">M</option>
          <option value="S">S</option>
        </select>

        <label htmlFor="colourFilter">Colour:</label>
        <select id="colourFilter">
          <option value="all">All Colours</option>
          <option value="blue">Blue</option>
          <option value="pink">Pink</option>
          <option value="yello">Yellow</option>
          <option value="green">Green</option>
        </select>

        <label htmlFor="imageFilter">Image:</label>
        <select id="colourFilter">
          <option value="all">All Colours</option>
          <option value="blue">Blue</option>
          <option value="pink">Pink</option>
          <option value="yello">Yellow</option>
          <option value="green">Green</option>
        </select>

        <label htmlFor="sortFilter">Sort:</label>
        <select id="sortFilter">
          <option value="popular">Popular</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <label>
          <input type="checkbox" id="mediaToggle" />
          With Media Only
        </label>
      </div>

      <div className="reviews">
        {/* This is where the reviews will be displayed */}
      </div>
    </div>
  );
};

export default ReviewsPage;
