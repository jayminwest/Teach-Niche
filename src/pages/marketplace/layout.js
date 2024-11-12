import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "./components/LessonsGrid";
import MarketplaceFilters from "./components/ui/MarketplaceFilters";
import {
  MarketplaceProvider,
  useMarketplace,
} from "./context/MarketplaceContext";
import MarketplaceStats from "./components/MarketplaceStats";

const MarketplaceContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { sortOption, priceFilter } = useMarketplace();

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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 h-full">
          <div className="md:w-64 space-y-6">
            <h1 className={`font-bold ${isMobile ? "text-2xl" : "text-3xl"}`}>
              Marketplace
            </h1>
            <MarketplaceStats />
            <MarketplaceFilters />
          </div>

          <div className="flex-1">
            <LessonsGrid
              sortOption={sortOption}
              priceFilter={priceFilter}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const MarketplaceLayout = () => {
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
};

export default MarketplaceLayout;
