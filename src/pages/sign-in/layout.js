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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="mt-3 text-gray-600">
              Sign in to access your purchased lessons and continue learning
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg px-6 py-8 sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                Sign in to your account
              </h2>
            </div>
            
            <button
              className="w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              aria-label="Sign in with Google"
            >
              <FcGoogle className="mr-3" size={24} />
              <span className="text-gray-700 font-medium text-lg">
                {isSubmitting ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            <AlertMessage error={error} />
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">New to TeachNiche?</p>
              <Link 
                to="/sign-up" 
                className="font-medium text-blue-600 hover:text-blue-500 mt-1 block"
                aria-label="Go to sign up page"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInLayout;
