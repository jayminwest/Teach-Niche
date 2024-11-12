import React from "react";
import LessonCard from "../../marketplace/components/LessonCard";
import SortingOptions from "./SortingOptions";
import usePurchasesSorting from "../hooks/usePurchasesSorting";
import usePurchasedLessons from "../hooks/usePurchasedLessons";

/**
 * MyPurchasesPage Component
 * Handles the main content area of the purchases page, including
 * sorting functionality and lessons display.
 *
 * @returns {JSX.Element} The main purchases page content
 */
const MyPurchasesPage = () => {
  const { sortOption, handleSortChange } = usePurchasesSorting();
  const { lessons, loading } = usePurchasedLessons(sortOption);

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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="w-full max-w-sm">
                  <LessonCard
                    {...lesson}
                    isPurchased={true}
                    purchaseDate={lesson.purchaseDate}
                    creatorName={lesson.creator_name || "Unknown Creator"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700">No Purchased Lessons</h2>
              <p className="text-gray-500 mt-2">You haven't purchased any lessons yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchasesPage;
