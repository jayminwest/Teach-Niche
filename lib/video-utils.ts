import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Refreshes a video URL if it's expired
 * @param videoUrl The current video URL
 * @returns A fresh signed URL or the original URL if it's still valid
 */
export async function refreshVideoUrl(videoUrl: string): Promise<string> {
  const supabase = createClientComponentClient();
  
  // Check if this is a signed URL from our videos bucket
  if (!videoUrl || !videoUrl.includes('/storage/v1/object/sign/videos/')) {
    return videoUrl;
  }
  
  try {
    // Extract the path from the URL
    // Format: /storage/v1/object/sign/videos/USER_ID/FILENAME
    const urlParts = videoUrl.split('/videos/');
    if (urlParts.length < 2) return videoUrl;
    
    const pathParts = urlParts[1].split('?');
    const videoPath = pathParts[0];
    
    // Create a new signed URL with error handling
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoPath, 2592000); // 30 days
      
      if (error) {
        console.error('Error refreshing video URL:', error);
        return videoUrl;
      }
      
      if (!data || !data.signedUrl) {
        console.error('No signed URL returned');
        return videoUrl;
      }
      
      return data.signedUrl;
    } catch (signError) {
      console.error('Error creating signed URL:', signError);
      return videoUrl;
    }
  } catch (error) {
    console.error('Error parsing video URL:', error);
    return videoUrl;
  }
}
