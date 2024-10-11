import React, { useState, useEffect } from "react";
import LessonCard from "./LessonCard";
import supabase from "../../../utils/supabaseClient";

export default function LessonsGrid() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*');

      if (error) {
        console.error("Error fetching lessons:", error);
      } else {
        setLessons(data);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20 p-4 mx-auto justify-items-center">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
}
