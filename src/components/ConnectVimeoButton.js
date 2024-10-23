import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disconnectVimeoAccount } from '../utils/vimeoAuth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ConnectVimeoButton = ({ onConnect, className }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading, error } = useAuth();

  useEffect(() => {
    checkVimeoConnection();
  }, [user]);

  const checkVimeoConnection = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('vimeo_access_token')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking Vimeo connection:', error);
      } else {
        setIsConnected(!!data.vimeo_access_token);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to connect your Vimeo account.</div>;

  const handleConnectVimeo = async () => {
    setIsConnecting(true);
    try {
      console.log('Starting Vimeo connection process');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Error getting session:', sessionError);
        throw new Error('No active session. Please log in and try again.');
      }

      console.log('Session obtained:', session);
      console.log('User:', user);
      console.log('Making request with token:', session.access_token);
      
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/vimeo-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ 
          user_id: user.id 
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Vimeo connection error details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to initiate Vimeo connection: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data?.url) {
        // Open Vimeo authorization in a new tab
        window.open(data.url, '_blank');

        // Set up an interval to check if the connection was successful
        const checkConnectionInterval = setInterval(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('vimeo_access_token')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error checking Vimeo connection:', profileError);
            clearInterval(checkConnectionInterval);
            return;
          }

          if (profileData.vimeo_access_token) {
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
      console.error('Error connecting to Vimeo:', error);
      alert(`Failed to connect to Vimeo: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectVimeo = async () => {
    try {
      await disconnectVimeoAccount(user.id);
      console.log('Vimeo account disconnected successfully');
      setIsConnected(false);
      onConnect(); // Update the parent component state
    } catch (error) {
      console.error('Error disconnecting Vimeo account:', error);
      alert(`Failed to disconnect Vimeo account: ${error.message}`);
    }
  };

  return (
    <button
      className={className || "btn btn-primary"}
      onClick={isConnected ? handleDisconnectVimeo : handleConnectVimeo}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : (isConnected ? 'Disconnect Vimeo' : 'Connect Vimeo')}
    </button>
  );
};

export default ConnectVimeoButton;
