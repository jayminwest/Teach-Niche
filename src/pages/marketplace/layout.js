import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "./components/LessonsGrid";

/**
 * MarketplaceLayout Component
 *
 * Renders the marketplace page with a grid of available lessons and sorting options.
 *
 * @returns {JSX.Element} The Marketplace page.
 */
const MarketplaceLayout = () => {
  const [sortOption, setSortOption] = useState("default");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div
          className={`${
            isMobile
              ? "flex flex-col space-y-4"
              : "flex justify-between items-center"
          } mb-6`}
        >
          <h1 className={`font-bold ${isMobile ? "text-2xl" : "text-3xl"}`}>
            Lesson Marketplace
          </h1>
          <div
            className={`form-control ${
              isMobile ? "w-full" : "w-full max-w-xs"
            }`}
          >
            <select
              className="select select-bordered w-full"
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
        <LessonsGrid sortOption={sortOption} />
      </main>
      <Footer />
    </div>
  );
};

export default MarketplaceLayout;
