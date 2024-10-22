import React from "react";

/**
 * ActionButtons Component
 *
 * Renders action buttons for profile actions like creating a lesson or deleting a profile.
 *
 * @param {Object} props
 * @param {Function} props.onCreateLesson - Function to handle lesson creation.
 * @param {Function} props.onDeleteProfile - Function to handle profile deletion.
 * @returns {JSX.Element} The Action Buttons component.
 */
const ActionButtons = ({ onCreateLesson, onDeleteProfile }) => {
  return (
    <div className="flex justify-between">
      <button
        className="btn btn-error"
        onClick={onDeleteProfile}
        aria-label="Delete Profile"
      >
        Delete Profile
      </button>
      <button
        className="btn btn-success"
        onClick={onCreateLesson}
        aria-label="Create Lesson"
      >
        Create Lesson
      </button>
    </div>
  );
};

export default ActionButtons;
