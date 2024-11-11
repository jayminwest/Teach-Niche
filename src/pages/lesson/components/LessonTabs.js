import React from 'react';
import { TABS, TAB_LABELS } from '../constants';

const LessonTabs = ({ activeTab, onTabChange, hasAccess }) => {
  const handleKeyDown = (e, tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  return (
    <nav className="bg-base-200 rounded-lg p-4" aria-label="Lesson navigation">
      <ul className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
        {Object.values(TABS).map((tab) => (
          (tab !== TABS.DISCUSSION || hasAccess) && (
            <li key={tab} className="flex-shrink-0">
              <button
                onClick={() => onTabChange(tab)}
                onKeyDown={(e) => handleKeyDown(e, tab)}
                className={`w-full text-left py-2 px-4 rounded text-sm md:text-base
                  ${activeTab === tab ? "bg-primary text-white" : "hover:bg-base-300"}`}
                aria-selected={activeTab === tab}
                role="tab"
                tabIndex={0}
                aria-controls={`${tab}-panel`}
              >
                {TAB_LABELS[tab]}
              </button>
            </li>
          )
        ))}
      </ul>
    </nav>
  );
};

export default LessonTabs; 