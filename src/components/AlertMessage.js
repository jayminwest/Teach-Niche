import React from "react";

/**
 * AlertMessage Component
 *
 * Displays an alert message based on the provided error or success props.
 *
 * @param {Object} props
 * @param {string} props.error - The error message to display.
 * @param {string} props.success - The success message to display.
 * @returns {JSX.Element|null} The alert message component.
 */
export default function AlertMessage({ error, success }) {
  if (error) {
    // Render error alert
    return <div className="alert alert-error mt-4">{error}</div>;
  }
  if (success) {
    // Render success alert
    return <div className="alert alert-success mt-4">{success}</div>;
  }
  return null;
}
