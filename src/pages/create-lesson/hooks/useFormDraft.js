import { useEffect } from "react";
import { DRAFT_STORAGE_KEY } from "../constants";

const useFormDraft = (
  lessonData,
  setLessonData,
  categoryIds,
  setCategoryIds,
  thumbnailPreview,
  setThumbnailPreview,
) => {
  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setLessonData(parsed.lessonData);
      setCategoryIds(parsed.categoryIds);
      if (parsed.thumbnailPreview) {
        setThumbnailPreview(parsed.thumbnailPreview);
      }
    }
  }, []);

  // Save form data on changes
  useEffect(() => {
    const draftData = {
      lessonData,
      categoryIds,
      thumbnailPreview,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  }, [lessonData, categoryIds, thumbnailPreview]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return { clearDraft };
};

export default useFormDraft;
