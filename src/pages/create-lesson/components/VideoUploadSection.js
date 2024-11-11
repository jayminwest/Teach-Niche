import React from 'react';
import { VIDEO_REQUIREMENTS } from '../constants';

const VideoUploadSection = ({ videoFile, onVideoChange, onVideoRemove, existingVideoId }) => {
  const isVideoRequired = !existingVideoId && !videoFile;

  return (
    <div className="pt-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Upload your video
        </label>
        <div className="relative group">
          <div className="cursor-help text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            Videos should be:
            <ul className="list-disc ml-4 mt-1">
              <li>Maximum {VIDEO_REQUIREMENTS.maxDuration} long</li>
              <li>{VIDEO_REQUIREMENTS.quality} quality</li>
              <li>{VIDEO_REQUIREMENTS.orientation}</li>
            </ul>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>
      <div className={`mt-1 rounded-lg border-2 ${videoFile ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'} px-6 py-4`}>
        <div className="text-center">
          {!videoFile ? (
            <>
              <label
                htmlFor="video"
                className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {existingVideoId ? 'Replace video' : 'Choose a video'}
                <input
                  id="video"
                  name="video"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={onVideoChange}
                  required={isVideoRequired}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                {existingVideoId 
                  ? 'Select a new video to replace the existing one'
                  : 'Select from your device or record a new video'}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-800">Video selected successfully!</span>
              </div>
              <div className="text-xs text-gray-600">
                <p className="font-medium">{videoFile.name}</p>
                <p>Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button
                onClick={onVideoRemove}
                className="inline-flex items-center px-3 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Remove video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadSection; 