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
  
  // Refresh the URL when the component mounts
  useEffect(() => {
    const refreshUrl = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a valid URL to refresh
        if (!initialVideoUrl) {
          setError("No video URL provided");
          setIsLoading(false);
          return;
        }
        
        console.log("Refreshing video URL:", initialVideoUrl);
        const freshUrl = await refreshVideoUrl(initialVideoUrl);
        console.log("Refreshed URL:", freshUrl);
        
        if (freshUrl) {
          setVideoUrl(freshUrl);
        } else {
          // If refreshVideoUrl returns falsy, try to get a fresh URL from the API
          await handleVideoError({} as any);
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
    const refreshInterval = setInterval(refreshUrl, 25 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [initialVideoUrl]);
  
  // Handle video errors (which might occur if the URL expires)
  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log("Video error occurred, attempting to refresh URL", e);
    try {
      setIsLoading(true);
      setError("Video playback error. Attempting to refresh...");
      
      // Extract video path from URL or fetch from lesson metadata
      const extractedPath = extractVideoPathFromUrl(videoUrl);
      let videoPath = extractedPath;
      
      // If we couldn't extract a path, try to fetch it from the lesson metadata
      if (!videoPath) {
        videoPath = await fetchVideoPathFromLesson();
      }
      
      // Try to get a fresh URL from the API
      const response = await fetch("/api/get-video-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoPath,
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
      if (!url || !url.includes('/videos/')) return "";
      
      const urlParts = url.split('/videos/');
      if (urlParts.length < 2) return "";
      
      const pathParts = urlParts[1].split('?');
      return pathParts[0];
    } catch (error) {
      console.error("Error extracting video path:", error);
      return "";
    }
  };

  // Function to fetch video path from lesson video_url if needed
  const fetchVideoPathFromLesson = async (): Promise<string | null> => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/video-url`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.videoPath || null;
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
