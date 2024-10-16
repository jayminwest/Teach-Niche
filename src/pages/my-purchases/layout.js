// src/pages/my-purchases/layout.js
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "../marketplace/components/LessonsGrid";
import { useAuth } from "../../context/AuthContext";

export default function MyPurchasesLayout() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>
          Please <a href="/sign-in" className="text-blue-500">sign in</a>{" "}
          to view your purchased lessons.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container p-4 mx-auto">
        <h2 className="text-2xl font-bold mb-4">My Purchased Lessons</h2>
        <LessonsGrid showPurchasedOnly />
      </div>
      <Footer />
    </div>
  );
}
