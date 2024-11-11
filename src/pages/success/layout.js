// src/pages/success.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../utils/supabaseClient";

/**
 * SuccessPage Component
 *
 * Renders the page displayed after a successful purchase.
 *
 * @returns {JSX.Element} The Success Page.
 */
const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!sessionId) {
        setError("No session ID found");
        return;
      }

      try {
        // Add retry logic
        let attempts = 0;
        const maxAttempts = 5;
        let purchase = null;

        while (attempts < maxAttempts) {
          const { data, error } = await supabase
            .from("purchases")
            .select("tutorial_id, status")
            .eq("stripe_session_id", sessionId)
            .maybeSingle(); // Use maybeSingle instead of single

          if (error) {
            console.error("Query error:", error);
            attempts++;
            if (attempts === maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
            continue;
          }

          if (data) {
            purchase = data;
            break;
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (!purchase) {
          throw new Error("Purchase not found after multiple attempts");
        }

        if (purchase.status !== "completed") {
          throw new Error("Purchase not completed");
        }

        // Redirect to the lesson page after short delay
        setTimeout(() => {
          navigate(`/lesson/${purchase.tutorial_id}`);
        }, 2000);
      } catch (err) {
        console.error("Error verifying purchase:", err);
        setError(
          "Purchase verification is taking longer than expected. Please check your email for confirmation or contact support."
        );
      }
    };

    verifyPurchase();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-6">
          {error ? (
            <div className="text-center text-red-600">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p>{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Purchase Successful!
              </h2>
              <p className="text-gray-600">
                Redirecting you to your lesson...
              </p>
              <div className="mt-4">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuccessPage;
