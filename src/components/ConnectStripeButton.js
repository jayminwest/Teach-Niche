import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY,
);

const ConnectStripeButton = ({ onConnect, className }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingState, setLoadingState] = useState("idle"); // idle, checking, connecting
  const { user, loading: authLoading, error: authError } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      checkStripeConnection();
    }
  }, [user]);

  const checkStripeConnection = async () => {
    setLoadingState("checking");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_account_id, stripe_onboarding_complete")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setIsConnected(data.stripe_onboarding_complete);
    } catch (error) {
      console.error("Error checking Stripe connection:", error);
    } finally {
      setLoadingState("idle");
    }
  };

  if (authLoading) {
    return (
      <button
        className={`${
          className || "btn btn-primary"
        } opacity-50 cursor-not-allowed`}
        disabled
      >
        <span className="loading loading-spinner loading-sm mr-2"></span>
        Loading...
      </button>
    );
  }

  if (authError) {
    return (
      <button
        className={`${className || "btn btn-primary"} btn-error`}
        disabled
      >
        Error: {authError}
      </button>
    );
  }

  if (!user) {
    return (
      <button
        className={`${className || "btn btn-primary"} opacity-50`}
        disabled
      >
        Please log in first
      </button>
    );
  }

  const handleConnectStripe = async () => {
    setLoadingState("connecting");
    try {
      const { data: { session }, error: sessionError } = await supabase.auth
        .getSession();

      if (sessionError || !session) {
        throw new Error("No active session. Please log in and try again.");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-stripe-connect",
        {
          body: JSON.stringify({ userId: user.id }),
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) throw error;

      if (data?.url) {
        localStorage.setItem('stripeConnecting', 'true');
        window.open(data.url, "_blank");

        const checkConnectionInterval = setInterval(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("stripe_account_id, stripe_onboarding_complete")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error checking Stripe connection:", profileError);
            clearInterval(checkConnectionInterval);
            return;
          }

          if (profileData.stripe_onboarding_complete) {
            clearInterval(checkConnectionInterval);
            localStorage.removeItem('stripeConnecting');
            setIsConnected(true);
            onConnect();
          }
        }, 5000);

        setTimeout(() => {
          clearInterval(checkConnectionInterval);
          localStorage.removeItem('stripeConnecting');
        }, 300000);
      } else {
        throw new Error("No authorization URL received from server");
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('Platform Controls')) {
        setError('Please reconnect your Stripe account to enable additional features.');
      }
    } finally {
      setLoadingState("idle");
    }
  };

  const handleDisconnectStripe = async () => {
    setLoadingState("connecting");
    try {
      setIsConnected(false);
      onConnect();
    } catch (error) {
      console.error("Error disconnecting Stripe account:", error);
      alert(`Failed to disconnect Stripe account: ${error.message}`);
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
        return isConnected ? "Disconnect Stripe" : "Connect Stripe";
    }
  };

  return (
    <button
      className={className || "btn btn-primary"}
      onClick={isConnected ? handleDisconnectStripe : handleConnectStripe}
      disabled={loadingState !== "idle"}
    >
      {loadingState !== "idle" && (
        <span className="loading loading-spinner loading-sm mr-2"></span>
      )}
      {getButtonText()}
    </button>
  );
};

export default ConnectStripeButton;
