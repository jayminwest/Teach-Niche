import { useState, useEffect } from 'react';
import supabaseClient from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

const usePurchasedLessons = (sortOption) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPurchasedLessons = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabaseClient
          .from('purchases')
          .select(`
            tutorial_id,
            purchase_date,
            tutorials (
              id, 
              title, 
              description, 
              price, 
              content_url, 
              created_at, 
              thumbnail_url, 
              creator_id,
              profiles (
                full_name
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedLessons = data.map(purchase => ({
          ...purchase.tutorials,
          purchaseDate: purchase.purchase_date,
          creator_name: purchase.tutorials.profiles?.full_name
        }));

        // Apply sorting
        let sortedLessons = [...formattedLessons];
        switch (sortOption) {
          case 'recent':
            sortedLessons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
          case 'oldest':
            sortedLessons.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
          case 'title':
            sortedLessons.sort((a, b) => a.title.localeCompare(b.title));
            break;
          default:
            sortedLessons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setLessons(sortedLessons);
      } catch (error) {
        console.error('Error fetching purchased lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedLessons();
  }, [user, sortOption]);

  return { lessons, loading };
};

export default usePurchasedLessons; 