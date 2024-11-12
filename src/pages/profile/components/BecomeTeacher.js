import React from "react";
import ConnectStripeButton from "../../../components/ConnectStripeButton";

/**
 * BecomeTeacher Component
 *
 * Displays the teacher onboarding section with Stripe connection.
 *
 * @param {Object} props
 * @param {boolean} props.isStripeConnected - Whether Stripe is connected
 * @param {Function} props.onStripeConnect - Function to handle Stripe connection
 * @param {Function} props.onStripeConnected - Callback when Stripe is connected
 * @returns {JSX.Element} The Become Teacher component
 */
const BecomeTeacher = ({
  isStripeConnected,
  onStripeConnect,
  onStripeConnected,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="card-title text-3xl mb-6">Become A Teacher</h2>
      <p className="mb-6">
        To start creating and selling lessons, you need to connect your Stripe
        account.
      </p>

      <div className="space-y-6">
        <div className="alert alert-warning p-4 flex flex-col items-start">
          <div className="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              {isStripeConnected
                ? "Stripe account connected"
                : "Connect Stripe to receive payments"}
            </span>
          </div>
          <ConnectStripeButton
            onConnect={onStripeConnect}
            className="btn btn-sm btn-primary w-full mt-2"
          />
        </div>

        {isStripeConnected && (
          <div className="mt-6">
            <p className="text-green-500 mb-4">
              Congratulations! You're now ready to create lessons.
            </p>
            <button
              className="btn btn-success"
              onClick={onStripeConnected}
            >
              Start Creating Lessons
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          What you can do as a teacher:
        </h3>
        <ul className="space-y-3 list-disc pl-5">
          <li>Create and sell your own lessons</li>
          <li>Set your own prices</li>
          <li>Build your teaching portfolio</li>
          <li>Reach students worldwide</li>
          <li>Earn money sharing your expertise</li>
        </ul>
      </div>

      <div className="alert alert-info mt-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-semibold">Platform Fee:</p>
          <p>Teach Niche takes a 15% platform fee on each lesson sold.</p>
        </div>
      </div>
    </div>
  );
};

export default BecomeTeacher;
