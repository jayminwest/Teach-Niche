import React from "react";
import { Link } from "react-router-dom";

/**
 * CTA (Call-to-Action) Component
 *
 * Renders a call-to-action section encouraging users to join Teach Niche.
 *
 * @returns {JSX.Element} The CTA section.
 */
const CTA = () => {
  return (
    <section className="py-12 md:py-24" aria-labelledby="cta-heading">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center md:text-left">
          <h2
            id="cta-heading"
            className="flex-grow text-4xl md:text-5xl 2xl:text-6xl font-bold text-primary"
          >
            Share Your Expertise <br className="hidden sm:inline" />
            and Grow with Teach Niche.
          </h2>
          <Link
            to="/sign-up"
            className="btn btn-warning rounded-full sm:btn-lg"
            role="button"
          >
            Join Us!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
