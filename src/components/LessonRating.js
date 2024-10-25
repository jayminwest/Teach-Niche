import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

/**
 * StarRating Component
 * 
 * Renders an interactive or static star rating display.
 */
const StarRating = ({ rating, onRatingChange, interactive = true }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange(star)}
          className={`text-2xl transition-colors ${
            interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'
          } ${star <= rating ? 'text-yellow-400' : 'text-base-300'}`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// Main component remains the same, just improving UI elements
const LessonRating = ({ lessonId, isWelcomePage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [lessonId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("tutorial_id", lessonId);

      if (reviewsError) throw reviewsError;

      // Fetch profiles for each review
      const reviewsWithProfiles = await Promise.all(
        reviewsData.map(async (review) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", review.user_id)
            .single();

          if (profileError) throw profileError;

          return { ...review, profiles: profileData };
        }),
      );

      setReviews(reviewsWithProfiles);

      // Calculate average rating
      const avg = reviewsWithProfiles.reduce((acc, review) =>
        acc + review.rating, 0) / reviewsWithProfiles.length;
      setAverageRating(Math.round(avg * 10) / 10);

      // Find user's review if exists
      if (user) {
        const userRev = reviewsWithProfiles.find((review) =>
          review.user_id === user.id
        );
        if (userRev) {
          setUserReview(userRev);
          setRating(userRev.rating);
          setComment(userRev.comment || "");
        } else {
          setUserReview(null);
          setRating(0);
          setComment("");
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user && !isWelcomePage) {
      navigate("/sign-in");
      return;
    }

    try {
      const reviewData = {
        tutorial_id: lessonId,
        user_id: user?.id,
        rating,
        comment: comment.trim(),
      };

      let data;
      let error;

      if (userReview) {
        // Update existing review
        ({ data, error } = await supabase
          .from("reviews")
          .update(reviewData)
          .eq("id", userReview.id)
          .select());
      } else {
        // Insert new review
        ({ data, error } = await supabase
          .from("reviews")
          .insert([reviewData])
          .select());
      }

      if (error) throw error;

      // Fetch the user's profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create a new review object with the profile data included
      const newReviewWithProfile = {
        ...data[0],
        profiles: profileData,
      };

      if (userReview) {
        setReviews(
          reviews.map((review) =>
            review.id === userReview.id ? newReviewWithProfile : review
          ),
        );
      } else {
        setReviews([newReviewWithProfile, ...reviews]);
      }

      setUserReview(newReviewWithProfile);
      fetchReviews(); // Refetch to update average rating
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !userReview) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", userReview.id);

      if (error) throw error;

      setReviews(reviews.filter((review) => review.id !== userReview.id));
      setUserReview(null);
      setRating(0);
      setComment("");
      fetchReviews(); // Refetch to update average rating
    } catch (err) {
      console.error("Error deleting review:", err);
      setError(err.message);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Reviews</h3>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {averageRating ? averageRating.toFixed(1) : "0.0"}
            <span className="text-base font-normal text-base-content/70"> / 5.0</span>
          </div>
          <p className="text-sm text-base-content/70">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {(user || isWelcomePage) && !userReview && (
        <div className="card bg-base-200 p-6">
          <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block mb-2">Your Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div>
              <label className="block mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Share your experience..."
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!rating || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        </div>
      )}

      {userReview && (
        <div className="card bg-base-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-semibold">Your Review</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRating(userReview.rating);
                  setComment(userReview.comment);
                  setUserReview(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteReview}
                className="btn btn-ghost btn-sm text-error"
              >
                Delete
              </button>
            </div>
          </div>
          <StarRating rating={userReview.rating} interactive={false} />
          <p className="mt-4 whitespace-pre-wrap">{userReview.comment}</p>
        </div>
      )}

      <div className="divider">Other Reviews</div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : reviews.filter(review => review.user_id !== user?.id).length === 0 ? (
        <p className="text-center py-8 opacity-70">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter(review => review.user_id !== user?.id)
            .map((review) => (
              <div key={review.id} className="card bg-base-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {review.profiles?.avatar_url ? (
                    <img
                      src={review.profiles.avatar_url}
                      alt={review.profiles.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
                      <span>{review.profiles?.full_name?.[0] || '?'}</span>
                    </div>
                  )}
                  <span className="font-semibold">
                    {review.profiles?.full_name || "Anonymous"}
                  </span>
                </div>
                <StarRating rating={review.rating} interactive={false} />
                {review.comment && (
                  <p className="mt-2 whitespace-pre-wrap">{review.comment}</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default LessonRating;
