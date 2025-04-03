'use client'

import React, { useEffect, useRef, useState } from 'react'

interface SecureVideoPlayerProps {
  initialVideoUrl: string
  thumbnailUrl?: string
  lessonId: string
  onError?: (error: any) => void
}

/**
 * SecureVideoPlayer component that handles playback of secure videos
 * with automatic URL refreshing when URLs expire
 */
export default function SecureVideoPlayer({
  initialVideoUrl,
  thumbnailUrl,
  lessonId,
  onError
}: SecureVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Reference to store when the URL was last refreshed
  const lastRefreshRef = useRef<number>(Date.now())
  
  // Time before expiration to refresh the URL (5 minutes before expiration)
  const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // 5 minutes in milliseconds
  
  // Refresh timeout reference
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Refresh the video URL
  const refreshVideoUrl = async (videoPath?: string) => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Record the current time position for seamless playback resumption
      const currentTime = videoRef.current?.currentTime || 0
      
      const response = await fetch('/api/get-video-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoPath: videoPath,
          lessonId: lessonId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh video URL')
      }
      
      const data = await response.json()
      
      if (data.url) {
        // Update the URL state
        setVideoUrl(data.url)
        
        // Store the refresh time
        lastRefreshRef.current = Date.now()
        
        // Schedule the next refresh 25 minutes from now
        // (5 minutes before the 30-minute expiration)
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
        
        refreshTimeoutRef.current = setTimeout(() => {
          refreshVideoUrl()
        }, REFRESH_BEFORE_EXPIRY)
        
        // If video was playing, resume from the saved position
        if (videoRef.current) {
          // Restore playback position after the source changes
          const wasPlaying = !videoRef.current.paused
          videoRef.current.src = data.url
          videoRef.current.currentTime = currentTime
          
          if (wasPlaying) {
            videoRef.current.play().catch(playError => {
              console.error('Error resuming playback:', playError)
            })
          }
        }
      }
    } catch (err: any) {
      console.error('Error refreshing video URL:', err)
      setError(err.message || 'Failed to refresh video URL')
      if (onError) onError(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle video error event
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // Check if error is due to an expired URL (MEDIA_ERR_NETWORK or MEDIA_ERR_SRC_NOT_SUPPORTED)
    const videoElement = e.currentTarget
    
    if (videoElement.error?.code === MediaError.MEDIA_ERR_NETWORK ||
        videoElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      console.log('Video playback error, attempting to refresh URL')
      refreshVideoUrl()
    } else {
      console.error('Video playback error:', videoElement.error)
      setError('Error playing video. Please try again.')
      if (onError) onError(videoElement.error)
    }
  }
  
  // Set up initial refresh timer when component mounts
  useEffect(() => {
    // Clear any existing timeout when the component unmounts or URL changes
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [initialVideoUrl])
  
  // Set up initial refresh timer when video URL is set
  useEffect(() => {
    if (videoUrl) {
      // Schedule refresh for 25 minutes later (5 minutes before expiration)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshVideoUrl()
      }, REFRESH_BEFORE_EXPIRY)
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [videoUrl, lessonId])

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="bg-destructive text-white p-4 rounded-md max-w-md text-center">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => refreshVideoUrl()} 
              className="mt-2 px-4 py-2 bg-background text-foreground rounded hover:bg-muted"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        controls
        controlsList="nodownload"
        onError={handleVideoError}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
