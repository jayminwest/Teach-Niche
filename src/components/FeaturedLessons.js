import React from "react";
import LessonsGrid from "../pages/marketplace/components/LessonsGrid";

/**
 * FeaturedLessons Component
 *
 * Displays a section of featured lessons from the marketplace.
 *
 * @returns {JSX.Element} The featured lessons section.
 */
const FeaturedLessons = () => {
  return (
    <section className="py-10 md:py-16 bg-neutral" aria-labelledby="featured-lessons-heading">
      <div className="container">
        <div className="text-center text-white mb-8">
          <h2 id="featured-lessons-heading" className="text-3xl sm:text-5xl font-bold">
            Featured Lessons
          </h2>
          <p className="text-lg sm:text-2xl mb-6 md:mb-14">
            Explore our curated selection of top-rated lessons.
          </p>
        </div>
        <LessonsGrid showPurchasedOnly={false} />
      </div>
    </section>
  );
};

export default FeaturedLessons;
