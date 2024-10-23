import React from "react";
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
    {
      title: "Community Collaboration",
      description:
        "We foster a space where kendama players of all levels can connect, share, and grow together.",
    },
    {
      title: "Growth and Learning",
      description:
        "We're committed to continuous improvement, both in our skills and as a platform.",
    },
    {
      title: "Integrity and Fairness",
      description:
        "We operate with transparency and ensure equitable opportunities for all community members.",
    },
    {
      title: "Sustainability",
      description:
        "We're building a platform that supports long-term growth for kendama enthusiasts and professionals alike.",
    },
  ];

  const joinOptions = [
    {
      title: "For Learners",
      description:
        "Access tutorials from some of the best kendama players in the world and take your skills to new heights.",
      action: () => navigate("/marketplace"),
      buttonText: "View Lessons",
    },
    {
      title: "For Teachers",
      description:
        "Share your expertise, connect with a global audience, and earn income doing what you love.",
      action: handleTeachersClick,
      buttonText: "Become a Teacher",
    },
  ];

  return (
    <div className="bg-base-200 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section
          className="hero h-96 rounded-box overflow-hidden mb-12"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          role="img"
          aria-label="Group of people setting up campfire"
        >
          <div className="hero-overlay bg-opacity-60"></div>
          <div className="hero-content text-center text-white">
            <div className="max-w-md">
              <h1 className="mb-5 text-5xl font-bold">About Teach Niche</h1>
              <p className="mb-5 text-xl italic">
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
                The mission of <strong>Teach Niche</strong>{" "}
                is to create a space within the kendama community for players of
                all skill levels to share knowledge, support one another, and
                hone their skills. Teach Niche places the community first and is
                dedicated to fostering growth, creating connections, and
                promoting more financial sustainability for the kendama
                community.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Our Story</h2>
              <p className="text-lg mb-4">
                Hello! I'm{" "}
                <strong>Jaymin West</strong>, the founder of Teach Niche. I've
                been passionately playing kendama for over seven years. I've
                been fortunate enough to sesh with players from all over the
                world and have tried to form Teach Niche around these shared
                values.
              </p>
              <p className="text-lg">
                Teach Niche was born from a simple idea: to help kendama players
                make a living from what they love.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">
            Learn More About Us
          </h2>
          <div className="space-y-4">
            <details className="bg-base-100 shadow-xl rounded-lg">
              <summary className="cursor-pointer p-4 font-bold text-xl">
                Our Values
              </summary>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="card bg-primary text-primary-content"
                  >
                    <div className="card-body">
                      <h3 className="card-title text-xl mb-2 font-bold">
                        {value.title}
                      </h3>
                      <p>{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <details className="bg-base-100 shadow-xl rounded-lg">
              <summary className="cursor-pointer p-4 font-bold text-xl">
                Why Teach Niche?
              </summary>
              <div className="p-4 space-y-4">
                {[
                  {
                    title: "Empowerment",
                    content:
                      "We believe that top players should have the opportunity to benefit financially from their skills and knowledge.",
                    icon: "💪",
                  },
                  {
                    title: "Education",
                    content:
                      "Our platform offers a diverse range of tutorials, from mastering specific tricks to improving competition performance and developing consistency.",
                    icon: "🎓",
                  },
                  {
                    title: "Community Growth",
                    content:
                      'By supporting each other, we aim to elevate the entire kendama community, breaking the notion that kendama is "just a hobby."',
                    icon: "🌱",
                  },
                  {
                    title: "Community-Driven Development",
                    content:
                      "We are built to grow and evolve according to the community's needs and feedback.",
                    icon: "🤝",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="card-body">
                      <h3 className="card-title text-xl flex items-center">
                        <span className="text-2xl mr-2">{item.icon}</span>
                        {item.title}
                      </h3>
                      <p className="text-base">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <details className="bg-base-100 shadow-xl rounded-lg">
              <summary className="cursor-pointer p-4 font-bold text-xl">
                Our Commission Structure
              </summary>
              <div className="p-4">
                <p className="mb-4">
                  We are committed to transparency and fairness in how we
                  operate. To sustain the platform and continue providing value
                  to the community, Teach Niche charges a 15% commission on each
                  transaction.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Fairness to Creators:</strong>{" "}
                    Creators retain 85% of their earnings from each sale.
                  </li>
                  <li>
                    <strong>Platform Sustainability:</strong>{" "}
                    The commission helps cover operational costs like hosting,
                    development, and customer support, ensuring the platform
                    remains available and continuously improving.
                  </li>
                  <li>
                    <strong>Community Investment:</strong>{" "}
                    By supporting the platform, you're contributing to a
                    sustainable ecosystem that benefits all members of the
                    kendama community.
                  </li>
                </ul>
                <p className="mt-4">
                  We believe this structure strikes a balance between supporting
                  creators and maintaining the platform, reinforcing our
                  commitment to the community's well-being.
                </p>
              </div>
            </details>

            <details className="bg-base-100 shadow-xl rounded-lg">
              <summary className="cursor-pointer p-4 font-bold text-xl">
                Our Open Source Philosophy
              </summary>
              <div className="p-4">
                <p className="mb-4">
                  Teach Niche is proudly open source, which means our codebase
                  is publicly accessible for anyone to view, contribute to, or
                  adapt.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Transparency:</strong>{" "}
                    Users can see exactly how the platform works, fostering
                    trust and accountability.
                  </li>
                  <li>
                    <strong>Collaboration:</strong>{" "}
                    We welcome contributions from developers and enthusiasts who
                    want to help improve Teach Niche.
                  </li>
                  <li>
                    <strong>Innovation:</strong>{" "}
                    Open sourcing encourages creative solutions and rapid
                    enhancements, benefiting the entire community.
                  </li>
                </ul>
                <p className="mt-4">
                  You can check out our repository on GitHub and see what's
                  under the hood!
                </p>
                <a
                  href="https://github.com/jayminwest/Teach-Niche"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-4"
                >
                  View Our GitHub Repository
                </a>
              </div>
            </details>

            <details className="bg-base-100 shadow-xl rounded-lg">
              <summary className="cursor-pointer p-4 font-bold text-xl">
                Built to Grow with the Community
              </summary>
              <div className="p-4">
                <p className="mb-4">
                  We believe that the best way to serve the kendama community is
                  by listening and adapting to its needs.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Community Feedback:</strong>{" "}
                    We actively seek input from our users to guide platform
                    enhancements. Your suggestions shape the future of Teach
                    Niche.
                  </li>
                  <li>
                    <strong>Feature Requests:</strong>{" "}
                    Have an idea for a new feature or improvement? Let us know!
                    We're eager to implement changes that benefit everyone.
                  </li>
                  <li>
                    <strong>Continuous Improvement:</strong>{" "}
                    Our development roadmap is flexible, allowing us to
                    prioritize updates that matter most to you.
                  </li>
                </ul>
                <p className="mt-4">
                  By keeping the platform intentionally adaptable, we ensure
                  that Teach Niche evolves in step with the community it serves.
                </p>
              </div>
            </details>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-6">
            Join the Movement
          </h2>
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
