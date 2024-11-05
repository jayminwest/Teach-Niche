// src/pages/sign-in/layout.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AlertMessage from "../../components/AlertMessage";

/**
 * SignInLayout Component
 *
 * Renders the sign-in page with options for email/password and Google authentication.
 *
 * @returns {JSX.Element} The Sign In page.
 */
const SignInLayout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles sign-in with Google OAuth.
   */
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Store user email in profiles after successful Google sign-in
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex justify-center items-center py-10">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Sign In</h2>
            
            <button
              className="btn btn-primary w-full h-14 text-lg"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              aria-label="Sign in with Google"
            >
              <FcGoogle className="mr-2" size={28} />
              {isSubmitting ? "Signing in..." : "Sign in with Google"}
            </button>

            <AlertMessage error={error} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInLayout;
