// src/pages/marketplace/components/LessonsGrid.js
import React, { useEffect, useState } from "react";
import LessonCard from "./LessonCard";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

/**
 * LessonsGrid Component
 *
 * Renders a grid of lessons, optionally filtering to show only purchased lessons and sorting by price or creator.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.showPurchasedOnly=false] - Whether to show only purchased lessons.
 * @param {string} props.sortOption - The current sort option.
 * @param {string} props.priceFilter - The current price filter.
 * @param {number} [props.limit] - The maximum number of lessons to display.
 * @returns {JSX.Element} The Lessons Grid.
 */
const LessonsGrid = ({ showPurchasedOnly = false, sortOption, priceFilter, limit, isFeatured }) => {
  const [lessons, setLessons] = useState([]);
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchLessons = async () => {
      try {
        let query = supabase
          .from("tutorials")
          .select(`
            *,
            profiles:creator_id (full_name),
            reviews!tutorial_id(rating)
          `);

        if (isFeatured) {
          query = query.eq('is_featured', true);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data: allLessons, error: lessonsError } = await query;

        if (lessonsError) throw lessonsError;

        const { data: purchaseCounts, error: purchaseError } = await supabase
          .from('purchases')
          .select('tutorial_id');

        if (purchaseError) throw purchaseError;

        const purchaseCountMap = {};
        purchaseCounts?.forEach(purchase => {
          purchaseCountMap[purchase.tutorial_id] = (purchaseCountMap[purchase.tutorial_id] || 0) + 1;
        });

        const processedLessons = allLessons.map(lesson => {
          const reviews = lesson.reviews || [];
          let averageRating = 0;
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, curr) => {
              return acc + (curr.rating || 0);
            }, 0);
            averageRating = totalRating / reviews.length;
          }

          const isWelcome = lesson.id === process.env.REACT_APP_WELCOME_LESSON_ID;

          return {
            ...lesson,
            averageRating,
            purchaseCount: purchaseCountMap[lesson.id] || 0,
            isWelcomeLesson: isWelcome,
          };
        });

        if (isMounted) {
          setLessons(processedLessons);
        }

        if (user) {
          const { data: purchases, error: userPurchasesError } = await supabase
            .from("purchases")
            .select("tutorial_id")
            .eq("user_id", user.id);

          if (userPurchasesError) throw userPurchasesError;

          setPurchasedLessons(
            purchases.map((purchase) => purchase.tutorial_id)
          );
        }
      } catch (error) {
        setLessons([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLessons();

    return () => {
      isMounted = false;
    };
  }, [user, limit, isFeatured]);

  const sortLessons = (lessonsToSort) => {
    switch (sortOption) {
      case "price_asc":
        return [...lessonsToSort].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...lessonsToSort].sort((a, b) => b.price - a.price);
      case "creator_asc":
        return [...lessonsToSort].sort((a, b) =>
          a.profiles.full_name.localeCompare(b.profiles.full_name)
        );
      case "creator_desc":
        return [...lessonsToSort].sort((a, b) =>
          b.profiles.full_name.localeCompare(a.profiles.full_name)
        );
      case "popular":
        return [...lessonsToSort].sort((a, b) => {
          const aCount = a.purchaseCount || 0;
          const bCount = b.purchaseCount || 0;
          return bCount - aCount;
        });
      case "rating":
        return [...lessonsToSort].sort((a, b) => {
          const aRating = a.averageRating || 0;
          const bRating = b.averageRating || 0;
          return bRating - aRating;
        });
      default:
        return lessonsToSort;
    }
  };

  const filterLessons = (lessonsToFilter) => {
    let filtered = lessonsToFilter;

    // Apply price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(lesson => lesson.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(lesson => lesson.price > 0);
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div 
          data-testid="loading-spinner"
          role="status"
          aria-busy="true"
          className="loading loading-spinner loading-lg"
          aria-label="Loading lessons"
        >
          <span className="sr-only">Loading lessons...</span>
        </div>
      </div>
    );
  }

  const displayLessons = showPurchasedOnly
    ? lessons.filter((lesson) => purchasedLessons.includes(lesson.id))
    : filterLessons(lessons);

  const sortedLessons = sortLessons(displayLessons);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {showPurchasedOnly && sortedLessons.length === 0 ? (
        <p className="text-center text-gray-600">You haven't purchased any lessons yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
          {sortedLessons.map((lesson) => (
            <div key={lesson.id} className="w-full max-w-sm">
              <LessonCard
                {...lesson}
                creatorName={lesson.profiles.full_name}
                isPurchased={purchasedLessons.includes(lesson.id)}
                isWelcomeLesson={lesson.isWelcomeLesson}
                averageRating={lesson.averageRating}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonsGrid;
