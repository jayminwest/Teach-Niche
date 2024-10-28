import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";
import LessonRating from "../../components/LessonRating";
import LessonDiscussion from "../../components/LessonDiscussion";
import { useAuth } from "../../context/AuthContext";

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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchLessonData();
    fetchCategories();
  }, [id]);

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
        cost: data.price || "",
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUploadProgress(0); // Reset progress when a new file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    setVideoUploadProgress(0);

    let vimeo_video_id = lessonData.vimeo_video_id;
    let videoUrl = null;  // Declare videoUrl here

    if (
      !lessonData.title.trim() || 
      !lessonData.description.trim() || 
      lessonData.cost === '' || 
      !lessonData.content.trim()
    ) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error("No active session. Please log in and try again.");
      }

      if (videoFile) {
        setIsUploading(true);
        setUploadStatus('Preparing video upload...');
        
        const initFormData = new FormData();
        initFormData.append('video', videoFile);
        initFormData.append('title', lessonData.title);
        initFormData.append('description', lessonData.description);

        setUploadStatus('Initializing upload...');
        
        const initResponse = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/upload-vimeo-video/initialize`, 
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: initFormData,
          }
        );

        if (!initResponse.ok) {
          const errorData = await initResponse.json();
          throw new Error(errorData.error || 'Failed to initialize video upload');
        }

        const { 
          upload_link, 
          vimeo_video_id: newVimeoId, 
          vimeo_url,  // Get from response
          chunk_size, 
          access_token 
        } = await initResponse.json();
        vimeo_video_id = newVimeoId;
        videoUrl = vimeo_url;  // Assign the value

        // Upload video in chunks
        const totalSize = videoFile.size;
        let uploadedBytes = 0;
        
        while (uploadedBytes < totalSize) {
          const chunk = videoFile.slice(uploadedBytes, uploadedBytes + chunk_size);
          
          const chunkResponse = await fetch(upload_link, {
            method: 'PATCH',
            headers: {
              'Tus-Resumable': '1.0.0',
              'Upload-Offset': uploadedBytes.toString(),
              'Content-Type': 'application/offset+octet-stream',
              'Authorization': `Bearer ${access_token}`,
            },
            body: chunk,
          });

          if (!chunkResponse.ok) {
            throw new Error(`Failed to upload chunk at offset ${uploadedBytes}`);
          }

          uploadedBytes = parseInt(chunkResponse.headers.get('Upload-Offset') || '0');
          const progress = (uploadedBytes / totalSize) * 100;
          setVideoUploadProgress(Math.round(progress));
          setUploadStatus(`Uploading: ${Math.round(progress)}%`);

          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        }

        setUploadStatus('Upload complete! Processing...');
      }

      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        const fileExt = thumbnail.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `lesson-thumbnails/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("lesson-thumbnails")
          .upload(filePath, thumbnail);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-thumbnails")
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const price = parseFloat(lessonData.cost);
      if (isNaN(price) || price < 0) {
        throw new Error("Price must be a non-negative number.");
      }

      const { data, error } = await supabase
        .from("tutorials")
        .update({
          title: lessonData.title.trim(),
          description: lessonData.description.trim(),
          price: price,
          content: lessonData.content.trim(),
          thumbnail_url: thumbnailUrl,
          vimeo_video_id: vimeo_video_id,
          vimeo_url: videoUrl,  // Use the renamed variable
        })
        .eq("id", id);

      if (error) throw error;

      await supabase
        .from("tutorial_categories")
        .delete()
        .eq("tutorial_id", id);

      if (categoryIds.length > 0) {
        const categoryInserts = categoryIds.map((categoryId) => ({
          tutorial_id: id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("tutorial_categories")
          .insert(categoryInserts);

        if (categoryError) throw categoryError;
      }

      setSuccess("Lesson updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error updating lesson:", err);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={lessonData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={lessonData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost (USD)
              </label>
              <input
                type="number"
                step="0.01"
                id="cost"
                name="cost"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={lessonData.cost}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              <div className="mt-1 flex items-center">
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover mr-4"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <TextEditor
                value={lessonData.content}
                onChange={(content) =>
                  setLessonData((prev) => ({ ...prev, content }))}
              />
            </div>

            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        value={category.id}
                        checked={categoryIds.includes(category.id)}
                        onChange={handleCategoryChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                Video
              </label>
              
              {lessonData.vimeo_video_id ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Video:</p>
                      <p className="font-medium">
                        <i className="bi bi-play-circle mr-2" aria-hidden="true"></i>
                        Video ID: {lessonData.vimeo_video_id}
                      </p>
                    </div>
                    <a 
                      href={`https://vimeo.com/${lessonData.vimeo_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      View on Vimeo
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mb-4 text-sm text-gray-500">No video currently uploaded</p>
              )}

              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">
                  {lessonData.vimeo_video_id ? "Replace current video:" : "Upload a video:"}
                </p>
                <input
                  type="file"
                  id="video"
                  accept="video/*,.mov,.mp4"  // Updated to explicitly accept iPhone formats
                  capture="environment"  // Allows direct camera access on mobile
                  onChange={handleVideoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected video: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Lesson..." : "Update Lesson"}
              </button>
            </div>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Edit Lesson</h2>
          <div className="mb-6">
            <div className="flex border-b">
              {["content", "reviews", "discussion"].map((tab) => (
                <button
                  key={tab}
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
                <span className="text-sm font-medium">{videoUploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${videoUploadProgress}%` }}
                ></div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EditLesson;
