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
  if (error) {
    return <div className="alert alert-error mt-4" role="alert">{error}</div>;
  }
  if (success) {
    return <div className="alert alert-success mt-4" role="alert">{success}</div>;
  }
  return null;
};

export default AlertMessage;
