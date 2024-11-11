import { useState, useEffect } from 'react';
import supabase from '../../../utils/supabaseClient';

const useLessonData = (id, user) => {
  const [lesson, setLesson] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessonAndAccess = async () => {
      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from("tutorials")
          .select("*")
          .eq("id", id)
          .single();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", lessonData.creator_id)
          .maybeSingle();

        if (creatorError) throw creatorError;
        setCreator(creatorData);

        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("tutorial_id", id)
            .eq("status", 'completed')
            .maybeSingle();

          if (purchaseError) throw purchaseError;

          setHasAccess(
            lessonData.price === 0 || 
            lessonData.creator_id === user.id || 
            !!purchaseData
          );
        }
      } catch (err) {
        console.error("Error in fetchLessonAndAccess:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndAccess();
  }, [id, user]);

  return { lesson, creator, loading, hasAccess, error };
};

export default useLessonData; 