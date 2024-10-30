// src/pages/marketplace/components/LessonCard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import supabase from "../../../utils/supabaseClient";

/**
 * LessonCard Component
 *
 * Renders a card for a lesson with options to purchase, access, or edit.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - The lesson ID.
 * @param {string} props.title - The lesson title.
 * @param {string} props.creator_id - The creator's ID.
 * @param {string} props.creatorName - The creator's name.
 * @param {number} props.price - The lesson price.
 * @param {string} props.description - The lesson description.
 * @param {string} props.thumbnail_url - The lesson thumbnail URL.
 * @param {boolean} props.isPurchased - Whether the lesson has been purchased.
 * @param {boolean} props.isWelcomeLesson - Whether the lesson is a welcome lesson.
 * @returns {JSX.Element} The Lesson Card.
 */
const LessonCard = ({
  id,
  title,
  creator_id,
  creatorName,
  price,
  description,
  thumbnail_url,
  isPurchased,
  isWelcomeLesson,
}) => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const isCreator = user && user.id === creator_id;

  const handleAccess = () => navigate(`/lesson/${id}`);

  const handleEdit = () => navigate(`/edit-lesson/${id}`);

  const handleImageError = () => setImageError(true);

  const placeholderImage =
    "https://via.placeholder.com/400x300?text=Lesson+Image";

  const handlePurchase = async () => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    if (price === 0 || isWelcomeLesson) {
      // Handle free lesson access directly
      try {
        const { error } = await supabase
          .from("purchases")
          .insert([
            {
              user_id: user.id,
              tutorial_id: id,
              purchase_date: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
        
        // Redirect to lesson page after granting access
        navigate(`/lesson/${id}`);
      } catch (err) {
        console.error("Error granting access to free lesson:", err);
        setError("Failed to access free lesson. Please try again.");
      }
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
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ tutorialId: id }),
      });

      const data = await response.json();

      if (response.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session.");
      }
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden">
      <figure className="h-48 overflow-hidden">
        <img
          src={imageError
            ? placeholderImage
            : (thumbnail_url || placeholderImage)}
          alt={`Lesson: ${title}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>Creator: {creatorName}</p>
        <p className="text-lg font-semibold">
          {price === 0 ? "Free" : `$${price.toFixed(2)}`}
        </p>
        <p>{description}</p>
        {error && <p className="text-red-500">{error}</p>}
        {isCreator
          ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Lesson
            </button>
          )
          : isPurchased || isWelcomeLesson
          ? (
            <button className="btn btn-success" onClick={handleAccess}>
              Access Lesson
            </button>
          )
          : (
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Purchase Lesson"}
            </button>
          )}
      </div>
    </div>
  );
};

export default LessonCard;
