import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "./components/LessonsGrid";

/**
 * MarketplaceLayout Component
 *
 * Renders the marketplace page with a grid of available lessons.
 *
 * @returns {JSX.Element} The Marketplace page.
 */
const MarketplaceLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Lesson Marketplace</h1>
        <LessonsGrid />
      </main>
      <Footer />
    </div>
  );
};

export default MarketplaceLayout;
