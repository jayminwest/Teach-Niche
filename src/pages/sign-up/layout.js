// src/pages/sign-up/layout.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
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
            <form onSubmit={handleSignUp}>
              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="Password"
                  className="input input-bordered"
                  value={formData.password}
                  onChange={handleChange}
                  required
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
            <div className="divider">OR</div>
            <button
              className="btn btn-outline flex items-center justify-center"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
            >
              <FcGoogle className="mr-2" size={24} />
              Sign Up with Google
            </button>
            <AlertMessage error={error} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUpLayout;
