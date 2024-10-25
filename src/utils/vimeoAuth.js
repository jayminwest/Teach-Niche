import supabase from "./supabaseClient";

export const refreshVimeoToken = async (userId) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "refresh-vimeo-token",
      {
        body: JSON.stringify({ userId }),
      },
    );

    if (error) throw error;

    if (data.access_token) {
      await supabase
        .from("profiles")
        .update({ vimeo_access_token: data.access_token })
        .eq("id", userId);

      return data.access_token;
    }
  } catch (error) {
    console.error("Error refreshing Vimeo token:", error);
    throw error;
  }
};

export const disconnectVimeoAccount = async (userId) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ vimeo_access_token: null })
      .eq("id", userId);

    if (error) throw error;

    // Optionally, revoke the token on Vimeo's side
    // This would require an additional Edge Function to make the API call to Vimeo

    return true;
  } catch (error) {
    console.error("Error disconnecting Vimeo account:", error);
    throw error;
  }
};
