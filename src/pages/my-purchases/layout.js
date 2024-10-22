// src/pages/my-purchases/layout.js
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LessonsGrid from "../marketplace/components/LessonsGrid";
import { useAuth } from "../../context/AuthContext";

/**
 * MyPurchasesLayout Component
 *
 * Renders the page displaying the user's purchased lessons.
 *
 * @returns {JSX.Element} The My Purchases page.
 */
const MyPurchasesLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <p className="text-center">
            Please <a href="/sign-in" className="text-blue-500 hover:underline">sign in</a>{" "}
            to view your purchased lessons.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Purchased Lessons</h1>
        <LessonsGrid showPurchasedOnly />
      </main>
      <Footer />
    </div>
  );
};

export default MyPurchasesLayout;
