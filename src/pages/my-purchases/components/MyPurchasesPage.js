import React from "react";
import LessonsGrid from "../../marketplace/components/LessonsGrid";
import SortingOptions from "./SortingOptions";
import usePurchasesSorting from "../hooks/usePurchasesSorting";

/**
 * MyPurchasesPage Component
 * Handles the main content area of the purchases page, including
 * sorting functionality and lessons display.
 *
 * @returns {JSX.Element} The main purchases page content
 */
const MyPurchasesPage = () => {
  const { sortOption, handleSortChange } = usePurchasesSorting();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 space-y-6">
          <h1 className="font-bold text-2xl md:text-3xl">
            My Lessons
          </h1>
          <SortingOptions
            sortOption={sortOption}
            onSortChange={handleSortChange}
          />
        </aside>

        <div className="flex-1">
          <LessonsGrid
            showPurchasedOnly={true}
            sortOption={sortOption}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPurchasesPage;
