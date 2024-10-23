// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

/**
 * AuthContext
 *
 * Provides authentication state and methods throughout the application.
 */
const AuthContext = createContext();

/**
 * AuthProvider Component
 *
 * Manages authentication state and provides it to child components.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the provider
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error fetching session:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs out the current user
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error.message);
      setError(error.message);
    } finally {
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    signOut,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * @returns {Object} The auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
