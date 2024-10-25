import React from "react";
import LessonsGrid from "../pages/marketplace/components/LessonsGrid";

/**
 * FeaturedLessons Component
 *
 * Displays a section of featured lessons from the marketplace, limited to six lessons.
 * Uses a dark background to make the section stand out.
 *
 * @returns {JSX.Element} The featured lessons section.
 */
const FeaturedLessons = () => {
  return (
    <section
      className="py-10 md:py-16 bg-neutral relative overflow-hidden"
      aria-labelledby="featured-lessons-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center text-white mb-8">
          <h2
            id="featured-lessons-heading"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            Featured Lessons
          </h2>
          <p className="text-lg sm:text-2xl mb-6 md:mb-14 opacity-90">
            Find lessons from your favorite players.
          </p>
        </div>
        <div className="relative z-10">
          <LessonsGrid 
            showPurchasedOnly={false} 
            limit={6} 
            className="featured-lessons-grid"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedLessons;
