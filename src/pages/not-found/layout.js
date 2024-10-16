// src/pages/not-found/layout.js
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/marketplace" className="btn btn-primary">
        Go to Marketplace
      </Link>
    </div>
  );
}
