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
export default function AboutUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Handles form submission.
   *
   * @param {Event} event - The form submission event.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = { name, email, message };
    console.log(JSON.stringify(formData));
    setName("");
    setEmail("");
    setMessage("");
    setFormSubmitted(true);
  };

  /**
   * Navigates to the appropriate page based on user authentication.
   */
  const handleTeachersClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/sign-up");
    }
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <Header />
      <div className="hero bg-base-100 py-12">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">About Teach Niche</h1>
            <p className="py-6 text-xl italic">
              Built by Kendama Players, for Kendama Players
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Our Mission</h2>
              <p className="text-lg">
                At <strong>Teach Niche</strong>, our mission is to empower the
                kendama community by providing a platform where players of all
                levels can share knowledge, hone their skills, and support one
                another. We are dedicated to fostering growth, connection, and
                financial sustainability within the kendama world.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Our Story</h2>
              <p className="text-lg mb-4">
                Hello! I'm <strong>Jaymin West</strong>, the founder of Teach
                Niche. I've been passionately playing kendama for over seven
                years. Throughout my journey, I've witnessed the incredible
                talent and dedication within our community.
              </p>
              <p className="text-lg">
                Teach Niche was born from a simple idea: to help kendama players
                make a living from what they love.
              </p>
            </div>
          </div>
        </div>

        <div className="divider my-12">Why Teach Niche?</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Empowerment", "Education", "Community Growth", "Connection"].map((
            item,
            index,
          ) => (
            <div key={index} className="card bg-primary text-primary-content">
              <div className="card-body items-center text-center">
                <h2 className="card-title">{item}</h2>
                <p>
                  We believe in the power of {item.toLowerCase()}{" "}
                  within the kendama community.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="divider my-12">Our Values</div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Community Collaboration</td>
                <td>
                  We thrive on the collective input and participation of kendama
                  enthusiasts worldwide.
                </td>
              </tr>
              <tr>
                <td>Growth and Learning</td>
                <td>
                  Committed to personal and communal development, we provide
                  resources for players at every skill level.
                </td>
              </tr>
              <tr>
                <td>Integrity and Fairness</td>
                <td>
                  Our commission structures and policies are designed to be
                  transparent and fair, ensuring that creators are justly
                  rewarded.
                </td>
              </tr>
              <tr>
                <td>Sustainability</td>
                <td>
                  We aim to create a sustainable ecosystem where kendama can be
                  a viable career path for dedicated players.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="divider my-12">Join the Movement</div>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">For Learners</h2>
              <p>
                Access tutorials from some of the best kendama players in the
                world and take your skills to new heights.
              </p>
              <div className="card-actions justify-end">
                <button
                  onClick={() => navigate("/marketplace")}
                  className="btn btn-primary"
                >
                  View Lessons
                </button>
              </div>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">For Teachers</h2>
              <p>
                Share your expertise, connect with a global audience, and earn
                income doing what you love.
              </p>
              <div className="card-actions justify-end">
                <button
                  onClick={handleTeachersClick}
                  className="btn btn-secondary"
                >
                  Become a Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
