// src/pages/marketplace/components/LessonCard.js
import React, { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * LessonCard Component
 *
 * Renders a card for a lesson with options to purchase, access, or edit.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - The lesson ID.
 * @param {string} props.title - The lesson title.
 * @param {string} props.creator_id - The creator's ID.
 * @param {number} props.price - The lesson price.
 * @param {string} props.description - The lesson description.
 * @param {string} props.content_url - The lesson content URL.
 * @param {boolean} props.isPurchased - Whether the lesson has been purchased.
 * @param {boolean} props.isCreated - Whether the lesson was created by the current user.
 * @returns {JSX.Element} The Lesson Card.
 */
const LessonCard = ({
  id,
  title,
  creator_id,
  price,
  description,
  content_url,
  isPurchased,
  isCreated,
}) => {
  const [creatorName, setCreatorName] = useState("");
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCreatorName = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", creator_id)
        .single();

      if (error) {
        console.error("Error fetching creator name:", error.message);
      } else {
        setCreatorName(data.full_name || "Unknown");
      }
    };

    fetchCreatorName();
  }, [creator_id]);

  const handlePurchase = async () => {
    if (!user) {
      navigate("/sign-in");
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

  const handleAccess = () => navigate(`/lesson/${id}`);

  const handleEdit = () => navigate(`/edit-lesson/${id}`);

  const handleImageError = () => setImageError(true);

  const placeholderImage =
    "https://via.placeholder.com/400x300?text=Lesson+Image";

  return (
    <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden">
      <figure className="h-48 overflow-hidden">
        <img
          src={imageError
            ? placeholderImage
            : (content_url || placeholderImage)}
          alt={`Lesson: ${title}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>Creator: {creatorName}</p>
        <p>Price: ${price}</p>
        <p>{description}</p>
        {error && <p className="text-red-500">{error}</p>}
        {isCreated
          ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Lesson
            </button>
          )
          : isPurchased
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
