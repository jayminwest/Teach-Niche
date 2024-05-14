import React from "react";

export default function LessonCard({ title, teacher, price, description, imageUrl }) {
  return (
    <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden">
      {/* Ensuring the image container has a fixed height */}
      <figure className="h-48 overflow-hidden">
        {/* Image standardized to cover the area of the figure, maintaining aspect ratio */}
        <img src={imageUrl} alt="Lesson" className="w-full h-full object-cover"/>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{teacher}</p>
        <p>{price}</p>
        <p>{description}</p>
        <button className="btn btn-primary">Learn More</button>
      </div>
    </div>
  );
}
