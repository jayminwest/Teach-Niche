import React, { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";

const MarketplaceStats = () => {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: lessons } = await supabase
        .from("tutorials")
        .select("id");

      const { data: students } = await supabase
        .from("purchases")
        .select("user_id", { count: "exact", distinct: true });

      setStats({
        totalLessons: lessons?.length || 0,
        totalStudents: students?.length || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex justify-center gap-12">
        <div className="text-center">
          <p className="text-xl font-semibold">{stats.totalLessons}</p>
          <p className="text-sm text-gray-600">Lessons</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold">{stats.totalStudents}</p>
          <p className="text-sm text-gray-600">Students</p>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStats;
