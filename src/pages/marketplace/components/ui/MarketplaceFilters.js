import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';

const MarketplaceFilters = () => {
  const { sortOption, setSortOption, priceFilter, setPriceFilter } = useMarketplace();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Price</label>
        <select
          className="select select-bordered w-full"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Sort By</label>
        <select
          className="select select-bordered w-full"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="creator_asc">Creator: A to Z</option>
          <option value="creator_desc">Creator: Z to A</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
};

export default MarketplaceFilters; 