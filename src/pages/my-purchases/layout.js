// src/pages/my-purchases/layout.js
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import MyPurchasesPage from "./components/MyPurchasesPage";
import SignInRequired from "./components/SignInRequired";
import { useAuth } from "../../context/AuthContext";

/**
 * MyPurchasesLayout Component
 * Main layout wrapper for the purchases page that handles authentication state
 * and provides consistent layout structure.
 *
 * @returns {JSX.Element} The My Purchases layout wrapper
 */
const MyPurchasesLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {user ? <MyPurchasesPage /> : <SignInRequired />}
      </main>
    </div>
  );
};

export default MyPurchasesLayout;
