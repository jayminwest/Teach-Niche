import React from 'react';
import supabase from '../../../utils/supabaseClient';

export default function ProfilePicture({ profilePicture, onUpdate }) {
  const handleProfilePictureChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (error) throw error;

        const { data: publicURL } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath);

        onUpdate(publicURL.publicUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error.message);
      }
    }
  };

  return (
    <div className="avatar">
      <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" />
        ) : (
          <div className="bg-neutral-focus text-neutral-content rounded-full w-32 h-32">
            <span className="text-3xl">?</span>
          </div>
        )}
      </div>
      <label htmlFor="profilePicture" className="btn btn-circle btn-sm absolute bottom-0 right-0">
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
  );
}