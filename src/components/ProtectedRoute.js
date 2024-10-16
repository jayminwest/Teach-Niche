// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

/**
 * ProtectedRoute Component
 *
 * Restricts access to routes based on user authentication status.
 *
 * @param {Object} props
 * @param {JSX.Element} props.children - The child components to render if authenticated.
 * @returns {JSX.Element} The protected route or a redirect to sign-in.
 */
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    /**
     * Fetches the current user session from Supabase.
     */
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      }
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      },
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Display a loading indicator while fetching the session
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    // Redirect unauthenticated users to the sign-in page
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;
