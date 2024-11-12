import { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";

const useStripeConnect = (userId) => {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      checkStripeConnection();
    }
  }, [userId]);

  const checkStripeConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_account_id, stripe_onboarding_complete")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setStripeConnected(!!data.stripe_onboarding_complete);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initiateStripeConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-connect",
        {
          body: JSON.stringify({ userId }),
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to initiate Stripe Connect");
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to initiate Stripe Connect: No URL returned");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return {
    stripeConnected,
    loading: loading,
    error,
    checkStripeConnection,
    initiateStripeConnect,
  };
};

export default useStripeConnect;
