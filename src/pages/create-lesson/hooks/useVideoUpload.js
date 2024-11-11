import { useState } from 'react';
import supabase from '../../../utils/supabaseClient';

const useVideoUpload = () => {
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const uploadVideo = async (videoFile, lessonId, title, description) => {
    if (!videoFile) return null;

    try {
      setIsUploading(true);
      setUploadStatus('Preparing video upload...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const initFormData = new FormData();
      initFormData.append('title', title);
      initFormData.append('description', description);
      initFormData.append('fileSize', videoFile.size.toString());
      initFormData.append('fileName', videoFile.name);
      if (lessonId) {
        initFormData.append('lessonId', lessonId);
      }

      const initResponse = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/upload-vimeo-video/initialize`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: initFormData,
        }
      );

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize video upload');
      }

      const { 
        upload_link, 
        vimeo_video_id,
        vimeo_url,
        chunk_size, 
        access_token 
      } = await initResponse.json();

      // Upload video in chunks
      const totalSize = videoFile.size;
      let uploadedBytes = 0;
      
      while (uploadedBytes < totalSize) {
        const chunk = videoFile.slice(uploadedBytes, uploadedBytes + chunk_size);
        
        const chunkResponse = await fetch(upload_link, {
          method: 'PATCH',
          headers: {
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': uploadedBytes.toString(),
            'Content-Type': 'application/offset+octet-stream',
            'Authorization': `Bearer ${access_token}`,
          },
          body: chunk,
        });

        if (!chunkResponse.ok) {
          throw new Error(`Failed to upload chunk at offset ${uploadedBytes}`);
        }

        uploadedBytes = parseInt(chunkResponse.headers.get('Upload-Offset') || '0');
        const progress = (uploadedBytes / totalSize) * 100;
        setVideoUploadProgress(Math.round(progress));
        setUploadStatus(`Uploading: ${Math.round(progress)}%`);
      }

      setUploadStatus('Upload complete! Processing...');
      
      return {
        vimeo_video_id,
        vimeo_url
      };

    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVideo,
    videoUploadProgress,
    uploadStatus,
    isUploading,
    setVideoUploadProgress,
    setUploadStatus,
    setIsUploading
  };
};

export default useVideoUpload; 