import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import FeaturedLessons from "./components/FeaturedLessons";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

/**
 * App Component
 *
 * Renders the main application layout with header, hero section, services,
 * featured lessons, call-to-action, and footer.
 *
 * @returns {JSX.Element} The main application layout.
 */
const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="alert alert-warning shadow-lg mx-auto my-4 max-w-6xl">
        <div className="flex justify-center items-center space-x-2">
          <i className="bi bi-exclamation-triangle-fill text-sm" aria-hidden="true"></i>
          <span className="text-sm font-semibold">Welcome to Teach Niche! The site is currently in Beta, so be please patient as the site improves.</span>
        </div>
      </div>
      <main className="flex-grow">
        <Hero />
        <Services />
        <FeaturedLessons />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
