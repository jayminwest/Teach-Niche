import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

/**
 * Comment Component
 * 
 * Renders an individual comment with reply functionality.
 */
const Comment = ({ comment, onReply, onDelete, depth = 0, handleSubmitPost }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleReply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      console.error("Error posting reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`ml-${depth * 4} mb-4`}>
      <div className="bg-base-200 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {comment.profiles.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.full_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
                <span>{comment.profiles.full_name[0]}</span>
              </div>
            )}
            <span className="font-semibold">{comment.profiles.full_name}</span>
          </div>
          {user && user.id === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="btn btn-ghost btn-sm text-error"
              aria-label="Delete comment"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap">{comment.content}</p>
        {user && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="btn btn-ghost btn-sm mt-2"
          >
            <i className="bi bi-reply mr-1"></i> Reply
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-2 space-y-2">
          <div className="bg-base-100 p-2 rounded-lg">
            <p className="text-sm opacity-70">
              Replying to {comment.profiles.full_name}
            </p>
          </div>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder="Write your reply..."
            rows="3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!replyContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Posting...
                </>
              ) : (
                "Post Reply"
              )}
            </button>
          </div>
        </form>
      )}

      {comment.replies?.map((reply) => (
        <Comment
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

// Main component remains the same, just adding loading states
const LessonDiscussion = ({ lessonId, isWelcomePage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [lessonId]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("discussion_posts")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("tutorial_id", lessonId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each top-level post
      const postsWithReplies = await Promise.all(data.map(async (post) => {
        const { data: replies, error: repliesError } = await supabase
          .from("discussion_posts")
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq("parent_id", post.id)
          .order("created_at", { ascending: true });

        if (repliesError) throw repliesError;

        return { ...post, replies };
      }));

      setPosts(postsWithReplies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? e.target.reply.value : newPost;
    if (!content.trim()) return;

    if (!user && !isWelcomePage) {
      navigate("/sign-in");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("discussion_posts")
        .insert([
          {
            tutorial_id: lessonId,
            user_id: user?.id || null,
            content: content.trim(),
            parent_id: parentId,
          },
        ])
        .select();

      if (error) throw error;

      // Fetch the user's profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create a new post object with the profile data included
      const newPostWithProfile = {
        ...data[0],
        profiles: profileData,
      };

      if (parentId) {
        setPosts(
          posts.map((post) =>
            post.id === parentId
              ? {
                ...post,
                replies: [...(post.replies || []), newPostWithProfile],
              }
              : post
          ),
        );
      } else {
        setPosts([newPostWithProfile, ...posts]);
        setNewPost("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("discussion_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Remove the deleted post from the state
      setPosts(posts.filter((post) => {
        if (post.id === postId) return false;
        if (post.replies) {
          post.replies = post.replies.filter((reply) => reply.id !== postId);
        }
        return true;
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!content.trim()) return;

    try {
      const { data, error } = await supabase
        .from("discussion_posts")
        .insert([
          {
            tutorial_id: lessonId,
            user_id: user?.id,
            content: content.trim(),
            parent_id: parentId,
          },
        ])
        .select();

      if (error) throw error;

      // Fetch the user's profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create a new post object with the profile data included
      const newReplyWithProfile = {
        ...data[0],
        profiles: profileData,
      };

      // Update the posts state to include the new reply
      setPosts(posts.map(post => {
        if (post.id === parentId) {
          return {
            ...post,
            replies: [...(post.replies || []), newReplyWithProfile],
          };
        }
        return post;
      }));
    } catch (err) {
      console.error("Error posting reply:", err);
      setError(err.message);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Discussion</h3>

      {(user || isWelcomePage) && (
        <form onSubmit={(e) => handleSubmitPost(e)} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="textarea textarea-bordered w-full"
            placeholder={isWelcomePage
              ? "Share your thoughts (as guest)..."
              : "Share your thoughts..."}
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newPost.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : posts.length === 0 ? (
        <p className="text-center py-8 opacity-70">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Comment
              key={post.id}
              comment={post}
              onReply={handleReply}
              onDelete={handleDeletePost}
              depth={0}
              handleSubmitPost={handleSubmitPost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonDiscussion;
