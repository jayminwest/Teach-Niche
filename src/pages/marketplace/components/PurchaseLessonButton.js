// src/pages/marketplace/components/PurchaseLessonButton.js

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * PurchaseLessonButton Component
 *
 * Renders a button to purchase a lesson and handles the purchase process.
 *
 * @param {Object} props
 * @param {string} props.lessonId - The ID of the lesson to be purchased.
 * @returns {JSX.Element} The Purchase Lesson Button.
 */
const PurchaseLessonButton = ({ lessonId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const handlePurchase = async () => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!session) {
        throw new Error("No active session found.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_FUNCTIONS_BASE_URL}/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ lessonId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error("Checkout session URL not returned");
      }
    } catch (err) {
      console.error("Error during purchase:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`mt-2 btn btn-primary ${loading ? "loading" : ""}`}
      >
        {loading ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
};

export default PurchaseLessonButton;
