import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";

/**
 * ResetPasswordLayout Component
 *
 * Renders the password reset page where users can set a new password.
 * This page is accessed via the reset password link sent to their email.
 *
 * @returns {JSX.Element} The Reset Password page.
 */
const ResetPasswordLayout = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if there's a valid recovery session
    const checkSession = async () => {
      try {
        // Get the access token from the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        
        if (access_token) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: null
          });
          
          if (error) {
            throw error;
          }

          if (session) {
            setIsValidSession(true);
            return;
          }
        }

        // Fallback to checking current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setIsValidSession(!!session);
      } catch (err) {
        console.error("Session check error:", err);
        setError("Invalid or expired reset link. Please request a new one.");
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage("Password updated successfully!");
      
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex justify-center items-center">
          <div className="card w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <AlertMessage error={error} />
              <button 
                onClick={() => navigate("/forgot-password")}
                className="btn btn-primary mt-4"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex justify-center items-center">
        <div className="card w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="card-title">Reset Password</h2>
            <form onSubmit={handlePasswordReset}>
              <div className="form-control">
                <label className="label" htmlFor="newPassword">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  className="input input-bordered"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label" htmlFor="confirmPassword">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  className="input input-bordered"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
            <AlertMessage error={error} success={message} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordLayout; 