import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

const Comment = ({ comment, onReply, onDelete, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuth();

  const handleReply = (e) => {
    e.preventDefault();
    onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
  };

  return (
    <div className={`ml-${depth * 4} mb-4`}>
      <div className="bg-base-200 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {comment.profiles.avatar_url
              ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.full_name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )
              : <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />}
            <span className="font-semibold">{comment.profiles.full_name}</span>
          </div>
          {user && user.id === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete comment"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
        <p>{comment.content}</p>
        {user && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-primary mt-2 hover:underline flex items-center"
          >
            <i className="bi bi-reply mr-1"></i> Reply
          </button>
        )}
      </div>
      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-2">
          <div className="bg-base-100 p-2 rounded-lg mb-2">
            <p className="text-sm text-gray-600">
              Replying to {comment.profiles.full_name}:
            </p>
            <p className="text-sm italic">{comment.content}</p>
          </div>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Write your reply..."
            rows="3"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!replyContent.trim()}
          >
            Post Reply
          </button>
        </form>
      )}
      {comment.replies &&
        comment.replies.map((reply) => (
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

const LessonDiscussion = ({ lessonId, isWelcomePage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading discussions...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Discussion</h3>

      {(user || isWelcomePage) && (
        <form onSubmit={(e) => handleSubmitPost(e)} className="mb-6">
          <textarea
            value={newPost}
            onChange={(e) =>
              setNewPost(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder={isWelcomePage
              ? "Share your thoughts (as guest)..."
              : "Share your thoughts..."}
            rows="3"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!newPost.trim()}
          >
            Post Comment
          </button>
        </form>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <Comment
            key={post.id}
            comment={post}
            onReply={(parentId, content) =>
              handleSubmitPost({
                preventDefault: () => {},
                target: { reply: { value: content } },
              }, parentId)}
            onDelete={handleDeletePost}
          />
        ))}
      </div>
    </div>
  );
};

export default LessonDiscussion;
