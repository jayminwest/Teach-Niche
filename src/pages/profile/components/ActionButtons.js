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
 * @param {boolean} props.stripeConnected - Whether the user has connected their Stripe account.
 * @param {Function} props.onStripeConnect - Function to handle Stripe connection.
 * @returns {JSX.Element} The Action Buttons component.
 */
const ActionButtons = ({
  onCreateLesson,
  onDeleteProfile,
  onLogout,
  stripeConnected,
  onStripeConnect,
}) => {
  const handleCreateLesson = () => {
    if (stripeConnected) {
      onCreateLesson();
    } else {
      onStripeConnect();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          className="btn btn-error w-full sm:w-auto"
          onClick={onDeleteProfile}
          aria-label="Delete Profile"
        >
          Delete Profile
        </button>
        <button
          className="btn btn-primary w-full sm:w-auto"
          onClick={onLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      <button
        className="btn btn-success w-full sm:w-auto"
        onClick={handleCreateLesson}
        aria-label={stripeConnected
          ? "Create Lesson"
          : "Connect Stripe to Create Lessons"}
      >
        {stripeConnected ? "Create Lesson" : "Connect Stripe to Create Lessons"}
      </button>
    </div>
  );
};

export default ActionButtons;
