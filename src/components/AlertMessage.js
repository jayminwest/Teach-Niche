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
    <div className="mt-4">
      {error && (
        <div role="alert" className="text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="text-green-500">
          {success}
        </div>
      )}
    </div>
  );
};

export default AlertMessage;
