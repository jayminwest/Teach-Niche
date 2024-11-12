import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";
import DiscussionPost from "../pages/lesson/components/DiscussionPost";

const LessonDiscussion = ({ lessonId }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [lessonId]);

  const fetchPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from("discussion_posts")
        .select("*")
        .eq("tutorial_id", lessonId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch all unique user IDs from posts
      const userIds = [...new Set(posts.map((post) => post.user_id))];

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Create a map of user IDs to user data
      const authorsMap = users.reduce((acc, user) => ({
        ...acc,
        [user.id]: user,
      }), {});

      setPosts(posts);
      setAuthors(authorsMap);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("discussion_posts")
        .insert({
          tutorial_id: lessonId,
          user_id: user.id,
          content: newPost.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new post to the list
      setPosts((prev) => [data, ...prev]);
      setNewPost("");

      // Make sure we have the author data
      if (!authors[user.id]) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        setAuthors((prev) => ({
          ...prev,
          [user.id]: userData,
        }));
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">Loading discussions...</div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="p-4 border-b border-base-300">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full min-h-[100px] p-3 rounded border border-base-300 focus:border-primary focus:ring-1 focus:ring-primary"
          disabled={submitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!newPost.trim() || submitting}
            className="btn btn-primary"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      <div className="divide-y divide-base-300">
        {posts.length === 0
          ? (
            <div className="p-8 text-center text-base-content/60">
              No discussions yet. Be the first to start the conversation!
            </div>
          )
          : (
            posts.map((post) => (
              <DiscussionPost
                key={post.id}
                post={post}
                author={authors[post.user_id]}
              />
            ))
          )}
      </div>
    </div>
  );
};

export default LessonDiscussion;
