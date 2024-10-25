import React from "react";

/**
 * AlertMessage Component
 *
 * Displays an alert message based on the provided error or success props.
 *
 * @param {Object} props
 * @param {string} [props.error] - The error message to display.
 * @param {string} [props.success] - The success message to display.
 * @returns {JSX.Element|null} The alert message component or null if no message.
 */
const AlertMessage = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div 
      className={`alert ${error ? 'alert-error' : 'alert-success'} mt-4`}
      role="alert"
      aria-live="polite"
    >
      {error || success}
    </div>
  );
};

export default AlertMessage;
