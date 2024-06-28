import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CreateLesson() {
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonCost, setLessonCost] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
          <h2 className="card-title text-3xl mb-4">Create New Lesson</h2>
          <form>
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
              ></textarea>
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="lessonCost">
                <span className="label-text">Cost</span>
              </label>
              <input
                type="text"
                id="lessonCost"
                placeholder="Cost"
                className="input input-bordered"
                value={lessonCost}
                onChange={(e) => setLessonCost(e.target.value)}
              />
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="youtubeLink">
                <span className="label-text">Private YouTube Link</span>
              </label>
              <input
                type="text"
                id="youtubeLink"
                placeholder="YouTube Link"
                className="input input-bordered"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Create Lesson</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
