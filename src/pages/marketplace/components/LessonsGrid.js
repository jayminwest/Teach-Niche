import React from "react";

import LessonCard from "./LessonCard";

export default function LessonsGrid() {
  const lessons = [
    {
      title: "Lesson 1",
      teacher: "Teacher 1",
      price: "$10",
      description: "This is the first lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lesson 2",
      teacher: "Teacher 2",
      price: "$15",
      description: "This is the second lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lesson 3",
      teacher: "Teacher 3",
      price: "$20",
      description: "This is the third lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lesson 4",
      teacher: "Teacher 4",
      price: "$25",
      description: "This is the fourth lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lesson 5",
      teacher: "Teacher 5",
      price: "$25",
      description: "This is the fourth lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Lesson 6",
      teacher: "Teacher 6",
      price: "$25",
      description: "This is the fourth lesson",
      imageUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    // Add more cards as needed
  ];

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20 p-4 mx-auto justify-items-center">
        {lessons.map((lesson, index) => (
          <LessonCard key={index} {...lesson} />
        ))}
      </div>
    </div>
  );
}
