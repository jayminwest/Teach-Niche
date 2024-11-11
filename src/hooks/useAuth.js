import { useState } from "react";
import supabase from "../utils/supabaseClient";

const useAuth = () => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").upsert([
          {
            id: user.id,
            email: user.email,
            updated_at: new Date(),
          },
        ]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    error,
    setError,
    isSubmitting,
    setIsSubmitting,
    handleGoogleAuth,
  };
};

export default useAuth; 