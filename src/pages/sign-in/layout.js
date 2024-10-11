// src/pages/sign-in/layout.js
import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";  

export default function SignInLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Redirect to the profile page after successful sign-in
      navigate("/profile");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect URL after successful sign-in
        redirectTo: 'https://your-domain.com/profile',
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Sign In</h2>
            <form onSubmit={handleSignIn}>
              <div className="form-control mt-4">
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
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="divider">OR</div>
            <button 
              className="btn btn-warning flex items-center justify-center mb-4"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <FcGoogle className="mr-2" size={24} />
              Sign In with Google
            </button>
            <div className="form-control mt-6 justify-center items-center">
              <Link to="/forgot-password" className="link link-primary">
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
