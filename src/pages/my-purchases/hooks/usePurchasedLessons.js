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
              reviews!tutorial_id(rating),
              profiles (
                full_name
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedLessons = data.map(purchase => {
          const reviews = purchase.tutorials.reviews || [];
          let averageRating = 0;
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
            averageRating = totalRating / reviews.length;
          }

          return {
            ...purchase.tutorials,
            purchaseDate: purchase.purchase_date,
            creator_name: purchase.tutorials.profiles?.full_name,
            averageRating
          };
        });

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