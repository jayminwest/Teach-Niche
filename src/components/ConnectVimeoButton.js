import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { disconnectVimeoAccount } from "../utils/vimeoAuth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
);

const ConnectVimeoButton = ({ onConnect, className }) => {
  const [loadingState, setLoadingState] = useState("idle"); // idle, checking, connecting
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    if (user) {
      checkVimeoConnection();
    }
  }, [user]);

  const checkVimeoConnection = async () => {
    setLoadingState("checking");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("vimeo_access_token")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setIsConnected(!!data.vimeo_access_token);
    } catch (error) {
      console.error("Error checking Vimeo connection:", error);
    } finally {
      setLoadingState("idle");
    }
  };

  if (authLoading) {
    return (
      <button className={`${className || "btn btn-primary"} opacity-50 cursor-not-allowed`} disabled>
        <span className="loading loading-spinner loading-sm mr-2"></span>
        Loading...
      </button>
    );
  }

  if (authError) {
    return (
      <button className={`${className || "btn btn-primary"} btn-error`} disabled>
        Error: {authError}
      </button>
    );
  }

  if (!user) {
    return (
      <button className={`${className || "btn btn-primary"} opacity-50`} disabled>
        Please log in first
      </button>
    );
  }

  const handleConnectVimeo = async () => {
    setLoadingState("connecting");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("No active session. Please log in and try again.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/vimeo-oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": process.env.REACT_APP_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ user_id: user.id }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to initiate Vimeo connection: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      if (data?.url) {
        window.open(data.url, "_blank");

        const checkConnectionInterval = setInterval(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("vimeo_access_token")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error checking Vimeo connection:", profileError);
            clearInterval(checkConnectionInterval);
            return;
          }

          if (profileData.vimeo_access_token) {
            clearInterval(checkConnectionInterval);
            setIsConnected(true);
            onConnect();
          }
        }, 5000);

        setTimeout(() => {
          clearInterval(checkConnectionInterval);
        }, 300000);
      } else {
        throw new Error("No authorization URL received from server");
      }
    } catch (error) {
      console.error("Error connecting to Vimeo:", error);
      alert(`Failed to connect to Vimeo: ${error.message}`);
    } finally {
      setLoadingState("idle");
    }
  };

  const handleDisconnectVimeo = async () => {
    setLoadingState("connecting");
    try {
      await disconnectVimeoAccount(user.id);
      setIsConnected(false);
      onConnect();
    } catch (error) {
      console.error("Error disconnecting Vimeo account:", error);
      alert(`Failed to disconnect Vimeo account: ${error.message}`);
    } finally {
      setLoadingState("idle");
    }
  };

  const getButtonText = () => {
    switch (loadingState) {
      case "checking":
        return "Checking connection...";
      case "connecting":
        return isConnected ? "Disconnecting..." : "Connecting...";
      default:
        return isConnected ? "Disconnect Vimeo" : "Connect Vimeo";
    }
  };

  return (
    <button
      className={className || "btn btn-primary"}
      onClick={isConnected ? handleDisconnectVimeo : handleConnectVimeo}
      disabled={loadingState !== "idle"}
    >
      {loadingState !== "idle" && (
        <span className="loading loading-spinner loading-sm mr-2"></span>
      )}
      {getButtonText()}
    </button>
  );
};

export default ConnectVimeoButton;
