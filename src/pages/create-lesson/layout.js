// src/pages/create-lesson/layout.js
import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CreateLesson() {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonCost, setLessonCost] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated");
      navigate('/sign-in');
      return;
    }

    // Insert the lesson into the tutorials table using upsert to prevent duplicates
    const { data, error: insertError } = await supabase.from('tutorials').upsert([
      {
        title: lessonTitle,
        description: lessonDescription,
        price: parseFloat(lessonCost),
        content_url: youtubeLink,
        creator_id: user.id,
        updated_at: new Date(),
      },
    ]);

    if (insertError) {
      console.error("Error inserting lesson:", insertError.message);
      setError(insertError.message);
    } else {
      console.log("Lesson created:", data);
      navigate('/marketplace');
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
              <label className="label" htmlFor="lessonCost">
                <span className="label-text">Cost</span>
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
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">Create Lesson</button>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
