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
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <p className="text-center">
            Please{" "}
            <a href="/sign-in" className="text-blue-500 hover:underline">
              sign in
            </a>{" "}
            to view your purchased lessons.
          </p>
        </main>
        <Footer className="mt-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 h-full">
          {/* Left Sidebar with Filters */}
          <div className="md:w-64 space-y-6">
            <h1 className="font-bold text-2xl md:text-3xl">
              My Lessons
            </h1>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <select
                  className="select select-bordered w-full"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="creator_asc">Creator: A to Z</option>
                  <option value="creator_desc">Creator: Z to A</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <LessonsGrid 
              showPurchasedOnly={true}
              sortOption={sortOption}
            />
          </div>
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default MyPurchasesLayout;
