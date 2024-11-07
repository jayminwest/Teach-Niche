import React, { useState, useEffect } from "react";
import LessonsGrid from "../pages/marketplace/components/LessonsGrid";
import supabase from "../utils/supabaseClient";

/**
 * FeaturedLessons Component
 *
 * Displays a section of manually selected featured lessons from the marketplace.
 * Uses a dark background to make the section stand out.
 *
 * @returns {JSX.Element} The featured lessons section.
 */
const FeaturedLessons = () => {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: lessons } = await supabase
        .from('tutorials')
        .select('id');
      
      const { data: students } = await supabase
        .from('purchases')
        .select('user_id', { count: 'exact', distinct: true });

      setStats({
        totalLessons: lessons?.length || 0,
        totalStudents: students?.length || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <section
      className="py-10 md:py-16 bg-neutral relative overflow-hidden"
      aria-labelledby="featured-lessons-heading"
    >
      <div className="container mx-auto px-4">
        {/* Featured Lessons Header */}
        <div className="text-center text-white mb-4">
          <h2
            id="featured-lessons-heading"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            Featured Lessons
          </h2>
          <p className="text-lg sm:text-2xl mb-2 opacity-90">
            Find lessons from your favorite players.
          </p>
        </div>

        {/* Stats Section - Smaller and under header */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center text-white">
            <p className="text-2xl font-semibold mb-1">{stats.totalLessons}</p>
            <p className="text-sm opacity-75">Lessons</p>
          </div>
          <div className="text-center text-white">
            <p className="text-2xl font-semibold mb-1">{stats.totalStudents}</p>
            <p className="text-sm opacity-75">Students</p>
          </div>
        </div>

        {/* Featured Lessons Grid */}
        <div className="relative z-10">
          <LessonsGrid 
            isFeatured={true}  // New prop to filter featured lessons
            limit={6}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedLessons;
