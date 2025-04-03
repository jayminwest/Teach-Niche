import { createServerClient } from "./server";

/**
 * Refreshes a video URL on the server side if it's expired
 * @param videoUrl The current video URL
 * @returns A fresh signed URL or the original URL if it's still valid
 */
export async function refreshVideoUrlServer(videoUrl: string): Promise<string> {
  const supabase = await createServerClient();
  
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
    
    // Create a new signed URL
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(videoPath, 604800); // 7 days
    
    if (error || !data.signedUrl) {
      console.error('Error refreshing video URL:', error);
      return videoUrl;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error parsing video URL:', error);
    return videoUrl;
  }
}
