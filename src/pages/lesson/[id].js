// src/pages/lesson/[id].js
import React, { useCallback, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LessonDetail from "../../components/LessonDetail";
import LessonRating from "../../components/LessonRating";
import LessonDiscussion from "../../components/LessonDiscussion";
import LessonTabs from "./components/LessonTabs";
import useLessonData from "./hooks/useLessonData";
import { ERROR_MESSAGES, TABS } from "./constants";

const LessonPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.CONTENT);
  const { lesson, creator, loading, hasAccess, error } = useLessonData(
    id,
    user,
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

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
          ? ERROR_MESSAGES.NO_ACCESS
          : `An error occurred: ${error}`}
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="prose text-center mt-10">{ERROR_MESSAGES.NOT_FOUND}</div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.CONTENT:
        return (
          <LessonDetail
            lesson={lesson}
            creator={creator}
            hasAccess={hasAccess}
            lessonId={id}
          />
        );
      case TABS.REVIEWS:
        return <LessonRating lessonId={id} />;
      case TABS.DISCUSSION:
        return hasAccess
          ? <LessonDiscussion lessonId={id} />
          : (
            <div className="prose text-center mt-10">
              {ERROR_MESSAGES.NEED_PURCHASE}
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="prose text-2xl md:text-3xl font-bold mb-6">
          {lesson.title}
        </h1>
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
            <LessonTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasAccess={hasAccess}
            />
          </aside>
          <div className="flex-grow" role="tabpanel" id={`${activeTab}-panel`}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;
