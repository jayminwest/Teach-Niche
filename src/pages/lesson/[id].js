// src/pages/lesson/[id].js
import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import LessonDetail from "../../components/LessonDetail";
import LessonRating from "../../components/LessonRating";
import LessonDiscussion from "../../components/LessonDiscussion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * LessonPage Component
 *
 * Renders the lesson detail page for a specific lesson.
 *
 * @returns {JSX.Element} The Lesson Detail page.
 */
const LessonPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchLessonAndAccess = async () => {
      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from("tutorials")
          .select("*")
          .eq("id", id)
          .single();

        if (lessonError) throw lessonError;

        setLesson(lessonData);

        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", lessonData.creator_id)
          .maybeSingle();

        if (creatorError) throw creatorError;

        setCreator(creatorData);

        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("tutorial_id", id)
            .single();

          if (purchaseError && purchaseError.code !== "PGRST116") {
            throw purchaseError;
          }

          setHasAccess(!!purchaseData);
        }
      } catch (err) {
        console.error("Error in fetchLessonAndAccess:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndAccess();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="prose">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prose text-center mt-10 text-red-500 px-4">
        {error === "PGRST116: No rows found"
          ? "You do not have access to this lesson. Please purchase it first."
          : `An error occurred: ${error}`}
      </div>
    );
  }

  if (!lesson) {
    return <div className="prose text-center mt-10">Lesson not found.</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <LessonDetail
            lesson={lesson}
            creator={creator}
            hasAccess={hasAccess}
            lessonId={id}
          />
        );
      case "reviews":
        return <LessonRating lessonId={id} />;
      case "discussion":
        return hasAccess
          ? <LessonDiscussion lessonId={id} />
          : (
            <div className="prose text-center mt-10">
              Please purchase this lesson to access the discussion.
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="prose text-2xl md:text-3xl font-bold mb-6">{lesson.title}</h1>
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
            <nav className="bg-base-200 rounded-lg p-4">
              <ul className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
                {["content", "reviews", "discussion"].map((tab) => (
                  <li key={tab} className="flex-shrink-0">
                    {(tab !== "discussion" || hasAccess) && (
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left py-2 px-4 rounded text-sm md:text-base ${
                          activeTab === tab
                            ? "bg-primary text-white"
                            : "hover:bg-base-300"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <div className="flex-grow">
            {renderContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonPage;
