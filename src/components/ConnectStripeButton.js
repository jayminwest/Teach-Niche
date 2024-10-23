import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ConnectStripeButton = ({ onConnect, className }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading, error } = useAuth();

  useEffect(() => {
    checkStripeConnection();
  }, [user]);

  const checkStripeConnection = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking Stripe connection:', error);
      } else {
        setIsConnected(data.stripe_onboarding_complete);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to connect your Stripe account.</div>;

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-connect",
        {
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to initiate Stripe Connect");
      }

      if (data && data.url) {
        window.open(data.url, '_blank');

        // Set up an interval to check if the connection was successful
        const checkConnectionInterval = setInterval(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('stripe_account_id, stripe_onboarding_complete')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error checking Stripe connection:', profileError);
            clearInterval(checkConnectionInterval);
            return;
          }

          if (profileData.stripe_onboarding_complete) {
            clearInterval(checkConnectionInterval);
            setIsConnected(true);
            onConnect();
          }
        }, 5000); // Check every 5 seconds

        // Clear the interval after 5 minutes (300000 ms) to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkConnectionInterval);
        }, 300000);
      } else {
        throw new Error('No authorization URL received from server');
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      alert(`Failed to connect to Stripe: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectStripe = async () => {
    try {
      // Implement Stripe disconnection logic here
      // For now, we'll just update the local state
      setIsConnected(false);
      onConnect();
    } catch (error) {
      console.error('Error disconnecting Stripe account:', error);
      alert(`Failed to disconnect Stripe account: ${error.message}`);
    }
  };

  return (
    <button
      className={className || "btn btn-primary"}
      onClick={isConnected ? handleDisconnectStripe : handleConnectStripe}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect Stripe' : 'Connect Stripe')}
    </button>
  );
};

export default ConnectStripeButton;
