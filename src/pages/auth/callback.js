import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";
import { useCallback } from "react";
import { useAuthCallbackNavigation } from "../../hooks/useAuthCallbackNavigation";

/**
 * AuthCallback Component
 *
 * Handles the authentication callback after OAuth sign-in.
 * Includes timeout and better error handling.
 *
 * @returns {JSX.Element} A loading message or error state while processing the callback.
 */
const AuthCallback = () => {
  const { handleNavigateToProfile, handleNavigateToSignIn } =
    useAuthCallbackNavigation();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying session...");
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (data?.session?.user?.id) {
          setStatus("Session verified, redirecting...");
          handleNavigateToProfile();
        } else {
          throw new Error("Invalid session data received");
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err.message || "Authentication failed. Please try again.");
        handleNavigateToSignIn();
      }
    };

    handleAuthCallback();
  }, [handleNavigateToProfile, handleNavigateToSignIn]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertMessage error={error} />
        <button
          onClick={handleNavigateToSignIn}
          className="btn btn-primary mt-4"
          aria-label="Return to Sign In"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center space-x-4">
        <span
          className="loading loading-spinner loading-lg"
          role="status"
          aria-label="Loading"
        />
        <p className="text-lg" aria-live="polite">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
