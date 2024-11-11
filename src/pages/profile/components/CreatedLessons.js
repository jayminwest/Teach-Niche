import React from "react";
import LessonCard from "../../marketplace/components/LessonCard";

/**
 * CreatedLessons Component
 *
 * Displays a grid of lessons created by the user.
 *
 * @param {Object} props
 * @param {Array} props.lessons - Array of created lessons
 * @param {string} props.creatorName - Name of the lesson creator
 * @param {string} props.creatorId - ID of the creator
 * @param {Function} props.onDeleteLesson - Function to handle lesson deletion
 * @returns {JSX.Element} The Created Lessons component
 */
const CreatedLessons = ({ lessons, creatorName, creatorId, onDeleteLesson }) => {
  if (!lessons.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You haven't created any lessons yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="card-title text-2xl mb-6">Created Lessons</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="w-full max-w-sm">
            <LessonCard
              {...lesson}
              creator_id={creatorId}
              isCreated={true}
              isPurchased={false}
              creatorName={creatorName}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatedLessons; 