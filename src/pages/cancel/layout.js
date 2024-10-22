// src/pages/cancel.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * CancelPage Component
 *
 * Renders the page displayed when a purchase is canceled.
 *
 * @returns {JSX.Element} The Cancel Page.
 */
const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Purchase Canceled</h2>
          <p className="mb-6">
            Your purchase was canceled. You can try purchasing again from the
            marketplace.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/marketplace")}
          >
            Return to Marketplace
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelPage;
