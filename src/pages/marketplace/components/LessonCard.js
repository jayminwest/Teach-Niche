// src/pages/marketplace/components/LessonCard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import supabase from "../../../utils/supabaseClient";
import { StarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

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
  averageRating = 0,
}) => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const isCreator = user && user.id === creator_id;

  // Fetch purchase count when component mounts
  useEffect(() => {
    const fetchPurchaseCount = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('id', { count: 'exact' })
          .eq('tutorial_id', id);

        if (error) return;

        setPurchaseCount(data?.length || 0);
      } catch (err) {
        setPurchaseCount(0);
      }
    };

    fetchPurchaseCount();
  }, [id]);

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

  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;
    
    return (
      <div className="flex items-center gap-1">
        <StarIcon className="w-5 h-5 text-yellow-400" />
        <span className="text-sm font-medium">
          {numericRating === 0 ? '-' : numericRating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderPurchaseCount = () => {
    return (
      <div className="flex items-center gap-1">
        <UserGroupIcon className="w-4 h-4" />
        <span className="text-sm">
          {purchaseCount > 0 ? purchaseCount : '-'}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={imageError ? placeholderImage : (thumbnail_url || placeholderImage)}
          alt={`Lesson: ${title}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium">
            {price === 0 ? "Free" : `$${price.toFixed(2)}`}
          </p>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <h2 className="font-bold text-lg line-clamp-1">{title}</h2>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p className="font-medium truncate">By {creatorName}</p>
          <div className="flex items-center gap-3 flex-shrink-0">
            {renderStars(averageRating)}
            {renderPurchaseCount()}
          </div>
        </div>

        <p className="text-gray-600 text-sm min-h-[3rem]">
          {truncateDescription(description)}
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="pt-2">
          {isCreator ? (
            <button 
              className="w-full btn btn-outline btn-primary"
              onClick={handleEdit}
            >
              Edit Lesson
            </button>
          ) : isPurchased || isWelcomeLesson ? (
            <button 
              className="w-full btn btn-success"
              onClick={handleAccess}
            >
              Access Lesson
            </button>
          ) : (
            <button
              className={`w-full btn btn-primary ${loading ? "loading" : ""}`}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Purchase Lesson"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
