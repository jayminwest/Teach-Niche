import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";

/**
 * AuthCallback Component
 *
 * Handles the authentication callback after OAuth sign-in.
 *
 * @returns {JSX.Element} A loading message while processing the callback.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session) {
          navigate("/profile");
        } else {
          navigate("/sign-in");
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err.message);
        navigate("/sign-in");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return <div className="text-red-500">Authentication failed: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-2">Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
