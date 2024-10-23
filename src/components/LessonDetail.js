// src/components/LessonDetail.js
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/**
 * LessonDetail Component
 *
 * Displays detailed information about a specific lesson, including purchase options.
 *
 * @param {Object} props
 * @param {Object} props.lesson - The lesson data.
 * @param {Object} props.creator - The creator's data.
 * @param {boolean} props.hasAccess - Whether the user has access to the lesson content.
 * @param {string} props.lessonId - The ID of the lesson.
 * @returns {JSX.Element} The lesson detail component.
 */
const LessonDetail = ({ lesson, creator, hasAccess, lessonId }) => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryIds, setCategoryIds] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("tutorial_categories")
          .select("category_id")
          .eq("tutorial_id", lessonId);

        if (error) throw error;

        setCategoryIds(data.map((tc) => tc.category_id));
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };

    fetchCategories();
  }, [lessonId]);

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        throw new Error("Functions URL not set in environment variables.");
      }

      const response = await fetch(`${functionsUrl}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ tutorialId: lessonId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("Checkout session URL not returned.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      <div className="flex items-center mb-4">
        {creator && creator.avatar_url
          ? (
            <img
              src={creator.avatar_url}
              alt={`${creator.full_name}'s avatar`}
              className="w-12 h-12 rounded-full mr-4"
            />
          )
          : <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>}
        <div>
          <p className="text-lg font-semibold">
            {creator ? creator.full_name : "Unknown Creator"}
          </p>
        </div>
      </div>
      <p className="mb-4">{lesson.description}</p>
      <p className="mb-4 font-semibold">Price: ${lesson.price}</p>

      {hasAccess
        ? (
          <div className="lesson-content">
            {lesson.video_url && (
              <iframe
                src={lesson.video_url}
                title={lesson.title}
                className="w-full h-96 mb-4"
                allowFullScreen
              >
              </iframe>
            )}
            <ReactQuill value={lesson.content} readOnly={true} theme="bubble" />
          </div>
        )
        : (
          <div>
            {error && <p className="text-red-500 mb-2">Error: {error}</p>}
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Purchase Lesson"}
            </button>
          </div>
        )}
    </div>
  );
};

export default LessonDetail;
