// src/components/LessonDetail.js
import React, { useEffect, useState } from "react";
import Player from "@vimeo/player";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

/**
 * LessonDetail Component
 *
 * Displays the details of a lesson including video content and description.
 *
 * @param {Object} props
 * @param {Object} props.lesson - The lesson data
 * @param {Object} props.creator - The creator's data
 * @param {boolean} props.hasAccess - Whether the user has access to the lesson
 * @param {string} props.lessonId - The ID of the lesson
 * @returns {JSX.Element} The lesson detail component
 */
const LessonDetail = ({ lesson, creator, hasAccess, lessonId }) => {
  const { user } = useAuth();
  const [vimeoPlayer, setVimeoPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasAccess && lesson.vimeo_video_id) {
      const player = new Player("vimeo-player", {
        id: lesson.vimeo_video_id,
        width: 640,
        responsive: true,
      });
      setVimeoPlayer(player);
    }
  }, [hasAccess, lesson.vimeo_video_id]);

  const handleAccessLesson = async () => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    setIsLoading(true);
    try {
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
      window.location.reload();
    } catch (error) {
      console.error("Error granting access to free lesson:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Creator Info */}
        <div className="flex items-center mb-6">
          {creator?.avatar_url ? (
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img
                src={creator.avatar_url}
                alt={`${creator.full_name}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-base-300 mr-4 flex items-center justify-center">
              <span className="text-xl">{creator?.full_name?.[0] || '?'}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">
              {creator?.full_name || "Unknown Creator"}
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-6">
          <p>{lesson.description}</p>
        </div>

        {/* Content */}
        {hasAccess ? (
          <div className="lesson-content space-y-6">
            <div id="vimeo-player" className="aspect-video w-full rounded-lg overflow-hidden"></div>
            <div className="prose max-w-none">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Purchase this lesson to access the content.</p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAccessLesson}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Processing...
                </>
              ) : (
                user ? "Access Free Lesson" : "Sign In to Access Free Lesson"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
