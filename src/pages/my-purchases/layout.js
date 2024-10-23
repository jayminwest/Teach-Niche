// src/pages/my-purchases/layout.js
import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "../marketplace/components/LessonsGrid";
import { useAuth } from "../../context/AuthContext";

/**
 * MyPurchasesLayout Component
 *
 * Renders the page displaying the user's purchased lessons with sorting options.
 *
 * @returns {JSX.Element} The My Purchases page.
 */
const MyPurchasesLayout = () => {
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState("default");

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-center">
            Please{" "}
            <a href="/sign-in" className="text-blue-500 hover:underline">
              sign in
            </a>{" "}
            to view your purchased lessons.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Purchased Lessons</h1>
          <div className="form-control w-full max-w-xs">
            <select
              className="select select-bordered"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="default">Sort by</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="creator_asc">Creator: A to Z</option>
              <option value="creator_desc">Creator: Z to A</option>
            </select>
          </div>
        </div>
        <LessonsGrid showPurchasedOnly sortOption={sortOption} />
      </main>
      <Footer />
    </div>
  );
};

export default MyPurchasesLayout;
