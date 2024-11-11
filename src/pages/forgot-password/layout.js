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
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      setError(error.message || "An error occurred while sending reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
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
                  disabled={isLoading}
                />
              </div>
              <div className="form-control mt-6">
                <button 
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
            <AlertMessage success={message} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordLayout;
