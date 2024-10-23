import React from "react";

/**
 * ActionButtons Component
 *
 * Renders action buttons for profile actions like creating a lesson, deleting a profile, and logging out.
 *
 * @param {Object} props
 * @param {Function} props.onCreateLesson - Function to handle lesson creation.
 * @param {Function} props.onDeleteProfile - Function to handle profile deletion.
 * @param {Function} props.onLogout - Function to handle user logout.
 * @returns {JSX.Element} The Action Buttons component.
 */
const ActionButtons = ({ onCreateLesson, onDeleteProfile, onLogout }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <button
          className="btn btn-error mr-2"
          onClick={onDeleteProfile}
          aria-label="Delete Profile"
        >
          Delete Profile
        </button>
        <button
          className="btn btn-primary"
          onClick={onLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
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
