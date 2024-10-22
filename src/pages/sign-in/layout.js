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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles sign-in with email and password.
   *
   * @param {Event} event - The form submission event.
   */
  const handleSignIn = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/profile");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles sign-in with Google OAuth.
   */
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex justify-center items-center py-10">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Sign In</h2>
            <form onSubmit={handleSignIn}>
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mt-4">
                <label className="label" htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
            <div className="divider">OR</div>
            <button
              className="btn btn-outline flex items-center justify-center"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <FcGoogle className="mr-2" size={24} />
              Sign In with Google
            </button>
            <div className="mt-6 text-center">
              <Link to="/forgot-password" className="link link-primary">
                Forgot Password?
              </Link>
            </div>
            <AlertMessage error={error} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInLayout;
