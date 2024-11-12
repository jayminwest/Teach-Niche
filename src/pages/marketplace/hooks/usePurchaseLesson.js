import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import supabase from "../../../utils/supabaseClient";

export const usePurchaseLesson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const purchaseLesson = async (lessonId, price, isWelcomeLesson) => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    if (price === 0 || isWelcomeLesson) {
      return handleFreeLesson(lessonId);
    }

    return handlePaidLesson(lessonId);
  };

  const handleFreeLesson = async (lessonId) => {
    try {
      const { error } = await supabase
        .from("purchases")
        .insert([{
          user_id: user.id,
          tutorial_id: lessonId,
          purchase_date: new Date().toISOString(),
          status: "completed",
          amount: 0,
          creator_id: user.id,
        }]);

      if (error) throw error;
      navigate(`/lesson/${lessonId}`);
    } catch (err) {
      setError("Failed to access free lesson");
      throw err;
    }
  };

  const handlePaidLesson = async (lessonId) => {
    setLoading(true);
    setError(null);

    try {
      const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        throw new Error("Functions URL not configured");
      }

      const response = await fetch(`${functionsUrl}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ tutorialId: lessonId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();

      if (!data.sessionUrl) {
        throw new Error("No checkout session URL returned");
      }

      window.location.href = data.sessionUrl;
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseLesson,
    loading,
    error,
  };
};
