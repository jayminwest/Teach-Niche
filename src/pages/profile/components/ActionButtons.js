import React from 'react';

export default function ActionButtons({ onCreateLesson, onDeleteProfile }) {
  return (
    <div className="flex justify-between">
      <button
        className="btn btn-error"
        onClick={onDeleteProfile}
      >
        Delete Profile
      </button>
      <button
        className="btn btn-secondary"
        onClick={onCreateLesson}
      >
        Create Lesson
      </button>
    </div>
  );
}
