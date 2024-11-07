import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * useAuthCallbackNavigation Hook
 *
 * Provides navigation handlers for the AuthCallback component.
 *
 * @returns {Object} An object containing navigation handler functions.
 */
export const useAuthCallbackNavigation = () => {
  const navigate = useNavigate();

  const handleNavigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleNavigateToSignIn = useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  return { handleNavigateToProfile, handleNavigateToSignIn };
}; 