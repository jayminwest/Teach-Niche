// src/pages/create-lesson/layout.js

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";

export default function CreateLesson() {
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonCost, setLessonCost] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [lessonContent, setLessonContent] = useState(""); // New state for lesson content
  const [categoryIds, setCategoryIds] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch Categories for Selection (Optional)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setCategoryIds([...categoryIds, parseInt(value)]);
    } else {
      setCategoryIds(categoryIds.filter((id) => id !== parseInt(value)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Retrieve the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
      console.error("User not authenticated");
      navigate("/sign-in");
      return;
    }

    try {
      const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;
      console.log("Function URL:", `${functionsUrl}/create-lesson`); // For debugging

      const response = await fetch(`${functionsUrl}/create-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: lessonTitle,
          description: lessonDescription,
          price: lessonCost,
          content_url: youtubeLink,
          content: lessonContent, // Include the lesson content from Quill
          category_ids: categoryIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Lesson created:", data.lesson);
        navigate("/marketplace");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Error creating lesson:", err);
    }
  };

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
          <h2 className="card-title text-3xl mb-4">Create New Lesson</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonTitle">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                id="lessonTitle"
                placeholder="Title"
                className="input input-bordered"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonDescription">
                <span className="label-text">Description</span>
              </label>
              <textarea
                id="lessonDescription"
                placeholder="Description"
                className="textarea textarea-bordered"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonContent">
                <span className="label-text">Content</span>
              </label>
              <TextEditor value={lessonContent} onChange={setLessonContent} /> {/* Integrate TextEditor */}
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonCost">
                <span className="label-text">Cost (USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="lessonCost"
                placeholder="Cost"
                className="input input-bordered"
                value={lessonCost}
                onChange={(e) => setLessonCost(e.target.value)}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="youtubeLink">
                <span className="label-text">Private YouTube Link</span>
              </label>
              <input
                type="url"
                id="youtubeLink"
                placeholder="YouTube Link"
                className="input input-bordered"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                required
              />
            </div>
            {/* Optional: Category Selection */}
            {categories.length > 0 && (
              <div className="form-control mb-4">
                <label className="label">Categories</label>
                <div className="flex flex-wrap">
                  {categories.map((category) => (
                    <label key={category.id} className="label cursor-pointer mr-4">
                      <input
                        type="checkbox"
                        value={category.id}
                        className="checkbox"
                        onChange={handleCategoryChange}
                      />
                      <span className="label-text ml-2">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Create Lesson
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
