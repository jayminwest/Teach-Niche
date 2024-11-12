// src/pages/create-lesson/layout.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";
import { useAuth } from "../../context/AuthContext";
import VideoUploadSection from "./components/VideoUploadSection";
import PriceSelector from "./components/PriceSelector";
import CategorySelector from "./components/CategorySelector";
import LessonContentEditor from "./components/LessonContentEditor";
import useFormDraft from "./hooks/useFormDraft";
import useVideoUpload from "./hooks/useVideoUpload";
import { useLessonCreation } from "./hooks/useLessonCreation";

/**
 * CreateLesson Component
 *
 * Renders the form for creating a new lesson with improved user experience.
 *
 * @returns {JSX.Element} The Create Lesson page.
 */
const CreateLesson = () => {
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    cost: "0",
    content: "",
  });
  const [categoryIds, setCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [customPrice, setCustomPrice] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Custom hooks
  const { clearDraft } = useFormDraft(
    lessonData,
    setLessonData,
    categoryIds,
    setCategoryIds,
    thumbnailPreview,
    setThumbnailPreview,
  );

  const {
    uploadVideo,
    videoUploadProgress,
    uploadStatus,
    isUploading,
  } = useVideoUpload();

  const {
    createOrUpdateLesson,
    error,
    success,
    isSubmitting,
  } = useLessonCreation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
    } else {
      setCategories(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCategoryIds((prev) => [...prev, parseInt(value)]);
    } else {
      setCategoryIds((prev) => prev.filter((id) => id !== parseInt(value)));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Handle thumbnail upload if exists
      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        const fileExt = thumbnail.name.split(".").pop();
        const fileName = `lesson-thumbnails/${Math.random()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lesson-thumbnails")
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-thumbnails")
          .getPublicUrl(fileName);

        thumbnailUrl = publicUrl;
      }

      // If there's a video file, upload it first
      let vimeoData = null;
      if (videoFile) {
        vimeoData = await uploadVideo(
          videoFile,
          null, // No lessonId yet
          lessonData.title,
          lessonData.description,
        );
      }

      // Create the lesson with all data
      const lessonId = await createOrUpdateLesson({
        lessonData,
        categoryIds,
        thumbnailUrl,
        vimeoData,
      });

      clearDraft();
      setTimeout(() => navigate("/marketplace"), 2000);
    } catch (err) {
      console.error("Error creating lesson:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Lesson
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Note: Lesson drafts will not be saved and refreshing will clear
              your progress!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6" role="form">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    What's your lesson called?
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={lessonData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Big Cup To Spike, How To Film POV, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    A short description of your lesson:
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={lessonData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="What will people learn from your lesson?"
                  />
                </div>
              </div>

              {/* Price Selector */}
              <PriceSelector
                cost={lessonData.cost}
                onCostChange={(value) =>
                  setLessonData((prev) => ({ ...prev, cost: value }))}
                customPrice={customPrice}
                setCustomPrice={setCustomPrice}
              />

              {/* Video Upload Section */}
              <VideoUploadSection
                videoFile={videoFile}
                onVideoChange={(e) => setVideoFile(e.target.files[0])}
                onVideoRemove={() => setVideoFile(null)}
              />

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail
                </label>
                <div className="mt-1 flex flex-col gap-4">
                  {/* Show thumbnail preview */}
                  {thumbnailPreview && (
                    <div className="relative w-32 h-32">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  {/* Upload input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              </div>

              {/* Content Editor */}
              <LessonContentEditor
                content={lessonData.content}
                onChange={(content) =>
                  setLessonData((prev) => ({ ...prev, content }))}
              />

              {/* Category Selector */}
              {categories.length > 0 && (
                <CategorySelector
                  categories={categories}
                  selectedIds={categoryIds}
                  onChange={handleCategoryChange}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "Uploading video..."
                  : isSubmitting
                  ? "Creating your lesson..."
                  : "Share your lesson"}
              </button>
            </form>
          </div>

          <AlertMessage error={error} success={success} />
        </div>
      </main>

      {/* Updated Upload Progress Overlay to match edit-lesson */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm w-full">
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{uploadStatus}</span>
              <span className="text-sm font-medium">
                {videoUploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${videoUploadProgress}%` }}
              >
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLesson;
