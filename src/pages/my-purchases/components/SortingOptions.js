import React from "react";

/**
 * SortingOptions Component
 * Provides sorting controls for the purchased lessons list
 *
 * @param {Object} props
 * @param {string} props.sortOption - Current sort option
 * @param {(option: string) => void} props.onSortChange - Handler for sort option changes
 * @returns {JSX.Element}
 */
const SortingOptions = ({ sortOption, onSortChange }) => {
  const options = [
    { value: "default", label: "Default" },
    { value: "recent", label: "Most Recent" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "Title (A-Z)" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Sort By</h2>
      <div className="space-y-2">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors
              ${
              sortOption === value
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
            aria-pressed={sortOption === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortingOptions;
