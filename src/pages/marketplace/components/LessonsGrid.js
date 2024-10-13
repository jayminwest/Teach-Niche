// src/pages/marketplace/components/LessonsGrid.js
import React, { useState, useEffect } from "react";
import LessonCard from "./LessonCard";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export default function LessonsGrid({showPurchasedOnly = false}) {
  const [lessons, setLessons] = useState([]);
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Fetch all lessons
        const { data: allLessons, error: lessonsError } = await supabase
          .from('tutorials')
          .select('*');

        if (lessonsError) {
          throw lessonsError;
        }

        setLessons(allLessons);

        // If user is authenticated, fetch purchased lessons
        if (user) {
          const { data: purchases, error: purchasesError } = await supabase
            .from('purchases')
            .select('tutorial_id')
            .eq('user_id', user.id);

          if (purchasesError) {
            throw purchasesError;
          }

          const purchasedIds = purchases.map(purchase => purchase.tutorial_id);
          setPurchasedLessons(purchasedIds);
        } else {
          setPurchasedLessons([]);
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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container p-4 mx-auto">
      {showPurchasedOnly ? (
        <div>
          {purchasedLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lessons
                .filter(lesson => purchasedLessons.includes(lesson.id))
                .map((lesson) => (
                  <LessonCard key={lesson.id} {...lesson} isPurchased />
                ))}
            </div>
          ) : (
            <p>You haven't purchased any lessons yet.</p>
          )}
        </div>
      ) : (
        <>
          {user && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Purchased Lessons</h2>
              {purchasedLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {lessons
                    .filter(lesson => purchasedLessons.includes(lesson.id))
                    .map((lesson) => (
                      <LessonCard key={lesson.id} {...lesson} isPurchased />
                    ))}
                </div>
              ) : (
                <p>You haven't purchased any lessons yet.</p>
              )}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4">Available Lessons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lessons
                .filter(lesson => !user || !purchasedLessons.includes(lesson.id))
                .map((lesson) => (
                  <LessonCard key={lesson.id} {...lesson} isPurchased={purchasedLessons.includes(lesson.id)} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
