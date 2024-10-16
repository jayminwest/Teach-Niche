// src/pages/sign-up/layout.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";

/**
 * SignUpLayout Component
 *
 * Renders the sign-up page with options for email/password and Google authentication.
 *
 * @returns {JSX.Element} The Sign Up page.
 */
export default function SignUpLayout() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Navigates to the sign-in page.
   */
  const handleSignInClick = () => {
    navigate("/sign-in");
  };

  /**
   * Handles sign-up with email and password.
   *
   * @param {Event} event - The form submission event.
   */
  const handleSignUp = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Sign up the user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Optionally pass additional user metadata here
          },
        },
      });

      if (error) throw error;

      const user = data.user;

      if (user) {
        // Use upsert to insert or update the profile
        const { error: profileError } = await supabase.from("profiles").upsert([
          {
            id: user.id,
            full_name: name || null, // Allow name to be optional
            email: email, // Store email if needed
            updated_at: new Date(),
          },
        ]);

        if (profileError) {
          setError(profileError.message);
        } else {
          // Redirect to the profile page after successful sign-up
          navigate("/profile");
        }
      } else {
        setError("User sign-up failed.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles sign-up with Google OAuth.
   */
  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redirect URL after successful sign-up
        redirectTo: "https://your-domain.com/profile",
      },
    });

    if (error) {
      setError(error.message);
    }
    // The user will be redirected to Google for authentication
  };

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100 p-6">
          <div className="card-body">
            <button
              className="btn btn-primary mb-4"
              onClick={handleSignInClick}
              disabled={isSubmitting}
            >
              Have an account? Sign In
            </button>
            <button
              className="btn btn-warning flex items-center justify-center mb-4"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
            >
              <FcGoogle className="mr-2" size={24} />
              Sign Up with Google
            </button>
            <div className="divider"></div>
            <h2 className="card-title text-2xl mb-4">Sign Up</h2>
            <form onSubmit={handleSignUp}>
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
              {/* Optional: Allow users to add their full name during sign-up */}
              <div className="form-control mt-4">
                <label className="label" htmlFor="name">
                  <span className="label-text">Full Name (Optional)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Full Name"
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
