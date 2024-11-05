// src/components/LessonDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchLessonDetails();
  }, [id, user]);

  const fetchLessonDetails = async () => {
    try {
      if (!user) {
        navigate('/sign-in');
        return;
      }

      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('tutorials')
        .select(`
          *,
          creator:creator_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (lessonError) throw lessonError;
      if (!lessonData) throw new Error('Lesson not found');

      setLesson(lessonData);
      setIsCreator(lessonData.creator_id === user.id);

      // Check if user has purchased this lesson
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('tutorial_id', id)
        .single();

      if (purchaseError && purchaseError.code !== 'PGRST116') {
        throw purchaseError;
      }

      // Set hasPurchased to true if the lesson is free, user is creator, or has purchased
      setHasPurchased(
        lessonData.price === 0 || 
        lessonData.creator_id === user.id || 
        !!purchaseData
      );

    } catch (error) {
      console.error('Error fetching lesson details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="alert alert-error">
        <p>Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
        
        {!hasPurchased ? (
          <div className="mb-8">
            <p className="mb-4">
              Price: ${lesson.price}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/checkout/${id}`)}
            >
              Purchase Lesson
            </button>
          </div>
        ) : (
          <div className="w-full h-auto mb-8">
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${lesson.vimeo_video_id}`}
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          </div>
        )}

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            className="markdown-content"
          >
            {lesson.description}
          </ReactMarkdown>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Content</h2>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            className="markdown-content"
            components={{
              // Custom components for markdown elements
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
              p: ({node, ...props}) => <p className="my-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
              code: ({node, inline, ...props}) => (
                inline 
                  ? <code className="bg-base-200 px-1 rounded" {...props} />
                  : <code className="block bg-base-200 p-4 rounded-lg my-2 overflow-x-auto" {...props} />
              ),
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>

        {lesson.creator && (
          <div className="mt-8 p-4 bg-base-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Created by</h3>
            <div className="flex items-center">
              {lesson.creator.avatar_url && (
                <img
                  src={lesson.creator.avatar_url}
                  alt={lesson.creator.full_name}
                  className="w-12 h-12 rounded-full mr-4"
                />
              )}
              <span className="text-lg">{lesson.creator.full_name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
