import { useMemo } from 'react';

export const useMarketplaceFilters = (lessons, sortOption, priceFilter) => {
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = [...lessons];

    // Apply price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(lesson => lesson.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(lesson => lesson.price > 0);
    }

    // Apply sorting
    switch (sortOption) {
      case "price_asc":
        return filtered.sort((a, b) => a.price - b.price);
      case "price_desc":
        return filtered.sort((a, b) => b.price - a.price);
      case "creator_asc":
        return filtered.sort((a, b) => 
          a.profiles.full_name.localeCompare(b.profiles.full_name)
        );
      case "creator_desc":
        return filtered.sort((a, b) => 
          b.profiles.full_name.localeCompare(a.profiles.full_name)
        );
      case "popular":
        return filtered.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
      case "rating":
        return filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      default:
        return filtered;
    }
  }, [lessons, sortOption, priceFilter]);

  return filteredAndSortedLessons;
}; 