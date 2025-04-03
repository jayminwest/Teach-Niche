"use client";

import { useEffect, useState, useRef } from "react";
import { refreshVideoUrl } from "@/lib/video-utils";

interface VideoPlayerProps {
  initialVideoUrl: string;
  lessonId: string;
  title?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ initialVideoUrl, lessonId, title, autoPlay = false }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Track if we've already refreshed the URL to prevent infinite loops
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const refreshAttempts = useRef(0);
  
  // Refresh the URL when the component mounts
  useEffect(() => {
    // Reset refresh state when URL changes
    setHasRefreshed(false);
    refreshAttempts.current = 0;
    
    const refreshUrl = async () => {
      try {
        // Prevent infinite loops by limiting refresh attempts
        if (hasRefreshed || refreshAttempts.current > 2) {
          console.log("Skipping refresh - already refreshed or too many attempts");
          setIsLoading(false);
          return;
        }
        
        refreshAttempts.current += 1;
        setIsLoading(true);
        
        // Check if we have a valid URL to refresh
        if (!initialVideoUrl) {
          setError("No video URL provided");
          setIsLoading(false);
          return;
        }
        
        // If it's already a signed URL, use it directly
        if (initialVideoUrl.startsWith('http') && initialVideoUrl.includes('supabase')) {
          console.log("Using existing signed URL");
          setVideoUrl(initialVideoUrl);
          setHasRefreshed(true);
          setIsLoading(false);
          return;
        }
        
        console.log("Refreshing video URL:", initialVideoUrl);
        const freshUrl = await refreshVideoUrl(initialVideoUrl);
        
        if (freshUrl && freshUrl !== initialVideoUrl) {
          console.log("Using refreshed URL");
          setVideoUrl(freshUrl);
          setHasRefreshed(true);
        } else if (!freshUrl) {
          // If refreshVideoUrl returns falsy, try to get a fresh URL from the API
          console.log("No URL returned from refresh, trying API");
          await handleVideoError({} as any);
        } else {
          // If the URL didn't change, just use it
          console.log("URL unchanged after refresh");
          setVideoUrl(freshUrl);
          setHasRefreshed(true);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error refreshing video URL:", err);
        setError("Failed to load video. Please try again.");
        // Try the API-based refresh as a fallback
        await handleVideoError({} as any);
      } finally {
        setIsLoading(false);
      }
    };
    
    refreshUrl();
    
    // Set up a timer to refresh the URL every 25 days (before the 30-day expiration)
    const refreshInterval = setInterval(() => {
      setHasRefreshed(false); // Reset the refresh state
      refreshAttempts.current = 0;
      refreshUrl();
    }, 25 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [initialVideoUrl]);
  
  // Track API refresh attempts to prevent infinite loops
  const apiRefreshAttempts = useRef(0);
  
  // Handle video errors (which might occur if the URL expires)
  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // Prevent infinite loops by limiting API refresh attempts
    if (apiRefreshAttempts.current > 2) {
      console.log("Too many API refresh attempts, stopping");
      setError("Failed to load video after multiple attempts. Please try again later.");
      setIsLoading(false);
      return;
    }
    
    apiRefreshAttempts.current += 1;
    console.log("Video error occurred, attempting to refresh URL", e);
    
    try {
      setIsLoading(true);
      setError("Video playback error. Attempting to refresh...");
      
      // Extract video path from URL
      const extractedPath = extractVideoPathFromUrl(videoUrl || initialVideoUrl);
      console.log("Extracted video path:", extractedPath);
      
      // Try to get a fresh URL from the API
      const response = await fetch("/api/get-video-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoPath: extractedPath,
          lessonId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideoUrl(data.url);
        setError(null);
        
        // Reload the video with the new URL
        if (videoRef.current) {
          videoRef.current.load();
          if (autoPlay) {
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
          }
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to refresh video: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error refreshing video URL:", error);
      setError("Failed to refresh video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract video path from URL
  const extractVideoPathFromUrl = (url: string): string => {
    try {
      if (!url) return "";
      
      // Handle Supabase storage URLs
      if (url.includes('/videos/')) {
        const urlParts = url.split('/videos/');
        if (urlParts.length < 2) return "";
        
        const pathParts = urlParts[1].split('?');
        return pathParts[0];
      }
      
      // Handle direct file paths that might be in the format /lessons/{id}/{filename}
      if (url.includes('/lessons/')) {
        const pathParts = url.split('/lessons/');
        if (pathParts.length < 2) return "";
        
        // Extract the filename after the lesson ID
        const lessonParts = pathParts[1].split('/');
        if (lessonParts.length >= 2) {
          return lessonParts[1];
        } else {
          // If there's no second part, the URL might be in a different format
          // Just return the filename part after the last slash
          const parts = url.split('/');
          return parts[parts.length - 1];
        }
      }
      
      // If the URL contains the lesson ID as a prefix (common format in your DB)
      // Example: "4af4cd08-26b3-44be-9584-53bdd36e7e0c/1743721526247-cloud_bounce_lesson (1080p).mp4"
      if (url.includes(lessonId + '/')) {
        console.log("URL contains lesson ID prefix, using as is");
        return url;
      }
      
      // If it's just a filename, return it directly
      if (!url.includes('/')) {
        return url;
      }
      
      // Last resort: extract filename from the URL (anything after the last slash)
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && !lastPart.includes('?')) {
        return lastPart;
      } else if (lastPart) {
        // Remove query parameters if present
        return lastPart.split('?')[0];
      }
      
      return "";
    } catch (error) {
      console.error("Error extracting video path:", error);
      return "";
    }
  };

  // Function to fetch video path from lesson video_url if needed
  const fetchVideoPathFromLesson = async (): Promise<string | null> => {
    try {
      // Use the get-video-url API directly since we already have the lessonId
      const response = await fetch(`/api/get-video-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
        }),
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.url || null;
    } catch (error) {
      console.error("Error fetching video path from lesson:", error);
      return null;
    }
  };
  
  return (
    <div className="relative aspect-video bg-black rounded-md overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-4">
          <div className="text-white text-center">
            <p>{error}</p>
            <button 
              onClick={() => handleVideoError({} as any)} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        controls
        playsInline
        onError={handleVideoError}
        title={title}
        onLoadedData={() => setIsLoading(false)}
        autoPlay={autoPlay}
      />
    </div>
  );
}
