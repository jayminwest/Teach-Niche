import { useState } from 'react';
import supabase from '../../../utils/supabaseClient';

export const useLessonCreation = (isEditing = false) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrUpdateLesson = async ({
    lessonData,
    categoryIds,
    thumbnailUrl,
    vimeoData,
    lessonId = null
  }) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // Validate form data
      if (!lessonData.title.trim() || 
          !lessonData.description.trim() || 
          lessonData.cost === "" || 
          !lessonData.content?.trim()) {
        throw new Error("Please fill in all required fields");
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const lessonPayload = {
        title: lessonData.title.trim(),
        description: lessonData.description.trim(),
        price: parseFloat(lessonData.cost),
        content: lessonData.content.trim(),
        thumbnail_url: thumbnailUrl,
        vimeo_video_id: vimeoData?.vimeo_video_id || null,
        vimeo_url: vimeoData?.vimeo_url || null,
        status: vimeoData?.vimeo_video_id ? 'published' : 'draft'
      };

      let response;
      
      if (isEditing && lessonId) {
        // Update existing lesson
        const { error: updateError } = await supabase
          .from("tutorials")
          .update(lessonPayload)
          .eq("id", lessonId);

        if (updateError) throw updateError;
        
        // Handle categories update
        await supabase
          .from("tutorial_categories")
          .delete()
          .eq("tutorial_id", lessonId);

        response = { lesson_id: lessonId };
      } else {
        // Create new lesson
        response = await fetch(
          `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/create-lesson`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              ...lessonPayload,
              category_ids: categoryIds,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create lesson');
        }

        response = await response.json();
      }

      // Handle categories if editing
      if (isEditing && categoryIds.length > 0) {
        const categoryInserts = categoryIds.map((categoryId) => ({
          tutorial_id: response.lesson_id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("tutorial_categories")
          .insert(categoryInserts);

        if (categoryError) throw categoryError;
      }

      setSuccess(isEditing ? "Lesson updated successfully!" : "Lesson created successfully!");
      return response.lesson_id;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createOrUpdateLesson,
    error,
    success,
    isSubmitting,
    setError,
    setSuccess
  };
}; 