// src/pages/logout/layout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Logout Component
 *
 * Handles user logout and redirects to the home page.
 *
 * @returns {JSX.Element} The Logout page.
 */
export default function Logout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut();
        navigate("/"); // Redirect to home after logout
      } catch (err) {
        setError("Failed to sign out. Please try again.");
        console.error("Error signing out:", err.message);
      }
    };

    performSignOut();
  }, [navigate, signOut]);

  return (
    <div className="flex justify-center items-center h-screen">
      {error ? <p className="text-red-500">{error}</p> : <p>Signing out...</p>}
    </div>
  );
}
