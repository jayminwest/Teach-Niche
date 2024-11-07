// src/pages/sign-up/layout.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AlertMessage from "../../components/AlertMessage";

/**
 * SignUpLayout Component
 *
 * Renders the sign-up page with options for email/password and Google authentication.
 *
 * @returns {JSX.Element} The Sign Up page.
 */
const SignUpLayout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").upsert([
          {
            id: data.user.id,
            full_name: formData.name || null,
            email: formData.email,
            updated_at: new Date(),
          },
        ]);

        navigate("/profile");
      } else {
        setError("User sign-up failed.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

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
            <h1 className="text-3xl font-bold text-gray-900">Join TeachNiche</h1>
            <p className="mt-3 text-gray-600">
              Share your skills or learn from others in the dama community
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg px-6 py-8 sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                Create your account
              </h2>
            </div>

            <button
              className="w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              aria-label="Sign up with Google"
            >
              <FcGoogle className="mr-3" size={24} />
              <span className="text-gray-700 font-medium text-lg">
                {isSubmitting ? "Signing up..." : "Continue with Google"}
              </span>
            </button>
            
            <AlertMessage error={error} />
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">Already have an account?</p>
              <Link 
                to="/sign-in" 
                className="font-medium text-blue-600 hover:text-blue-500 mt-1 block"
                aria-label="Go to sign in page"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUpLayout;
