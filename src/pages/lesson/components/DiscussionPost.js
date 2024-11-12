import React from "react";

const DiscussionPost = ({ post, author }) => {
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="flex gap-4 p-4 border-b border-base-300 last:border-b-0">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-primary/10">
          {author?.avatar_url
            ? (
              <img
                src={author.avatar_url}
                alt={`${author.full_name}'s avatar`}
                className="w-full h-full object-cover"
              />
            )
            : (
              <div className="w-full h-full flex items-center justify-center text-primary font-medium">
                {author?.full_name?.charAt(0) || "?"}
              </div>
            )}
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
          <span className="font-medium text-base-content">
            {author?.full_name || "Anonymous"}
          </span>
          <span className="text-sm text-base-content/60">
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        <div className="prose max-w-none text-base-content/80 break-words">
          {post.content}
        </div>
      </div>
    </div>
  );
};

export default DiscussionPost;
