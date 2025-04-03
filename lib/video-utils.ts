import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Refreshes a video URL if it's expired or creates a signed URL if given a path
 * @param videoUrl The current video URL or path
 * @returns A fresh signed URL or the original URL if it's still valid
 */
export async function refreshVideoUrl(videoUrl: string): Promise<string> {
  const supabase = createClientComponentClient();
  
  // If no URL provided, return as is
  if (!videoUrl) {
    return videoUrl;
  }
  
  // If it's already a signed URL from our videos bucket
  if (videoUrl.includes('/storage/v1/object/sign/videos/')) {
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
  // If it's not a signed URL but a direct path (not starting with http)
  else if (!videoUrl.startsWith('http')) {
    try {
      console.log('Creating signed URL for path:', videoUrl);
      
      // Create a new signed URL with error handling
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoUrl, 2592000); // 30 days
      
      if (error) {
        console.error('Error creating signed URL for path:', error);
        return videoUrl;
      }
      
      if (!data || !data.signedUrl) {
        console.error('No signed URL returned for path');
        return videoUrl;
      }
      
      console.log('Created signed URL:', data.signedUrl);
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL for path:', error);
      return videoUrl;
    }
  }
  
  // For any other URL format, return as is
  return videoUrl;
}
