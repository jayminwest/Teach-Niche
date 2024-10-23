import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabaseClient";

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
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      <div className="mb-6">
        <p className="text-xl">
          Average Rating:{" "}
          {averageRating ? `${averageRating.toFixed(1)} / 5` : "No ratings yet"}
        </p>
        <p className="text-sm text-gray-600">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      {(user || isWelcomePage) && !userReview && (
        <form onSubmit={handleSubmitReview} className="mb-8">
          <div className="mb-4">
            <label className="block mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Share your experience..."
            rows="3"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!rating}
          >
            Submit Review
          </button>
        </form>
      )}

      {userReview && (
        <div className="mb-8">
          <h4 className="text-xl font-semibold mb-2">Your Review</h4>
          <div className="bg-base-200 p-4 rounded-lg">
            <div className="text-yellow-400 mb-2">
              {"★".repeat(userReview.rating)}
              {"☆".repeat(5 - userReview.rating)}
            </div>
            <p>{userReview.comment}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setRating(userReview.rating);
                  setComment(userReview.comment);
                  setUserReview(null);
                }}
                className="btn btn-sm btn-primary"
              >
                Edit Review
              </button>
              <button
                onClick={handleDeleteReview}
                className="btn btn-sm btn-error"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {reviews.filter((review) => review.user_id !== user?.id).map((
          review,
        ) => (
          <div key={review.id} className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {review.profiles?.avatar_url
                ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt={review.profiles.full_name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )
                : <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />}
              <span className="font-semibold">
                {review.profiles?.full_name || "Anonymous"}
              </span>
            </div>
            <div className="text-yellow-400 mb-2">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            {review.comment && <p>{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonRating;
