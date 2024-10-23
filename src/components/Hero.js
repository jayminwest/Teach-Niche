import React from "react";
import { Link } from "react-router-dom";

/**
 * Hero Component
 *
 * Displays the hero section with a background image and a call-to-action.
 *
 * @returns {JSX.Element} The hero section.
 */
const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div
          className="hero h-96 md:h-[500px] rounded-box overflow-hidden"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1444210971048-6130cf0c46cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          role="img"
          aria-label="Person illustration on brown wooden dock stage photography during nighttime"
        >
          <div className="hero-overlay bg-gray-800 bg-opacity-60"></div>
          <div className="hero-content text-center text-white">
            <div className="max-w-lg">
              <h1 className="mb-5 sm:mb-7 text-4xl sm:text-5xl font-bold">
                About Teach Niche
              </h1>
              <p className="mb-5 sm:mb-7 sm:text-lg">
                Empowering the kendama community by providing a platform for
                players to share knowledge, hone their skills, and earn income
                doing what they love.
              </p>
              <Link to="/marketplace" className="btn btn-warning sm:btn-wide">
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
