import React from "react";

export default function AlertMessage({ error, success }) {
  if (error) {
    return <div className="alert alert-error mt-4">{error}</div>;
  }
  if (success) {
    return <div className="alert alert-success mt-4">{success}</div>;
  }
  return null;
}
