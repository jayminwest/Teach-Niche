import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";
import LessonRating from "../../components/LessonRating";
import LessonDiscussion from "../../components/LessonDiscussion";
import { useAuth } from "../../context/AuthContext";
import VideoUploadSection from "../create-lesson/components/VideoUploadSection";
import PriceSelector from "../create-lesson/components/PriceSelector";
import CategorySelector from "../create-lesson/components/CategorySelector";
import LessonContentEditor from "../create-lesson/components/LessonContentEditor";
import useVideoUpload from "../create-lesson/hooks/useVideoUpload";
import { useLessonCreation } from "../create-lesson/hooks/useLessonCreation";
import { PRICE_OPTIONS } from "../create-lesson/constants";

/**
 * EditLesson Component
 *
 * Renders the form for editing an existing lesson.
 *
 * @returns {JSX.Element} The Edit Lesson page.
 */
const EditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    cost: "",
    content: "",
    thumbnail_url: "",
    vimeo_video_id: "",
  });
  const [categoryIds, setCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [customPrice, setCustomPrice] = useState(false);
  const { user } = useAuth();

  // Custom hooks
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
    setError,
    setSuccess,
  } = useLessonCreation(true); // true for edit mode

  useEffect(() => {
    fetchLessonData();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    if (
      lessonData.cost && !PRICE_OPTIONS.includes(parseFloat(lessonData.cost))
    ) {
      setCustomPrice(true);
    }
  }, [lessonData.cost]);

  const fetchLessonData = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setLessonData({
        title: data.title || "",
        description: data.description || "",
        cost: data.price?.toString() || "",
        content: data.content || "",
        thumbnail_url: data.thumbnail_url || "",
        vimeo_video_id: data.vimeo_video_id || "",
      });
      setThumbnailPreview(data.thumbnail_url || null);

      const { data: categoryData, error: categoryError } = await supabase
        .from("tutorial_categories")
        .select("category_id")
        .eq("tutorial_id", id);

      if (categoryError) throw categoryError;

      setCategoryIds(categoryData.map((item) => item.category_id));
    } catch (err) {
      console.error("Error fetching lesson:", err.message);
      setError("Failed to load lesson data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
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
          id,
          lessonData.title,
          lessonData.description,
        );
      }

      // Update lesson with all data
      await createOrUpdateLesson({
        lessonData,
        categoryIds,
        thumbnailUrl,
        vimeoData: vimeoData || { vimeo_video_id: lessonData.vimeo_video_id },
        lessonId: id,
      });

      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.error("Error updating lesson:", err);
    }
  };

  const handleDeleteLesson = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      // Delete video from Vimeo if it exists
      if (lessonData.vimeo_video_id) {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/delete-vimeo-video`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              videoId: lessonData.vimeo_video_id,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete video");
        }
      }

      // Delete thumbnail from storage if it exists
      if (lessonData.thumbnail_url) {
        // Extract the file path from the URL or use the path directly
        let thumbnailPath = lessonData.thumbnail_url;
        if (thumbnailPath.startsWith("http")) {
          // Extract the filename from the URL
          thumbnailPath = thumbnailPath.split("/").pop();
          thumbnailPath = `lesson-thumbnails/${thumbnailPath}`;
        }

        const { error: deleteStorageError } = await supabase.storage
          .from("lesson-thumbnails")
          .remove([thumbnailPath]);

        if (deleteStorageError) {
          console.error("Error deleting thumbnail:", deleteStorageError);
          // Continue with lesson deletion even if thumbnail deletion fails
        }
      }

      // Delete tutorial categories and the tutorial itself
      await supabase
        .from("tutorial_categories")
        .delete()
        .eq("tutorial_id", id);

      const { error: deleteError } = await supabase
        .from("tutorials")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setSuccess("Lesson deleted successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err.message || "Failed to delete lesson");
      console.error("Error deleting lesson:", err);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <form onSubmit={handleSubmit} className="space-y-6" role="form">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={lessonData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={lessonData.description}
                  onChange={handleInputChange}
                  required
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

            {/* Video Section */}
            <div>
              {lessonData.vimeo_video_id && (
                <div className="mb-4">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe
                      src={`https://player.vimeo.com/video/${lessonData.vimeo_video_id}`}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={lessonData.title}
                    />
                  </div>
                </div>
              )}
              <VideoUploadSection
                videoFile={videoFile}
                onVideoChange={(e) => setVideoFile(e.target.files[0])}
                onVideoRemove={() => setVideoFile(null)}
                existingVideoId={lessonData.vimeo_video_id}
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              <div className="mt-1 flex flex-col gap-4">
                {/* Show existing or preview thumbnail */}
                {(thumbnailPreview || lessonData.thumbnail_url) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={thumbnailPreview ||
                        getThumbnailUrl(lessonData.thumbnail_url)}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview(null);
                        setLessonData((prev) => ({
                          ...prev,
                          thumbnail_url: null,
                        }));
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
                ? "Updating lesson..."
                : "Update lesson"}
            </button>
          </form>
        );
      case "reviews":
        return <LessonRating lessonId={id} />;
      case "discussion":
        return <LessonDiscussion lessonId={id} />;
      default:
        return null;
    }
  };

  const getThumbnailUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL, return it
    if (url.startsWith("http")) return url;

    // Get public URL from Supabase
    const { data: { publicUrl } } = supabase.storage
      .from("lesson-thumbnails")
      .getPublicUrl(url);

    return publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Edit Lesson</h2>
            <button
              onClick={handleDeleteLesson}
              className="btn btn-error"
              disabled={isSubmitting}
            >
              Delete Lesson
            </button>
          </div>

          <div className="mb-6">
            <div className="flex border-b">
              {["content", "reviews", "discussion"].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  className={`py-2 px-4 ${
                    activeTab === tab
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {renderTabContent()}
          <AlertMessage error={error} success={success} />
        </div>
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
      </main>
    </div>
  );
};

export default EditLesson;
