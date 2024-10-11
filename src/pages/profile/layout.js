// src/pages/profile/layout.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // If you want to display email
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [socialMediaTag, setSocialMediaTag] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, bio, avatar_url, social_media_tag")
          .eq("id", user.id)
          .single();

        if (data) {
          setFullName(data.full_name || "");
          setEmail(data.email || "");
          setBio(data.bio || "");
          setProfilePicture(data.avatar_url || "");
          setSocialMediaTag(data.social_media_tag || "");
          console.log("Fetched Profile Data:", data);
        }

        if (error) {
          console.error("Error fetching user profile:", error.message);
          setError(error.message);
        }
      } else {
        // If no user is logged in, redirect to sign-in page
        navigate("/sign-in");
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [navigate]);

  const handleProfilePictureChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type (optional)
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      // Validate file size (optional, e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("File size exceeds 10MB.");
        return;
      }

      try {
        // Upload the image to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (error) throw error;

        // Get the public URL
        const { data: publicURL, error: urlError } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (urlError) throw urlError;

        const newAvatarURL = publicURL;
        console.log("Public URL:", publicURL);

        // Update the profile with the new avatar URL
        if (user) {
          const { error: updateError } = await supabase.from("profiles").upsert({
            id: user.id,
            avatar_url: newAvatarURL.publicUrl,
            updated_at: new Date(),
          });

          if (updateError) throw updateError;

          setProfilePicture(newAvatarURL);
          setSuccessMessage("Profile picture updated successfully!");
          console.log("Profile picture updated successfully");
        } else {
          setError("User not authenticated.");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error.message);
        setError(error.message);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsUpdating(true);

    if (!user) {
      setError("User not authenticated.");
      setIsUpdating(false);
      return;
    }

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        bio,
        social_media_tag: socialMediaTag,
        updated_at: new Date(),
      };

      // Only include avatar_url if it's been updated

      updates.avatar_url = profilePicture;

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      setSuccessMessage("Profile updated successfully!");
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    }

    setIsUpdating(false);
  };

  const handleCreateLessonClick = () => {
    navigate("/create-lesson");
  };

  const handleDeleteProfile = async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    try {
      // Delete profile from profiles table
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);
      if (error) throw error;

      // Note: Deleting users from auth.users requires using Supabase's Admin API
      // This operation should be performed securely on the backend
      // For this example, we'll just sign out the user

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to sign-in page
      navigate("/sign-in");
    } catch (error) {
      console.error("Error deleting profile:", error.message);
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6 mb-10">
          <h2 className="card-title text-3xl mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative w-32 h-32">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200"></div>
                )}
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 btn btn-sm btn-circle"
                >
                  <i className="fas fa-edit"></i>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                />
              </div>
              <div className="flex-1">
                <div className="form-control mb-2">
                  <label className="label" htmlFor="fullName">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Full Name"
                    className="input input-bordered"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="socialMediaTag">
                    <span className="label-text">Social Media Tag</span>
                  </label>
                  <input
                    type="text"
                    id="socialMediaTag"
                    placeholder="Social Media Tag"
                    className="input input-bordered"
                    value={socialMediaTag}
                    onChange={(e) => setSocialMediaTag(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-control mb-4">
              <label className="label" htmlFor="bio">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                id="bio"
                placeholder="Your bio"
                className="textarea textarea-bordered"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-between">
              <button
                className="btn btn-error btn-warning"
                type="button"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
              <div className="flex gap-4">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleCreateLessonClick}
                >
                  Create Lesson
                </button>
                <button className="btn btn-primary" type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}
