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
export default function MarketplaceLayout() {
  return (
    <div>
      <Header />
      <LessonsGrid />
      <Footer />
    </div>
  );
}
