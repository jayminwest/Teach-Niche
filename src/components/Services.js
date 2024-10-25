import React from "react";

/**
 * Services Component
 *
 * Displays information about Teach Niche services and features in a grid layout.
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
      ariaLabel: "Learn about expert tutorials",
    },
    {
      icon: "bi-coin",
      title: "Monetize Your Skills",
      description:
        "Create and sell your own kendama lessons - Earn income by sharing your expertise - You set your own prices.",
      ariaLabel: "Learn about monetizing your skills",
    },
    {
      icon: "bi-people",
      title: "Community Support",
      description:
        "Join a thriving community of kendama enthusiasts - Collaborate and grow together.",
      ariaLabel: "Learn about community support",
    },
    {
      icon: "bi-shield-lock",
      title: "Integrity and Fairness",
      description:
        "Community-first platform - Fair policies ensuring creators are rewarded - Trustworthy platform operations.",
      ariaLabel: "Learn about our integrity and fairness",
    },
    {
      icon: "bi-tree",
      title: "Sustainability",
      description:
        "Designed to grow with the community - Building a long-term ecosystem for kendama - Supporting continuous growth and innovation.",
      ariaLabel: "Learn about platform sustainability",
    },
    {
      icon: "bi-graph-up",
      title: "Growth and Learning",
      description:
        "Resources for personal skills development - Tools to support your favorite players - Endless learning opportunities.",
      ariaLabel: "Learn about growth and learning opportunities",
    },
  ];

  return (
    <section 
      className="py-10 md:py-16 bg-base-100" 
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2
            id="services-heading"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            What is Teach Niche?
          </h2>
          <p className="text-lg sm:text-2xl mb-6 md:mb-14 max-w-3xl mx-auto">
            Teach Niche is a <strong>community-first</strong>{" "}
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
              aria-labelledby={`service-title-${index}`}
            >
              <div className="card-body items-center text-center gap-4">
                <i 
                  className={`bi ${item.icon} text-4xl text-primary`} 
                  aria-hidden="true"
                >
                </i>
                <h3 
                  id={`service-title-${index}`} 
                  className="card-title"
                >
                  {item.title}
                </h3>
                <p className="text-base-content/80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
