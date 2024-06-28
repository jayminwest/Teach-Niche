import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import supabase from "../../utils/supabaseClient";

export default function Profile() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [socialMediaTag, setSocialMediaTag] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("full_name, bio, profile_picture, social_media_tag")
          .eq("id", user.id)
          .single();

        if (data) {
          setName(data.full_name);
          setBio(data.bio);
          setProfilePicture(data.profile_picture);
          setSocialMediaTag(data.social_media_tag);
        }

        if (error) {
          console.error("Error fetching user profile:", error.message);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(URL.createObjectURL(e.target.files[0]));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const updates = {
        id: user.id,
        full_name: name,
        bio,
        profile_picture: profilePicture,
        social_media_tag: socialMediaTag,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("users").upsert(updates);

      if (error) {
        console.error("Error updating profile:", error.message);
      } else {
        console.log("Profile updated successfully");
      }
    }
  };

  const handleCreateLessonClick = () => {
    navigate("/create-lesson");
  };

  const handleDeleteProfile = async () => {
    console.log("Delete Button Pressed");
    // Add logic to delete the user's profile
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
                  className="absolute top-0 right-0 btn btn-sm btn-circle"
                >
                  <i className="fas fa-edit"></i>
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <div className="flex-1">
                <div className="form-control mb-2">
                  <label className="label" htmlFor="name">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Name"
                    className="input input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                <button className="btn btn-primary" type="submit">
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
