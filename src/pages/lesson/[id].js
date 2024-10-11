// src/pages/lesson/[id].js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchLesson = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated");
        navigate("/sign-in");
        return;
      }

      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from("tutorials")
        .select("*")
        .eq("id", id)
        .single();

      if (lessonError || !lessonData) {
        console.error("Error fetching lesson:", lessonError);
        setError("Lesson not found.");
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // Check if user has purchased the lesson
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("tutorial_id", id)
        .single();

      if (purchaseError && purchaseError.code !== "PGRST116") { // PGRST116: No rows found
        console.error("Error checking purchase:", purchaseError.message);
      }

      if (purchaseData) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }

      setLoading(false);
    };

    fetchLesson();
  }, [id, navigate]);

  if (loading) return <p>Loading lesson...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  if (!hasAccess) {
    return (
      <div>
        <Header />
        <div className="container mx-auto text-center mt-10">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="mt-4">
            You do not have access to this lesson. Please purchase it from the{" "}
            <a href="/marketplace" className="text-blue-500 underline">
              Marketplace
            </a>
            .
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-3xl shadow-2xl bg-base-100 p-6">
          <h1 className="card-title text-3xl mb-4">{lesson.title}</h1>
          <p className="mb-4">{lesson.description}</p>
          <div className="embed-responsive">
            <iframe
              width="100%"
              height="500px"
              src={lesson.content_url}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          {/* Additional Lesson Content */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonPage;
