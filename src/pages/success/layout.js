// src/pages/success.js
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AlertMessage from "../../components/AlertMessage";

/**
 * SuccessPage Component
 *
 * Renders the page displayed after a successful purchase.
 *
 * @returns {JSX.Element} The Success Page.
 */
const SuccessPage = () => {
  const location = useLocation();
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      const queryParams = new URLSearchParams(location.search);
      const sessionId = queryParams.get("session_id");

      if (!sessionId) {
        setError("No session ID found.");
        return;
      }

      try {
        const response = await fetch(
          `/api/get-purchase?session_id=${sessionId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPurchaseDetails(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching purchase details:", err);
      }
    };

    fetchPurchaseDetails();
  }, [location.search]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col justify-center items-center py-10">
        <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Purchase Successful!</h2>
          <p className="mb-6">
            Thank you for your purchase. Your lesson has been added to your
            profile.
          </p>
          {purchaseDetails && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Purchase Details:</h3>
              <p>Lesson: {purchaseDetails.lessonTitle}</p>
              <p>Price: ${purchaseDetails.price}</p>
              <p>Purchase Date: {new Date(purchaseDetails.purchaseDate).toLocaleDateString()}</p>
            </div>
          )}
          <Link to="/my-purchases" className="btn btn-primary">
            View My Purchases
          </Link>
        </div>
        <AlertMessage error={error} />
      </main>
      <Footer />
    </div>
  );
};

export default SuccessPage;
