import { useState, useEffect } from "react";
import supabase from "../../../utils/supabaseClient";

const useProfileData = (userId) => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    bio: "",
    profilePicture: null,
    socialMediaTag: "",
    stripe_account_id: null,
    stripe_onboarding_complete: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data: existingProfile, error: queryError } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        throw queryError;
      }

      if (existingProfile) {
        setProfileData({
          fullName: existingProfile.full_name || '',
          email: existingProfile.email || '',
          bio: existingProfile.bio || '',
          profilePicture: existingProfile.avatar_url || '',
          socialMediaTag: existingProfile.social_media_tag || '',
          stripe_account_id: existingProfile.stripe_account_id,
          stripe_onboarding_complete: existingProfile.stripe_onboarding_complete,
        });
      } else {
        await createNewProfile(userId);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async (userId) => {
    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: '',
          email: '',
          bio: '',
          avatar_url: '',
          social_media_tag: '',
          updated_at: new Date(),
        }]);

      if (insertError) throw insertError;

      setProfileData({
        fullName: '',
        email: '',
        bio: '',
        profilePicture: '',
        socialMediaTag: '',
        stripe_account_id: null,
        stripe_onboarding_complete: false,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const updateProfile = async (updatedData) => {
    setError(null);
    setSuccessMessage("");

    try {
      const updates = {
        id: userId,
        full_name: updatedData.fullName,
        bio: updatedData.bio,
        social_media_tag: updatedData.socialMediaTag,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      setSuccessMessage("Profile updated successfully!");
      setProfileData(prev => ({
        ...prev,
        ...updatedData
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteProfile = async () => {
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  return {
    profileData,
    loading,
    error,
    successMessage,
    updateProfile,
    deleteProfile,
    setError,
    setSuccessMessage,
  };
};

export default useProfileData; 