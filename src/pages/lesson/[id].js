// src/pages/lesson/[id].js
import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import LessonDetail from "../../components/LessonDetail";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * LessonPage Component
 *
 * Renders the lesson detail page for a specific lesson.
 *
 * @returns {JSX.Element} The Lesson Detail page.
 */
const LessonPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessonAndAccess = async () => {
      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from("tutorials")
          .select("*")
          .eq("id", id)
          .single();

        if (lessonError) throw lessonError;

        setLesson(lessonData);

        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", lessonData.creator_id)
          .maybeSingle();

        if (creatorError) throw creatorError;

        setCreator(creatorData);

        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("tutorial_id", id)
            .single();

          if (purchaseError && purchaseError.code !== "PGRST116") {
            throw purchaseError;
          }

          setHasAccess(!!purchaseData);
        }
      } catch (err) {
        console.error("Error in fetchLessonAndAccess:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndAccess();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        {error === "PGRST116: No rows found"
          ? "You do not have access to this lesson. Please purchase it first."
          : `An error occurred: ${error}`}
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center mt-10">Lesson not found.</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <LessonDetail
          lesson={lesson}
          creator={creator}
          hasAccess={hasAccess}
          lessonId={id}
        />
      </main>
      <Footer />
    </div>
  );
};

export default LessonPage;
