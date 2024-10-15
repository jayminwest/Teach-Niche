// src/pages/profile/layout.js
import React, { useState, useEffect } from "react";
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

export default function Profile() {
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    fetchUserProfile();
    checkStripeConnectionStatus();
  }, [navigate]);

  const fetchUserProfile = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, bio, avatar_url, social_media_tag, stripe_account_id, stripe_onboarding_complete")
        .eq("id", user.id)
        .single();

      if (data) {
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
      }

      if (error) {
        console.error("Error fetching user profile:", error.message);
        setError(error.message);
      }

      await fetchCreatedLessons(user.id);
      await fetchPurchasedLessons(user.id);
    } else {
      navigate("/sign-in");
    }
    setLoading(false);
  };

  const checkStripeConnectionStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeConnected = urlParams.get('stripe_connected');
    if (stripeConnected === 'true') {
      setStripeConnected(true);
      setSuccessMessage("Stripe account connected successfully!");
      // Remove the query parameter from the URL
      window.history.replaceState({}, document.title, "/profile");
    }
  };

  const fetchCreatedLessons = async (userId) => {
    const { data, error } = await supabase
      .from("tutorials")
      .select("id, title, description, price, content_url, created_at")
      .eq("creator_id", userId);

    if (error) {
      console.error("Error fetching created lessons:", error.message);
    } else {
      setCreatedLessons(data);
    }
  };

  const fetchPurchasedLessons = async (userId) => {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        tutorial_id,
        purchase_date,
        tutorials (id, title, description, price, content_url, created_at)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching purchased lessons:", error.message);
    } else {
      setPurchasedLessons(data.map(purchase => ({
        ...purchase.tutorials,
        purchaseDate: purchase.purchase_date
      })));
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    setError(null);
    setSuccessMessage("");

    if (!user) {
      setError("User not authenticated.");
      return;
    }

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
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/sign-in");
    } catch (error) {
      console.error("Error deleting profile:", error.message);
      setError(error.message);
    }
  };

  const initiateStripeConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect', {
        body: JSON.stringify({ userId: user.id }),
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to initiate Stripe Connect");
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Unexpected response:", data);
        throw new Error("Failed to initiate Stripe Connect: No URL returned");
      }
    } catch (err) {
      console.error("Error initiating Stripe Connect:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleCreateLesson = () => {
    if (stripeConnected) { // Ensure Stripe is connected
      setActiveTab('create-lesson'); // Update activeTab to 'create-lesson'
    } else {
      setError("Please connect your Stripe account before creating lessons.");
    }
  };

  const proceedToCreateLesson = () => {
    navigate("/create-lesson");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
          <div className="card-body">
            <div className="tabs tabs-boxed mb-6">
              <a 
                className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </a>
              <a 
                className={`tab ${activeTab === 'created' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('created')}
              >
                Created Lessons
              </a>
              <a 
                className={`tab ${activeTab === 'purchased' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('purchased')}
              >
                Purchased Lessons
              </a>
              {!profileData.stripe_onboarding_complete && (
                <a 
                  className={`tab ${activeTab === 'connect-stripe' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('connect-stripe')}
                >
                  Connect Stripe
                </a>
              )}
              {stripeConnected && (
                <a 
                  className={`tab ${activeTab === 'create-lesson' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('create-lesson')}
                >
                  Create Lesson
                </a>
              )}
            </div>

            {activeTab === 'profile' && (
              <>
                <h2 className="card-title text-3xl mb-6">Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <ProfilePicture
                      profilePicture={profileData.profilePicture}
                      onUpdate={(url) => handleProfileUpdate({ ...profileData, profilePicture: url })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ProfileForm
                      profileData={profileData}
                      onUpdate={handleProfileUpdate}
                    />
                  </div>
                </div>
                <div className="divider my-6"></div>
                <ActionButtons
                  onCreateLesson={handleCreateLesson}
                  onDeleteProfile={handleDeleteProfile}
                />
              </>
            )}

            {activeTab === 'create-lesson' && (
              <LessonCreationGuide />
            )}

            {activeTab === 'connect-stripe' && (
              <>
                {stripeConnected ? (
                  <div>
                    <p className="text-green-500 mb-4">Your Stripe account is connected.</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {/* Optionally, implement disconnect logic */}}
                    >
                      Disconnect Stripe
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="card-title text-3xl mb-6">Connect Stripe Account</h2>
                    <p className="mb-4">To receive payments from lesson sales, please connect your Stripe account.</p>
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

            {activeTab === 'created' && (
              <>
                <h2 className="card-title text-2xl mb-4">Created Lessons</h2>
                {createdLessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {createdLessons.map(lesson => (
                      <LessonCard 
                        key={lesson.id} 
                        {...lesson} 
                        creator_id={user.id}
                        isCreated={true}
                        isPurchased={false}
                      />
                    ))}
                  </div>
                ) : (
                  <p>You haven't created any lessons yet.</p>
                )}
              </>
            )}

            {activeTab === 'purchased' && (
              <>
                <h2 className="card-title text-2xl mb-4">Purchased Lessons</h2>
                {purchasedLessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedLessons.map(lesson => (
                      <LessonCard 
                        key={lesson.id} 
                        {...lesson} 
                        isPurchased={true}
                        purchaseDate={lesson.purchaseDate}
                      />
                    ))}
                  </div>
                ) : (
                  <p>You haven't purchased any lessons yet.</p>
                )}
              </>
            )}

            <AlertMessage error={error} success={successMessage} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}