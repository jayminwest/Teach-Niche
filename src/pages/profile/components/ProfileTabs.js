import React from "react";

/**
 * ProfileTabs Component
 *
 * Renders the navigation tabs for different sections of the profile page.
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to change active tab
 * @param {boolean} props.isMobile - Whether the device is mobile
 * @param {boolean} props.isStripeConnected - Whether user has connected Stripe
 * @returns {JSX.Element} The Profile Tabs component
 */
const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  isMobile, 
  isStripeConnected 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const tabOptions = [
    { value: "profile", label: "Profile" },
    { value: "created", label: "Created Lessons" },
    { value: "purchased", label: "Purchased Lessons" },
    ...(!isStripeConnected
      ? [{ value: "become-teacher", label: "Become A Teacher" }]
      : []),
    ...(isStripeConnected
      ? [{ value: "create-lesson", label: "Create Lesson" }]
      : []),
  ];

  if (isMobile) {
    return (
      <div className="md:hidden mb-6">
        <div className="relative">
          <button
            className="btn btn-primary w-full text-left flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {tabOptions.find((option) => option.value === activeTab)?.label}
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-base-100 rounded-md shadow-lg">
              {tabOptions.map((option) => (
                <button
                  key={option.value}
                  className={`block w-full text-left px-4 py-2 hover:bg-base-200 ${
                    activeTab === option.value ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(option.value);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block tabs tabs-boxed mb-6 bg-gray-100 p-1 rounded-full">
      {tabOptions.map((option) => (
        <button
          key={option.value}
          className={`tab tab-lg flex-1 rounded-full ${
            activeTab === option.value ? "bg-primary text-white" : ""
          }`}
          onClick={() => setActiveTab(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs; 