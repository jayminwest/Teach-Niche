// src/pages/profile/layout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";
import ProfilePicture from "./components/ProfilePicture";
import ProfileForm from "./components/ProfileForm";
import ActionButtons from "./components/ActionButtons";
import AlertMessage from "../../components/AlertMessage";
import LessonCard from "../marketplace/components/LessonCard";
import LessonCreationGuide from "./components/LessonCreationGuide";
import { useAuth } from "../../context/AuthContext";

/**
 * Profile Component
 *
 * Renders the user profile page with various sections for profile management,
 * lesson creation, and viewing created/purchased lessons.
 *
 * @returns {JSX.Element} The Profile page.
 */
const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    bio: "",
    profilePicture: null,
    socialMediaTag: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdLessons, setCreatedLessons] = useState([]);
  const [purchasedLessons, setPurchasedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [stripeConnected, setStripeConnected] = useState(false);
  const { user } = useAuth();
  const [deletingLesson, setDeletingLesson] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      checkStripeConnectionStatus();
    } else {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, bio, avatar_url, social_media_tag, stripe_account_id, stripe_onboarding_complete",
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfileData({
        fullName: data.full_name || "",
        email: data.email || "",
        bio: data.bio || "",
        profilePicture: data.avatar_url || "",
        socialMediaTag: data.social_media_tag || "",
        stripe_account_id: data.stripe_account_id,
        stripe_onboarding_complete: data.stripe_onboarding_complete,
      });
      setStripeConnected(data.stripe_onboarding_complete);

      await Promise.all([
        fetchCreatedLessons(user.id),
        fetchPurchasedLessons(user.id),
      ]);
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStripeConnectionStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeConnected = urlParams.get("stripe_connected");
    if (stripeConnected === "true") {
      setStripeConnected(true);
      setSuccessMessage("Stripe account connected successfully!");
      window.history.replaceState({}, document.title, "/profile");
    }
  };

  const fetchCreatedLessons = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("tutorials")
        .select(
          "id, title, description, price, content_url, created_at, thumbnail_url",
        )
        .eq("creator_id", userId);

      if (error) throw error;
      setCreatedLessons(data);
    } catch (error) {
      console.error("Error fetching created lessons:", error.message);
    }
  };

  const fetchPurchasedLessons = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          tutorial_id,
          purchase_date,
          tutorials (id, title, description, price, content_url, created_at, thumbnail_url, creator_id)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      setPurchasedLessons(data.map((purchase) => ({
        ...purchase.tutorials,
        purchaseDate: purchase.purchase_date,
      })));
    } catch (error) {
      console.error("Error fetching purchased lessons:", error.message);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    setError(null);
    setSuccessMessage("");

    try {
      const updates = {
        id: user.id,
        full_name: updatedData.fullName,
        email: updatedData.email,
        bio: updatedData.bio,
        avatar_url: updatedData.profilePicture,
        social_media_tag: updatedData.socialMediaTag,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      setSuccessMessage("Profile updated successfully!");
      setProfileData(updatedData);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This will permanently delete all your tutorials, purchases, and reviews. This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      // First get all tutorials by the user
      const { data: userTutorials, error: tutorialsQueryError } = await supabase
        .from("tutorials")
        .select("id")
        .eq("creator_id", user.id);

      if (tutorialsQueryError) throw tutorialsQueryError;

      const tutorialIds = userTutorials?.map((t) => t.id) || [];

      // Delete reviews (both user's reviews and reviews on their tutorials)
      const { error: reviewsError } = await supabase
        .from("reviews")
        .delete()
        .or(`user_id.eq.${user.id},tutorial_id.in.(${tutorialIds.join(",")})`);

      if (reviewsError) throw reviewsError;

      // Delete purchases (both user's purchases and purchases of their tutorials)
      const { error: purchasesError } = await supabase
        .from("purchases")
        .delete()
        .or(`user_id.eq.${user.id},tutorial_id.in.(${tutorialIds.join(",")})`);

      if (purchasesError) throw purchasesError;

      if (tutorialIds.length > 0) {
        // Delete tutorial categories
        const { error: categoriesError } = await supabase
          .from("tutorial_categories")
          .delete()
          .in("tutorial_id", tutorialIds);

        if (categoriesError) throw categoriesError;

        // Delete tutorials
        const { error: tutorialsError } = await supabase
          .from("tutorials")
          .delete()
          .eq("creator_id", user.id);

        if (tutorialsError) throw tutorialsError;
      }

      // Finally delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/sign-in");
    } catch (error) {
      console.error("Error deleting profile:", error.message);
      setError(error.message);
    }
  };

  const initiateStripeConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-connect",
        {
          body: JSON.stringify({ userId: user.id }),
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to initiate Stripe Connect");
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to initiate Stripe Connect: No URL returned");
      }
    } catch (err) {
      console.error("Error initiating Stripe Connect:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleCreateLesson = () => {
    if (stripeConnected) {
      setActiveTab("create-lesson");
    } else {
      setError("Please connect your Stripe account before creating lessons.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    setDeletingLesson(lessonId);
  };

  const confirmDeleteLesson = async () => {
    if (!deletingLesson) return;

    try {
      // Delete the lesson from the tutorials table
      const { error: deleteError } = await supabase
        .from("tutorials")
        .delete()
        .eq("id", deletingLesson);

      if (deleteError) throw deleteError;

      // Remove the lesson from the createdLessons state
      setCreatedLessons(
        createdLessons.filter((lesson) => lesson.id !== deletingLesson),
      );
      setSuccessMessage("Lesson deleted successfully!");
    } catch (error) {
      console.error("Error deleting lesson:", error.message);
      setError("Failed to delete lesson. Please try again.");
    } finally {
      setDeletingLesson(null);
    }
  };

  const cancelDeleteLesson = () => {
    setDeletingLesson(null);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-5xl mx-auto">
          <div className="card-body p-8">
            <AlertMessage error={error} success={successMessage} />

            <div className="tabs tabs-boxed mb-6">
              <a
                className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </a>
              <a
                className={`tab ${activeTab === "created" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("created")}
              >
                Created Lessons
              </a>
              <a
                className={`tab ${
                  activeTab === "purchased" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("purchased")}
              >
                Purchased Lessons
              </a>
              {!profileData.stripe_onboarding_complete && (
                <a
                  className={`tab ${
                    activeTab === "connect-stripe" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("connect-stripe")}
                >
                  Connect Stripe
                </a>
              )}
              {stripeConnected && (
                <a
                  className={`tab ${
                    activeTab === "create-lesson" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("create-lesson")}
                >
                  Create Lesson
                </a>
              )}
            </div>

            {activeTab === "profile" && (
              <>
                <h2 className="card-title text-3xl mb-6">Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <ProfilePicture
                      profilePicture={profileData.profilePicture}
                      onUpdate={(url) =>
                        handleProfileUpdate({
                          ...profileData,
                          profilePicture: url,
                        })}
                    />
                    {!profileData.stripe_onboarding_complete && (
                      <div className="alert alert-warning mt-6 p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="stroke-current shrink-0 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span>Connect Stripe to sell lessons.</span>
                        <button
                          className="btn btn-sm"
                          onClick={() => setActiveTab("connect-stripe")}
                        >
                          Connect
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <ProfileForm
                      profileData={profileData}
                      onUpdate={handleProfileUpdate}
                    />
                    <div className="mt-8">
                      <ActionButtons
                        onCreateLesson={handleCreateLesson}
                        onDeleteProfile={handleDeleteProfile}
                        onLogout={handleLogout}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "create-lesson" && <LessonCreationGuide />}

            {activeTab === "connect-stripe" && (
              <>
                {stripeConnected
                  ? (
                    <div>
                      <p className="text-green-500 mb-4">
                        Your Stripe account is connected.
                      </p>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          /* Optionally, implement disconnect logic */
                        }}
                      >
                        Disconnect Stripe
                      </button>
                    </div>
                  )
                  : (
                    <>
                      <h2 className="card-title text-3xl mb-6">
                        Connect Stripe Account
                      </h2>
                      <p className="mb-4">
                        To receive payments from lesson sales, please connect
                        your Stripe account.
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={initiateStripeConnect}
                      >
                        Connect Stripe
                      </button>
                    </>
                  )}
              </>
            )}

            {activeTab === "created" && (
              <>
                <h2 className="card-title text-2xl mb-4">Created Lessons</h2>
                {createdLessons.length > 0
                  ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {createdLessons.map((lesson) => (
                        <div key={lesson.id} className="relative">
                          <LessonCard
                            {...lesson}
                            creator_id={user.id}
                            isCreated={true}
                            isPurchased={false}
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                navigate(`/edit-lesson/${lesson.id}`)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() =>
                                handleDeleteLesson(lesson.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : <p>You haven't created any lessons yet.</p>}
              </>
            )}

            {activeTab === "purchased" && (
              <>
                <h2 className="card-title text-2xl mb-4">Purchased Lessons</h2>
                {purchasedLessons.length > 0
                  ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchasedLessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          {...lesson}
                          isPurchased={true}
                          purchaseDate={lesson.purchaseDate}
                        />
                      ))}
                    </div>
                  )
                  : <p>You haven't purchased any lessons yet.</p>}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Confirmation Modal */}
      {deletingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="btn btn-ghost"
                onClick={() => setDeletingLesson(null)}
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteLesson}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
