import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TextEditor from "../../components/TextEditor";
import supabase from "../../utils/supabaseClient";
import AlertMessage from "../../components/AlertMessage";

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
    youtubeLink: "",
    content: "",
  });
  const [categoryIds, setCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        title: data.title,
        description: data.description,
        cost: data.price,
        youtubeLink: data.video_url || "",
        content: data.content,
      });

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
      const { data, error } = await supabase
        .from("tutorials")
        .update({
          title: lessonData.title,
          description: lessonData.description,
          price: parseFloat(lessonData.cost),
          video_url: lessonData.youtubeLink || null,
          content: lessonData.content,
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

      navigate("/profile");
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Error updating lesson:", err);
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
    <div className="container mx-auto">
      <Header />
      <main className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
          <h2 className="card-title text-3xl mb-4">Edit Lesson</h2>
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
            {/* ... (input fields for title, description, cost, youtubeLink) ... */}
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
          <AlertMessage error={error} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditLesson;
