// src/pages/marketplace/components/LessonCard.js
import React, { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LessonCard({ id, title, creator_id, price, description, content_url, isPurchased }) {
  const [creatorName, setCreatorName] = useState("");
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          lessonId: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.sessionUrl) {
          // Redirect to Stripe Checkout
          window.location.href = data.sessionUrl;
        } else {
          throw new Error("Checkout session URL not returned.");
        }
      } else {
        throw new Error(data.error || "Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error during purchase:", error.message);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = () => {
    navigate(`/lesson/${id}`);
  };

  return (
    <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden">
      {/* Image Container */}
      <figure className="h-48 overflow-hidden">
        <img src={content_url} alt="Lesson" className="w-full h-full object-cover"/>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>Teacher: {creatorName}</p>
        <p>Price: ${price}</p>
        <p>{description}</p>
        {error && <p className="text-red-500">{error}</p>}
        {isPurchased ? (
          <button
            className="btn btn-success"
            onClick={handleAccess}
          >
            Access Lesson
          </button>
        ) : (
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
