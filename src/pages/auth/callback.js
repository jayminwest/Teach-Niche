import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/sign-in'); // Redirect to sign-in page if there's an error
      } else if (data?.session) {
        navigate('/profile'); // Redirect to profile page on successful auth
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Processing authentication...</div>;
}
