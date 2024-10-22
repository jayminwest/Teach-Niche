// src/pages/marketplace/components/LessonsGrid.js
import React, { useEffect, useState } from "react";
import LessonCard from "./LessonCard";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

/**
 * LessonsGrid Component
 *
 * Renders a grid of lessons, optionally filtering to show only purchased lessons.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.showPurchasedOnly=false] - Whether to show only purchased lessons.
 * @returns {JSX.Element} The Lessons Grid.
 */
const LessonsGrid = ({ showPurchasedOnly = false }) => {
  const [lessons, setLessons] = useState([]);
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data: allLessons, error: lessonsError } = await supabase
          .from("tutorials")
          .select("*");

        if (lessonsError) throw lessonsError;

        setLessons(allLessons);

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
        setLoading(false);
      }
    };

    fetchLessons();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const displayLessons = showPurchasedOnly
    ? lessons.filter((lesson) => purchasedLessons.includes(lesson.id))
    : lessons;

  return (
    <div className="container p-4 mx-auto">
      {showPurchasedOnly && displayLessons.length === 0
        ? <p>You haven't purchased any lessons yet.</p>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                {...lesson}
                isPurchased={purchasedLessons.includes(lesson.id)}
              />
            ))}
          </div>
        )}
    </div>
  );
};

export default LessonsGrid;
