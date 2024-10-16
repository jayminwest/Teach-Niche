// src/pages/marketplace/components/PurchaseLessonButton.js

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Ensure correct path
import { useNavigate } from "react-router-dom";

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

    console.log("Initiating purchase for lessonId:", lessonId); // Added logging

    setLoading(true);
    setError(null);

    try {
      if (!session) {
        console.error("No active session found.");
        navigate("/sign-in");
        return;
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
        },
      );

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        // Attempt to parse error message
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to create checkout session");
        } else {
          // If response is not JSON, log it for debugging
          const errorText = await response.text();
          console.error("Non-JSON response:", errorText);
          setError("An unexpected error occurred.");
        }
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl;
      } else {
        console.error(
          "Expected JSON response but received:",
          await response.text(),
        );
        setError("An unexpected error occurred.");
      }
    } catch (err) {
      console.error("Error during purchase:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
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
