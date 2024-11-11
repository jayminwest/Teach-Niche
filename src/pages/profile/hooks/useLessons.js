import { useState, useEffect } from "react";
import supabase from "../../../utils/supabaseClient";

const useLessons = (userId) => {
  const [createdLessons, setCreatedLessons] = useState([]);
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);

  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchCreatedLessons(userId),
        fetchPurchasedLessons(userId),
      ]).finally(() => setLoading(false));
    }
  }, [userId]);

  const fetchCreatedLessons = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select(
          "id, title, description, price, content_url, created_at, thumbnail_url"
        )
        .eq("creator_id", userId);

      if (error) throw error;
      setCreatedLessons(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPurchasedLessons = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          tutorial_id,
          purchase_date,
          tutorials (id, title, description, price, content_url, created_at, thumbnail_url, creator_id)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      setPurchasedLessons(data.map((purchase) => ({
        ...purchase.tutorials,
        purchaseDate: purchase.purchase_date,
      })));
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      const { error: deleteError } = await supabase
        .from("tutorials")
        .delete()
        .eq("id", lessonId);

      if (deleteError) throw deleteError;

      setCreatedLessons(prevLessons => 
        prevLessons.filter(lesson => lesson.id !== lessonId)
      );
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  return {
    createdLessons,
    purchasedLessons,
    loading,
    error,
    deleteLesson,
    deletingLesson,
    setDeletingLesson,
  };
};

export default useLessons; 