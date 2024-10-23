import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { disconnectVimeoAccount } from '../utils/vimeoAuth';
import supabase from '../utils/supabaseClient';

const ConnectVimeoButton = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'vimeo-oauth-success') {
        console.log('Vimeo OAuth success');
        onConnect();
        alert('Vimeo account connected successfully!');
      } else if (event.data.type === 'vimeo-oauth-error') {
        console.error('Error connecting Vimeo account:', event.data.error);
        alert(`Failed to connect Vimeo account: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onConnect]);

  const handleConnectVimeo = async () => {
    setIsConnecting(true);
    try {
      console.log('Initiating Vimeo connection...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in and try again.');
      }

      const response = await fetch(`${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/vimeo-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      console.log('Vimeo OAuth initiation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to initiate Vimeo connection:', errorText);
        throw new Error(`Failed to initiate Vimeo connection: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received Vimeo auth data:', data);

      if (data && data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Failed to initiate Vimeo connection: No auth URL returned');
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
      alert('Vimeo account disconnected successfully');
      onConnect(); // Update the parent component state
    } catch (error) {
      console.error('Error disconnecting Vimeo account:', error);
      alert(`Failed to disconnect Vimeo account: ${error.message}`);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={handleConnectVimeo}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Vimeo'}
      </button>
      <button
        className="btn btn-secondary ml-2"
        onClick={handleDisconnectVimeo}
      >
        Disconnect Vimeo
      </button>
    </div>
  );
};

export default ConnectVimeoButton;
