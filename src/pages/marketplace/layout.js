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
  const [priceFilter, setPriceFilter] = useState("all");
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 h-full">
          {/* Left Sidebar with Filters */}
          <div className="md:w-64 space-y-6">
            <h1 className="font-bold text-2xl md:text-3xl">
              Marketplace
            </h1>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price</label>
                <select
                  className="select select-bordered w-full"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>

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
              sortOption={sortOption} 
              priceFilter={priceFilter}
            />
          </div>
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default MarketplaceLayout;
