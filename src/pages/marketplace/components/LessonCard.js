// src/pages/marketplace/components/LessonCard.js
import React, { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";

export default function LessonCard({ id, title, creator_id, price, description, content_url }) {
  const [creatorName, setCreatorName] = useState("");

  useEffect(() => {
    const fetchCreatorName = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", creator_id)
        .single();

      if (error) {
        console.error("Error fetching creator name:", error.message);
      } else {
        setCreatorName(data.full_name || "Unknown");
      }
    };

    fetchCreatorName();
  }, [creator_id]);

  const handlePurchase = async () => {
    // Implement purchase logic here
    // This can include calling your create-checkout-session function
    // and redirecting the user to Stripe Checkout
    // For example:
    try {
      const response = await fetch('https://your-supabase-url/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error creating checkout session:", data.error);
        // Optionally, display error to the user
      } else {
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error("Error:", error.message);
      // Optionally, display error to the user
    }
  };

  return (
    <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden">
      {/* Image Container */}
      <figure className="h-48 overflow-hidden">
        <img src={content_url} alt="Lesson" className="w-full h-full object-cover"/>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>Teacher: {creatorName}</p>
        <p>Price: ${price}</p>
        <p>{description}</p>
        <button className="btn btn-primary" onClick={handlePurchase}>Purchase Lesson</button>
      </div>
    </div>
  );
}
