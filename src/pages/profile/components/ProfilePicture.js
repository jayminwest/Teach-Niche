import React from "react";
import supabase from "../../../utils/supabaseClient";

/**
 * ProfilePicture Component
 *
 * Renders a profile picture with an option to upload a new one.
 *
 * @param {Object} props
 * @param {string} props.profilePicture - The current profile picture URL.
 * @param {Function} props.onUpdate - Function to handle profile picture updates.
 * @returns {JSX.Element} The Profile Picture component.
 */
const ProfilePicture = ({ profilePicture, onUpdate }) => {
  const handleProfilePictureChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (error) throw error;

        const { data: publicURL } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(filePath);

        console.log("Uploaded file public URL:", publicURL.publicUrl);
        onUpdate(publicURL.publicUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error.message);
      }
    }
  };

  const handleImageError = () => {
    console.error("Error loading image:", profilePicture);
  };

  return (
    <div className="avatar relative">
      <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            onError={handleImageError}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="bg-neutral-focus text-neutral-content rounded-full w-32 h-32 flex items-center justify-center">
            <span className="text-3xl">?</span>
          </div>
        )}
      </div>
      <label
        htmlFor="profilePicture"
        className="btn btn-circle btn-sm absolute bottom-0 right-0 bg-base-100"
        aria-label="Change profile picture"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </label>
      <input
        type="file"
        id="profilePicture"
        className="hidden"
        onChange={handleProfilePictureChange}
        accept="image/*"
      />
    </div>
  );
};

export default ProfilePicture;
