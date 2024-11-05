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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex justify-center items-center py-10">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Sign Up</h2>
            <button
              className="btn btn-primary w-full h-14 text-lg"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              aria-label="Sign up with Google"
            >
              <FcGoogle className="mr-2" size={28} />
              {isSubmitting ? "Signing up..." : "Sign up with Google"}
            </button>
            
            <AlertMessage error={error} />
            
            <div className="mt-6 text-center">
              <p>Already have an account?</p>
              <Link 
                to="/sign-in" 
                className="btn btn-link"
                aria-label="Go to sign in page"
              >
                Sign In
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
