// src/pages/lesson/[id].js
import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function LessonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from('tutorials')
          .select('*')
          .eq('id', id)
          .single();

        if (lessonError) {
          throw lessonError;
        }

        setLesson(lessonData);

        // If user is logged in, check if they have purchased the lesson
        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('tutorial_id', id)
            .single();

          if (purchaseError && purchaseError.code !== 'PGRST116') { // 'PGRST116' = no rows found
            throw purchaseError;
          }

          if (purchaseData) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        }
      } catch (error) {
        console.error("Error fetching lesson or purchase data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!lesson) {
    return <div className="text-center mt-10">Lesson not found.</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!hasAccess) {
    return <div className="text-center mt-10">You do not have access to this lesson. Please purchase it first.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      <p className="mb-4">By {lesson.creator_id}</p>
      <div className="lesson-content">
        {/* Render the lesson content, e.g., video, text, etc. */}
        <iframe
          src={lesson.content_url}
          title={lesson.title}
          className="w-full h-96"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
