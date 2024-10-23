import React from "react";

/**
 * Services Component
 *
 * Displays information about Teach Niche services and features.
 *
 * @returns {JSX.Element} The services section.
 */
const Services = () => {
  const serviceItems = [
    {
      icon: "bi-pencil-square",
      title: "Expert Tutorials",
      description:
        "Access comprehensive tutorials from top kendama players - Enhance your skills with structured lessons - Learn at your own pace.",
    },
    {
      icon: "bi-coin",
      title: "Monetize Your Skills",
      description:
        "Create and sell your own kendama lessons - Earn income by sharing your expertise - You set your own prices.",
    },
    {
      icon: "bi-people",
      title: "Community Support",
      description:
        "Join a thriving community of kendama enthusiasts - Collaborate and grow together.",
    },
    {
      icon: "bi-shield-lock",
      title: "Integrity and Fairness",
      description:
        "Community-first platform - Fair policies ensuring creators are rewarded - Trustworthy platform operations.",
    },
    {
      icon: "bi-tree",
      title: "Sustainability",
      description:
        "Designed to grow with the community - Building a long-term ecosystem for kendama - Supporting continuous growth and innovation.",
    },
    {
      icon: "bi-graph-up",
      title: "Growth and Learning",
      description:
        "Resources for personal skills development - Tools to support your favorite players - Endless learning opportunities.",
    },
  ];

  return (
    <section className="py-10 md:py-16" aria-labelledby="services-heading">
      <div className="container">
        <div className="text-center">
          <h2
            id="services-heading"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            What is Teach Niche?
          </h2>
          <p className="text-lg sm:text-2xl mb-6 md:mb-14">
            Teach Niche is a <b>community-first</b>{" "}
            platform designed to grow with the kendama community. Our goal is to
            enable players to learn from experts, share their skills, and
            monetize their expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
          {serviceItems.map((item, index) => (
            <div
              key={index}
              className="card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="card-body items-center text-center gap-4">
                <i className={`bi ${item.icon} text-4xl`} aria-hidden="true">
                </i>
                <h3 className="card-title">{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
