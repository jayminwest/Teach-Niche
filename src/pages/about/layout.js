import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AboutUs Component
 *
 * Renders the About Us page with information about Teach Niche.
 *
 * @returns {JSX.Element} The About Us page.
 */
const AboutUs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTeachersClick = () => {
    navigate(user ? "/profile" : "/sign-up");
  };

  const values = [
    "Community Collaboration",
    "Growth and Learning",
    "Integrity and Fairness",
    "Sustainability",
  ];

  const joinOptions = [
    {
      title: "For Learners",
      description: "Access tutorials from some of the best kendama players in the world and take your skills to new heights.",
      action: () => navigate("/marketplace"),
      buttonText: "View Lessons",
    },
    {
      title: "For Teachers",
      description: "Share your expertise, connect with a global audience, and earn income doing what you love.",
      action: handleTeachersClick,
      buttonText: "Become a Teacher",
    },
  ];

  return (
    <div className="bg-base-200 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="hero bg-base-100 py-12 mb-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">About Teach Niche</h1>
              <p className="py-6 text-xl italic">
                Built to serve the kendama community.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Our Mission</h2>
              <p className="text-lg">
                The mission of <strong>Teach Niche</strong> is to create a space within the kendama community for players of all skill levels to share knowledge, support one another, and hone their skills. Teach Niche places the community first and is dedicated to fostering growth, creating connections, and promoting more financial sustainability for the kendama community.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Our Story</h2>
              <p className="text-lg mb-4">
                Hello! I'm <strong>Jaymin West</strong>, the founder of Teach Niche. I've
                been passionately playing kendama for over seven years. I've been fortunate enough to sesh with players from all over the world and have tried to form Teach Niche around these shared values.
              </p>
              <p className="text-lg">
                Teach Niche was born from a simple idea: to help kendama players
                make a living from what they love.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="card bg-primary text-primary-content">
                <div className="card-body items-center text-center">
                  <h3 className="card-title">{value}</h3>
                  <p>We believe in the power of {value.toLowerCase()} within the kendama community.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-6">Join the Movement</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {joinOptions.map((option, index) => (
              <div key={index} className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">{option.title}</h3>
                  <p>{option.description}</p>
                  <div className="card-actions justify-end">
                    <button onClick={option.action} className="btn btn-primary">
                      {option.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
