import React from "react";

/**
 * ActionButtons Component
 *
 * Renders action buttons for profile actions like creating a lesson or deleting a profile.
 *
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The Action Buttons.
 */
export default function ActionButtons({ onCreateLesson, onDeleteProfile }) {
  return (
    <div className="flex justify-between">
      <button
        className="btn btn-error"
        onClick={onDeleteProfile}
      >
        Delete Profile
      </button>
      <button
        className="btn btn-secondary"
        onClick={onCreateLesson}
      >
        Create Lesson
      </button>
    </div>
  );
}
