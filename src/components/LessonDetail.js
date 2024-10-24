// src/components/LessonDetail.js
import React, { useEffect, useState } from "react";
import Player from "@vimeo/player";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

const LessonDetail = ({ lesson, creator, hasAccess, lessonId }) => {
  const { user } = useAuth();
  const [vimeoPlayer, setVimeoPlayer] = useState(null);

  useEffect(() => {
    if (hasAccess && lesson.vimeo_video_id) {
      const player = new Player("vimeo-player", {
        id: lesson.vimeo_video_id,
        width: 640,
      });
      setVimeoPlayer(player);
    }
  }, [hasAccess, lesson.vimeo_video_id]);

  const handleAccessLesson = async () => {
    if (!user) {
      // Redirect to sign-in page if the user is not logged in
      window.location.href = "/sign-in";
      return;
    }

    try {
      // Insert a new purchase record for the free lesson
      const { error } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: user.id,
            tutorial_id: lessonId,
            purchase_date: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Refresh the page to update the access status
      window.location.reload();
    } catch (error) {
      console.error("Error granting access to free lesson:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center mb-4">
        {creator && creator.avatar_url ? (
          <div className="w-12 h-12 mr-4 overflow-hidden rounded-full">
            <img
              src={creator.avatar_url}
              alt={`${creator.full_name}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
        )}
        <div>
          <p className="text-lg font-semibold">
            {creator ? creator.full_name : "Unknown Creator"}
          </p>
        </div>
      </div>
      <p className="mb-4">{lesson.description}</p>
      
      {!hasAccess && (
        <p className="mb-4 font-semibold">Price: Free</p>
      )}

      {hasAccess ? (
        <div className="lesson-content">
          <div id="vimeo-player" className="mb-6"></div>
          <div dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Purchase this lesson to access the content.</p>
          <button 
            className="btn btn-primary"
            onClick={handleAccessLesson}
          >
            {user ? "Access Free Lesson" : "Sign In to Access Free Lesson"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonDetail;
