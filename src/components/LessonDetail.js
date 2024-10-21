// src/components/LessonDetail.js
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill"; // Import ReactQuill for rendering rich text
import "react-quill/dist/quill.snow.css"; // Import Quill styles

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
export default function LessonDetail({ lesson, creator, hasAccess, lessonId }) {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryIds, setCategoryIds] = useState([]);

  useEffect(() => {
    /**
     * Fetches categories associated with the lesson.
     */
    const fetchCategories = async () => {
      console.log(`Fetching categories for lesson ID: ${lessonId}`);
      try {
        const { data, error } = await supabase
          .from("tutorial_categories")
          .select("category_id")
          .eq("tutorial_id", lessonId);

        if (error) {
          console.error("Error fetching categories:", error.message);
          throw error;
        }

        const ids = data.map((tc) => tc.category_id);
        setCategoryIds(ids);
        console.log("Categories fetched successfully:", ids);
      } catch (err) {
        console.error("Error in fetchCategories:", err.message);
      }
    };

    fetchCategories();
  }, [lessonId]);

  /**
   * Handles the purchase process for the lesson.
   */
  const handlePurchase = async () => {
    if (!user) {
      console.warn("User is not authenticated. Redirecting to sign-in.");
      // Redirect to sign-in if not authenticated
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    setError(null);
    console.log("Initiating purchase for lesson ID:", lessonId);

    try {
      const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        throw new Error("Functions URL not set in environment variables.");
      }

      console.log(
        `Creating checkout session at: ${functionsUrl}/create-checkout-session`,
      );
      const response = await fetch(`${functionsUrl}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          tutorialId: lessonId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.sessionUrl) {
          console.log(
            "Checkout session created successfully. Redirecting to Stripe.",
          );
          // Redirect to Stripe Checkout
          window.location.href = data.sessionUrl;
        } else {
          console.error("Checkout session URL not returned.");
          throw new Error("Checkout session URL not returned.");
        }
      } else {
        console.error("Failed to create checkout session:", data.error);
        throw new Error(data.error || "Failed to create checkout session.");
      }
    } catch (err) {
      console.error("Error during purchase:", err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      console.log("Finished purchase process.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
      <div className="flex items-center mb-4">
        {creator && creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={`${creator.full_name}'s avatar`}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
        )}
        <div>
          <p className="text-lg font-semibold">{creator ? creator.full_name : 'Unknown Creator'}</p>
          {/* Add more creator info if needed */}
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
            <ReactQuill
              value={lesson.content}
              readOnly={true}
              theme={"bubble"}
            />
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
}
