// src/pages/marketplace/components/LessonCard.js
import React, { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LessonCard(
  {
    id,
    title,
    creator_id,
    price,
    description,
    content_url,
    isPurchased,
    isCreated,
  },
) {
  const [creatorName, setCreatorName] = useState("");
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCreatorName = async () => {
      console.log(`Fetching creator name for creator ID: ${creator_id}`);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", creator_id)
        .single();

      if (error) {
        console.error("Error fetching creator name:", error.message);
      } else {
        setCreatorName(data.full_name || "Unknown");
        console.log("Creator name fetched successfully:", data.full_name);
      }
    };

    fetchCreatorName();
  }, [creator_id]);

  const handlePurchase = async () => {
    if (!user) {
      console.warn("User not authenticated. Redirecting to sign-in.");
      navigate("/sign-in");
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`Initiating purchase for lesson ID: ${id}`);

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
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          tutorialId: id, // Changed to tutorialId as backend expects
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
    } catch (error) {
      console.error("Error during purchase:", error.message);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      console.log("Finished purchase process for lesson ID:", id);
    }
  };

  const handleAccess = () => {
    console.log(`Accessing lesson ID: ${id}`);
    navigate(`/lesson/${id}`);
  };

  const handleEdit = () => {
    console.log(`Editing lesson ID: ${id}`);
    navigate(`/edit-lesson/${id}`);
  };

  const handleImageError = () => {
    console.log(`Error loading image for lesson ID: ${id}`);
    setImageError(true);
  };

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
        <p>Teacher: {creatorName}</p>
        <p>Price: ${price}</p>
        <p>{description}</p>
        {error && <p className="text-red-500">{error}</p>}
        {isCreated
          ? (
            <button
              className="btn btn-primary"
              onClick={handleEdit}
            >
              Edit Lesson
            </button>
          )
          : isPurchased
          ? (
            <button
              className="btn btn-success"
              onClick={handleAccess}
            >
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
}
