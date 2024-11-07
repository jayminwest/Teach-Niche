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
 * @param {number} [props.limit] - The maximum number of lessons to display.
 * @returns {JSX.Element} The Lessons Grid.
 */
const LessonsGrid = ({ showPurchasedOnly = false, sortOption, limit }) => {
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
            profiles:creator_id (full_name)
          `);

        if (limit) {
          query = query.limit(limit);
        }

        const { data: allLessons, error: lessonsError } = await query;

        if (lessonsError) throw lessonsError;

        // Identify the welcome lesson
        const welcomeLessonId = process.env.REACT_APP_WELCOME_LESSON_ID;
        console.log("Welcome Lesson ID:", welcomeLessonId); // Log the welcome lesson ID

        const lessonsWithWelcomeFlag = allLessons.map((lesson) => {
          const isWelcome = lesson.id === welcomeLessonId;
          console.log(`Lesson ID: ${lesson.id}, Is Welcome: ${isWelcome}`); // Log each lesson's welcome status
          return {
            ...lesson,
            isWelcomeLesson: isWelcome,
          };
        });

        setLessons(lessonsWithWelcomeFlag);

        if (user) {
          const { data: purchases, error: purchasesError } = await supabase
            .from("purchases")
            .select("tutorial_id")
            .eq("user_id", user.id);

          if (purchasesError) throw purchasesError;

          setPurchasedLessons(
            purchases.map((purchase) => purchase.tutorial_id),
          );
        }
      } catch (error) {
        console.error("Error fetching lessons or purchases:", error.message);
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
  }, [user, limit]);

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
      default:
        return lessonsToSort;
    }
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
    : lessons;

  const sortedLessons = sortLessons(displayLessons);

  return (
    <div className="container p-4 mx-auto">
      {showPurchasedOnly && sortedLessons.length === 0
        ? <p>You haven't purchased any lessons yet.</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {sortedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                {...lesson}
                creatorName={lesson.profiles.full_name}
                isPurchased={purchasedLessons.includes(lesson.id)}
                isWelcomeLesson={lesson.isWelcomeLesson}
              />
            ))}
          </div>
        )}
    </div>
  );
};

export default LessonsGrid;
