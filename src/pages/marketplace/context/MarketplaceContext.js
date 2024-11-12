import React, { createContext, useContext, useState } from "react";

const MarketplaceContext = createContext();

export const MarketplaceProvider = ({ children }) => {
  const [sortOption, setSortOption] = useState("default");
  const [priceFilter, setPriceFilter] = useState("all");

  const value = {
    sortOption,
    setSortOption,
    priceFilter,
    setPriceFilter,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};
