import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";

/**
 * AuthCallback Component
 *
 * Handles the authentication callback after OAuth sign-in.
 * Includes timeout and better error handling.
 *
 * @returns {JSX.Element} A loading message or error state while processing the callback.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const AUTH_TIMEOUT = 10000; // 10 seconds timeout
    let timeoutId;

    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying session...");
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (data?.session?.user?.id) {
          setStatus("Session verified, redirecting...");
          navigate("/profile");
        } else {
          throw new Error("Invalid session data received");
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err.message || "Authentication failed. Please try again.");
        navigate("/sign-in");
      }
    };

    // Set timeout for auth process
    timeoutId = setTimeout(() => {
      setError("Authentication timed out. Please try again.");
      navigate("/sign-in");
    }, AUTH_TIMEOUT);

    handleAuthCallback();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertMessage error={error} />
        <button 
          onClick={() => navigate("/sign-in")}
          className="btn btn-primary mt-4"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center space-x-4">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
