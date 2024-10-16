import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section>
      <div className="container">
        <div
          className="hero h-96 md:h-[500px] rounded-box overflow-hidden"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          }}
        >
          <div className="hero-overlay bg-opacity-60 bg-primary"></div>
          <div className="hero-content text-center text-secondary-content">
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
}
