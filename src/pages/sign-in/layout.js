import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import supabase from "../../utils/supabaseClient";  // Ensure you have the Supabase client properly set up and imported

export default function SignInLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignIn = async (event) => {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/profile");  // Redirect to the homepage or dashboard after sign-in
    }
  };

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Sign In</h2>
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
                />
              </div>
              <div className="form-control">
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
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary">Sign In</button>
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="divider">OR</div>
            <button className="btn btn-warning flex items-center justify-center">
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
