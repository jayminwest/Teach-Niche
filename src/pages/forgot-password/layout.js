import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";

/**
 * ForgotPasswordLayout Component
 *
 * Renders the Forgot Password page for users to reset their password.
 *
 * @returns {JSX.Element} The Forgot Password page.
 */
const ForgotPasswordLayout = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto">
      <Header />
      <main className="flex justify-center items-center min-h-screen">
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
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">
                  Send Reset Link
                </button>
              </div>
            </form>
            <AlertMessage success={message} error={error} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordLayout;
