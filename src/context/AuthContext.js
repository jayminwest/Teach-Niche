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

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      } else {
        setSession(session);
        setUser(session?.user || null);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const value = {
    session,
    user,
    signOut,
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
