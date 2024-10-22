// src/pages/not-found/layout.js
import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * NotFound Component
 *
 * Renders a 404 page for when a route is not found.
 *
 * @returns {JSX.Element} The 404 Not Found page.
 */
const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="mb-8 text-center">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/marketplace" className="btn btn-primary">
          Go to Marketplace
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
