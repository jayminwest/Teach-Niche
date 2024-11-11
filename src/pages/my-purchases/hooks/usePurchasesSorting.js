import { useState } from "react";

/**
 * Custom hook to manage sorting state for purchased lessons
 * 
 * @returns {{
 *   sortOption: string,
 *   handleSortChange: (newOption: string) => void
 * }} Sorting state and handler
 */
const usePurchasesSorting = () => {
  const [sortOption, setSortOption] = useState("default");

  const handleSortChange = (newOption) => {
    setSortOption(newOption);
  };

  return {
    sortOption,
    handleSortChange,
  };
};

export default usePurchasesSorting; 