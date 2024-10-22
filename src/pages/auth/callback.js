import { useEffect } from "react";
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

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error during auth callback:", error);
        navigate("/sign-in");
      } else if (data?.session) {
        navigate("/profile");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;
