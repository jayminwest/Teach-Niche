// src/pages/success.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  // Add state for purchase details and errors
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [error, setError] = useState(null);

  // Fetch purchase details using sessionId
  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      if (!sessionId) {
        setError("No session ID found.");
        console.error("No session ID found in URL.");
        return;
      }

      try {
        // Replace with your actual API endpoint to fetch purchase details
        const response = await fetch(
          `/api/get-purchase?session_id=${sessionId}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPurchaseDetails(data);
        console.log("Purchase Details:", data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching purchase details:", err);
      }
    };

    fetchPurchaseDetails();
  }, [sessionId]);

  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen py-10">
        <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Purchase Successful!</h2>
          <p>
            Thank you for your purchase. Your lesson has been added to your
            profile.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SuccessPage;
