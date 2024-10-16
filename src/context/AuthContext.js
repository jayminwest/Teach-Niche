// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch the initial session
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

    // Listen for authentication state changes
    const { subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      },
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Add a signOut function to the context
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    // Auth state change listener will handle state updates
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};
