import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";  // Ensure you have the Supabase client properly set up and imported

export default function ForgotPasswordLayout() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link has been sent to your email.');
    }
  };

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Forgot Password</h2>
            <form onSubmit={handlePasswordReset}>
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
              <div className="form-control mt-6">
                <button className="btn btn-primary">Send Reset Link</button>
              </div>
            </form>
            {message && <p className="text-green-500 mt-4">{message}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
