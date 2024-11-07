// src/pages/create-lesson/layout.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";
import { useAuth } from "../../context/AuthContext";

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
  const [categoryIds, setCategoryIds] = 
  useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [customPrice, setCustomPrice] = useState(false);
  const priceOptions = [0, 5, 10, 15, 20];

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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUploadProgress(0); // Reset progress when a new file is selected
    }
  };

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('lessonDraft');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setLessonData(parsed.lessonData);
      setCategoryIds(parsed.categoryIds);
      if (parsed.thumbnailPreview) {
        setThumbnailPreview(parsed.thumbnailPreview);
      }
      // Note: We can't restore File objects from localStorage
    }
  }, []);

  // Save form data on changes
  useEffect(() => {
    const draftData = {
      lessonData,
      categoryIds,
      thumbnailPreview
    };
    localStorage.setItem('lessonDraft', JSON.stringify(draftData));
  }, [lessonData, categoryIds, thumbnailPreview]);

  // Clear saved data after successful submission
  const clearSavedDraft = () => {
    localStorage.removeItem('lessonDraft');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    setVideoUploadProgress(0);
    setIsUploading(true);
    setUploadStatus('Preparing video upload...');

    // Validate form data
    if (!lessonData.title.trim() || !lessonData.description.trim() || lessonData.cost === "" || !lessonData.content.trim() || !videoFile) {
      const missingFields = [];
      if (!lessonData.title.trim()) missingFields.push('title');
      if (!lessonData.description.trim()) missingFields.push('description');
      if (lessonData.cost === "") missingFields.push('cost');
      if (!lessonData.content.trim()) missingFields.push('content');
      if (!videoFile) missingFields.push('video');

      const errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      console.error('Form validation failed:', errorMessage);
      setError(errorMessage);
      setIsSubmitting(false);
      return;
    }

    if (parseFloat(lessonData.cost) < 0) {
      setError("Price cannot be negative");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Initialize video-related variables
      let vimeo_video_id = null;
      let vimeo_url = null;

      // Handle video upload if there's a video file
      if (videoFile) {
        setIsUploading(true);
        setUploadStatus('Preparing video upload...');
        
        const initFormData = new FormData();
        initFormData.append('title', lessonData.title);
        initFormData.append('description', lessonData.description);
        initFormData.append('fileSize', videoFile.size.toString());
        initFormData.append('fileName', videoFile.name);

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
          vimeo_url: newVimeoUrl,
          chunk_size, 
          access_token 
        } = await initResponse.json();

        vimeo_video_id = newVimeoId;
        vimeo_url = newVimeoUrl;

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
        }

        setUploadStatus('Upload complete! Processing...');
      }

      // Get Stripe IDs if needed
      let stripe_product_id = null;
      let stripe_price_id = null;

      if (parseFloat(lessonData.cost) > 0) {
        const response = await fetch(`${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/create-lesson`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: lessonData.title,
            description: lessonData.description,
            price: parseFloat(lessonData.cost),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create Stripe product');
        }

        const { stripe_product_id: productId, stripe_price_id: priceId } = await response.json();
        stripe_product_id = productId;
        stripe_price_id = priceId;
      }

      // Handle thumbnail upload
      let thumbnailUrl = null;
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

      // Create the lesson directly in Supabase
      const { data, error } = await supabase
        .from("tutorials")
        .insert({
          title: lessonData.title,
          description: lessonData.description,
          price: parseFloat(lessonData.cost),
          content: lessonData.content,
          creator_id: session.user.id,
          thumbnail_url: thumbnailUrl,
          vimeo_video_id,
          vimeo_url,
          stripe_product_id,
          stripe_price_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Handle category assignments
      if (categoryIds.length > 0) {
        const categoryInserts = categoryIds.map((categoryId) => ({
          tutorial_id: data.id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("tutorial_categories")
          .insert(categoryInserts);

        if (categoryError) throw categoryError;
      }

      setSuccess("Lesson created successfully!");
      clearSavedDraft(); // Clear the draft after successful submission
      setTimeout(() => navigate("/marketplace"), 2000);
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred.";
      console.error("Error creating lesson:", {
        error: err,
        message: errorMessage,
        stack: err.stack,
        state: {
          lessonData,
          videoFile: videoFile ? {
            name: videoFile.name,
            size: videoFile.size,
            type: videoFile.type
          } : null,
          isUploading,
          videoUploadProgress,
          uploadStatus
        }
      });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Friendlier Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Lesson
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Note: Lesson drafts will not be saved and refreshing will clear your progress!
            </p>
          </div>

          {/* Main Form - More compact and friendly */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6" role="form">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
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
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
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

              {/* Price Section - Simplified */}
              <div className="pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Set your price
                  </label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      Suggested pricing: $1 for every 2 minutes of video content
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex gap-3">
                  <select
                    id="cost"
                    name="cost"
                    className="block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={customPrice ? "custom" : lessonData.cost.toString()}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setCustomPrice(true);
                        setLessonData(prev => ({ ...prev, cost: "" }));
                      } else {
                        setCustomPrice(false);
                        setLessonData(prev => ({ ...prev, cost: e.target.value }));
                      }
                    }}
                    required
                  >
                    {priceOptions.map((price) => (
                      <option key={price} value={price.toString()}>
                        ${price}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                  {customPrice && (
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={lessonData.cost}
                        onChange={(e) => handleInputChange({
                          target: { name: "cost", value: e.target.value }
                        })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Media Section - Mobile-friendly upload */}
              <div className="pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Upload your video
                  </label>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      Videos should be:
                      <ul className="list-disc ml-4 mt-1">
                        <li>Maximum 25 minutes long</li>
                        <li>1080p quality</li>
                        <li>Landscape mode (horizontal)</li>
                      </ul>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-4">
                  <div className="text-center">
                    <label
                      htmlFor="video"
                      className="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
                    >
                      <span>Choose a video</span>
                      <input
                        id="video"
                        name="video"
                        type="file"
                        accept="video/*"
                        capture={false} // Remove capture attribute to allow both camera and library
                        className="sr-only"
                        onChange={handleVideoChange}
                        required
                      />
                    </label>
                    {!videoFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        Select from your photo library or record a new video
                      </p>
                    )}
                    {videoFile && (
                      <div className="mt-2 text-xs text-gray-500">
                        {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="border-t border-gray-900/10 pt-8">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Lesson Content</h3>
                  <div className="relative group">
                    <div className="cursor-help text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <p className="mb-2">TeachNiche doesn't auto-save content. We recommend:</p>
                      <ul className="list-disc ml-4">
                        <li>Writing your content in a separate document first</li>
                        <li>Using Markdown formatting for better presentation (you can ask ChatGPT to help)</li>
                        <li>Copying and pasting your final text here</li>
                      </ul>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Supports Markdown</span>
                    <a 
                      href="https://www.markdownguide.org/basic-syntax/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                    >
                      View formatting guide
                    </a>
                  </div>
                </div>
                <div className="mt-4">
                  <TextEditor
                    value={lessonData.content}
                    onChange={(content) => setLessonData((prev) => ({ ...prev, content }))}
                    options={{
                      hideIcons: ['side-by-side', 'fullscreen'],
                      status: false, // Hides the status bar
                      spellChecker: true,
                      minHeight: "200px",
                      maxHeight: "400px"
                    }}
                  />
                </div>
              </div>

              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="border-t border-gray-900/10 pt-8">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">Categories</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {categories.map((category) => (
                      <div key={category.id} className="relative flex items-start">
                        <div className="flex h-6 items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            value={category.id}
                            onChange={handleCategoryChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                          <label htmlFor={`category-${category.id}`} className="text-gray-900">
                            {category.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button - More friendly */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating your lesson..." : "Share your lesson"}
              </button>
            </form>
          </div>

          <AlertMessage error={error} success={success} />
        </div>
      </main>
      <Footer />

      {/* Upload Progress Overlay - More compact */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-md p-4 max-w-xs">
          <div className="text-sm">
            <p className="font-medium">Uploading...</p>
            <p className="text-gray-500 text-xs mt-1">{uploadStatus}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${videoUploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLesson;
