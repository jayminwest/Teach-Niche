// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      }
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;
