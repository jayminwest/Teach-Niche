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
 * @param {React.ReactNode} props.children - The child components to render if authenticated.
 * @returns {JSX.Element} The protected route or a redirect to sign-in.
 */
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error.message);
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return session ? children : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;
