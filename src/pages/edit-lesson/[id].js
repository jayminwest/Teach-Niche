import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import supabase from "../../utils/supabaseClient";

export default function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonCost, setLessonCost] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
    fetchCategories();
  }, [id]);

  const fetchLessonData = async () => {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lesson:", error.message);
      setError("Failed to load lesson data.");
    } else if (data) {
      setLessonTitle(data.title);
      setLessonDescription(data.description);
      setLessonCost(data.price);
      setYoutubeLink(data.video_url || "");
      setLessonContent(data.content);

      // Fetch category IDs for this lesson
      const { data: categoryData, error: categoryError } = await supabase
        .from("tutorial_categories")
        .select("category_id")
        .eq("tutorial_id", id);

      if (!categoryError) {
        setCategoryIds(categoryData.map(item => item.category_id));
      }
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
    } else {
      setCategories(data);
    }
  };

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

    if (!lessonTitle || !lessonDescription || !lessonCost || !lessonContent) {
      setError("Please fill in all required fields.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (sessionError || !session) {
      console.error("User not authenticated");
      navigate("/sign-in");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tutorials")
        .update({
          title: lessonTitle,
          description: lessonDescription,
          price: parseFloat(lessonCost), // Ensure price is sent as a number
          video_url: youtubeLink || null,
          content: lessonContent,
        })
        .eq("id", id);

      if (error) throw error;

      // Update categories
      await supabase
        .from("tutorial_categories")
        .delete()
        .eq("tutorial_id", id);

      if (categoryIds.length > 0) {
        const categoryInserts = categoryIds.map(categoryId => ({
          tutorial_id: id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from("tutorial_categories")
          .insert(categoryInserts);

        if (categoryError) throw categoryError;
      }

      console.log("Lesson updated successfully");
      navigate("/profile");
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Error updating lesson:", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
          <h2 className="card-title text-3xl mb-4">Edit Lesson</h2>
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
                <span className="label-text">Content (required)</span>
              </label>
              <TextEditor 
                value={lessonContent} 
                onChange={setLessonContent} 
                required={true}
              />
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
                <span className="label-text">Private YouTube Link (optional)</span>
              </label>
              <input
                type="url"
                id="youtubeLink"
                placeholder="YouTube Link (optional)"
                className="input input-bordered"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />
            </div>
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
                        checked={categoryIds.includes(category.id)}
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
                Update Lesson
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
