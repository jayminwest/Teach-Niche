import React from "react";
import LessonCard from "../../marketplace/components/LessonCard";

/**
 * PurchasedLessons Component
 *
 * Displays a grid of lessons purchased by the user.
 *
 * @param {Object} props
 * @param {Array} props.lessons - Array of purchased lessons
 * @returns {JSX.Element} The Purchased Lessons component
 */
const PurchasedLessons = ({ lessons }) => {
  if (!lessons.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven't purchased any lessons yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="card-title text-2xl mb-6">Purchased Lessons</h2>
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
    </div>
  );
};

export default PurchasedLessons;
