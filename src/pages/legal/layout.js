import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * TabButton Component
 *
 * Renders a tab button for the legal page.
 *
 * @param {Object} props
 * @param {string} props.label - The label for the tab button.
 * @param {boolean} props.isActive - Whether the tab is currently active.
 * @param {Function} props.onClick - Function to handle click events.
 * @returns {JSX.Element} The tab button component.
 */
const TabButton = ({ label, isActive, onClick }) => (
  <button
    className={`tab tab-lifted ${isActive ? "tab-active" : ""}`}
    onClick={onClick}
    aria-label={`Show ${label}`}
    tabIndex={0}
  >
    {label}
  </button>
);

/**
 * TabContent Component
 *
 * Renders the content for a tab in the legal page.
 *
 * @param {Object} props
 * @param {string} props.title - The title of the tab content.
 * @param {string|string[]} props.content - The content to display.
 * @returns {JSX.Element} The tab content component.
 */
const TabContent = ({ title, content }) => (
  <div>
    <h3 className="text-2xl mb-2">{title}</h3>
    {Array.isArray(content)
      ? content.map((paragraph, index) => (
        <p key={index} className="text-lg mb-2">
          {paragraph}
        </p>
      ))
      : <p className="text-lg mb-2">{content}</p>}
  </div>
);

/**
 * Legal Component
 *
 * Renders the Legal page with tabs for terms of use, privacy policy, and cookie policy.
 *
 * @returns {JSX.Element} The Legal page.
 */
const Legal = () => {
  const [activeTab, setActiveTab] = useState("terms");

  const tabContent = {
    terms: {
      title: "Terms of Use",
      content: [
        "Welcome to our website. These terms of use outline the rules and regulations for the use of our website.",
        "By accessing this website, we assume you accept these terms and conditions. Do not continue to use the website if you do not agree to take all of the terms and conditions stated on this page.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.",
      ],
    },
    privacy: {
      title: "Privacy Policy",
      content: [
        "We value your privacy and are committed to protecting your personal information. This privacy policy explains how we handle your personal data.",
        "By using our website, you consent to the collection and use of your information as outlined in this policy.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.",
      ],
    },
    cookies: {
      title: "Cookie Policy",
      content: [
        "Our website uses cookies to improve your experience. This cookie policy explains what cookies are and how we use them.",
        "By using our website, you agree to the use of cookies in accordance with this policy.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula, erat vitae euismod efficitur, ex nunc varius lacus, sit amet bibendum lectus erat eget arcu.",
      ],
    },
  };

  return (
    <div>
      <Header />
      <main className="flex justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
          <h2 className="card-title text-3xl mb-4">Legal</h2>

          <div className="tabs mb-4">
            {Object.keys(tabContent).map((tab) => (
              <TabButton
                key={tab}
                label={tabContent[tab].title}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>

          <div className="tab-content">
            {tabContent[activeTab] && (
              <TabContent
                title={tabContent[activeTab].title}
                content={tabContent[activeTab].content}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
