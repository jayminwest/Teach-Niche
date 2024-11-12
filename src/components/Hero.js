import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../public/images/HeroBackground.jpg";

/**
 * Hero Component
 *
 * Displays the hero section with a background image and a call-to-action.
 * Includes responsive design and accessibility features.
 *
 * @returns {JSX.Element} The hero section.
 */
const Hero = () => {
  return (
    <section
      className="hero-section py-8 md:py-12"
      aria-label="Welcome section"
    >
      <div className="container mx-auto px-4">
        <div
          className="hero min-h-[500px] rounded-box overflow-hidden bg-center bg-cover relative"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
          role="img"
          aria-label="Grayscale photography of a modern escalator in Paris underground station with circular architectural design"
        >
          <div className="absolute inset-0 bg-gray-800 bg-opacity-30 backdrop-grayscale backdrop-brightness-75"></div>
          <div className="hero-content text-center text-white relative z-10">
            <div className="max-w-lg">
              <h1 className="mb-5 sm:mb-7 text-4xl sm:text-5xl md:text-6xl font-bold animate-fadeIn">
                About Teach Niche
              </h1>
              <p className="mb-5 sm:mb-7 sm:text-lg md:text-xl opacity-90">
                Empowering the kendama community by providing a platform for
                players to share knowledge, hone their skills, and earn income
                doing what they love.
              </p>
              <Link
                to="/marketplace"
                className="btn btn-warning sm:btn-wide hover:scale-105 transition-transform"
                aria-label="Browse available lessons in the marketplace"
              >
                View Lessons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
