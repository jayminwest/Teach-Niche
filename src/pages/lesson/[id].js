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
export default function LessonPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessonAndAccess = async () => {
      console.log(`Fetching lesson with ID: ${id}`);
      try {
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from("tutorials")
          .select("*")
          .eq("id", id)
          .single();

        if (lessonError) {
          console.error("Error fetching lesson:", lessonError.message);
          throw lessonError;
        }

        setLesson(lessonData);
        console.log("Lesson data fetched successfully:", lessonData);

        // Fetch creator's profile
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", lessonData.creator_id)
          .maybeSingle();

        if (creatorError) {
          console.error("Error fetching creator profile:", creatorError.message);
          // Handle the error appropriately, maybe set a default value or show an error message
          setCreator(null);
        } else if (creatorData) {
          setCreator(creatorData);
          console.log("Creator profile fetched successfully:", creatorData);
        } else {
          console.log("Creator profile not found");
          setCreator(null);
        }

        // If user is logged in, check if they have purchased the lesson
        if (user) {
          console.log(`Checking purchase for user ID: ${user.id}`);
          const { data: purchaseData, error: purchaseError } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("tutorial_id", id)
            .single();

          if (purchaseError && purchaseError.code !== "PGRST116") {
            // PGRST116: No rows found
            console.error(
              "Error fetching purchase data:",
              purchaseError.message,
            );
            throw purchaseError;
          }

          if (purchaseData) {
            setHasAccess(true);
            console.log("User has access to the lesson.");
          } else {
            setHasAccess(false);
            console.log("User does not have access to the lesson.");
          }
        }
      } catch (err) {
        console.error("Error in fetchLessonAndAccess:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log("Finished fetching lesson and access data.");
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
          ? (
            "You do not have access to this lesson. Please purchase it first."
          )
          : (
            `An error occurred: ${error}`
          )}
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
      <div className="container mx-auto p-4">
        <LessonDetail
          lesson={lesson}
          creator={creator}
          hasAccess={hasAccess}
          lessonId={id}
        />
      </div>
      <Footer />
    </div>
  );
}
