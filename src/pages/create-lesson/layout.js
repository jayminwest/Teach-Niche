// src/pages/create-lesson/layout.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";

/**
 * CreateLesson Component
 *
 * Renders the form for creating a new lesson.
 *
 * @returns {JSX.Element} The Create Lesson page.
 */
const CreateLesson = () => {
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    cost: "",
    youtubeLink: "",
    content: "",
  });
  const [categoryIds, setCategoryIds] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !lessonData.title || !lessonData.description || !lessonData.cost ||
      !lessonData.content
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth
        .getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("User not authenticated");
      }

      const functionsUrl = process.env.REACT_APP_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        throw new Error("Functions URL not set in environment variables.");
      }

      const response = await fetch(`${functionsUrl}/create-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          title: lessonData.title,
          description: lessonData.description,
          price: parseFloat(lessonData.cost),
          video_url: lessonData.youtubeLink || null,
          content: lessonData.content,
          category_ids: categoryIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Lesson created:", data.lesson);
        navigate("/marketplace");
      } else {
        throw new Error(data.error || "Failed to create lesson");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error creating lesson:", err);
    }
  };

  return (
    <div className="container mx-auto">
      <Header />
      <main className="flex flex-col justify-center items-center min-h-screen py-10">
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
                value={lessonData.title}
                onChange={(e) => handleInputChange(e)}
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
                value={lessonData.description}
                onChange={(e) => handleInputChange(e)}
                required
              >
              </textarea>
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
                value={lessonData.cost}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="youtubeLink">
                <span className="label-text">
                  Private YouTube Link (optional)
                </span>
              </label>
              <input
                type="url"
                id="youtubeLink"
                placeholder="YouTube Link (optional)"
                className="input input-bordered"
                value={lessonData.youtubeLink}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonContent">
                <span className="label-text">Content (required)</span>
              </label>
              <TextEditor
                value={lessonData.content}
                onChange={(content) =>
                  setLessonData((prev) => ({ ...prev, content }))}
              />
            </div>
            {categories.length > 0 && (
              <div className="form-control mb-4">
                <label className="label">Categories</label>
                <div className="flex flex-wrap">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="label cursor-pointer mr-4"
                    >
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
          <AlertMessage error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateLesson;
