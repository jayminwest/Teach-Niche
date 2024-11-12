import React from "react";
import { Link } from "react-router-dom";

/**
 * SignInRequired Component
 * Displays a message and call-to-action when user authentication is required
 *
 * @returns {JSX.Element}
 */
const SignInRequired = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Sign In Required
        </h1>
        <p className="text-gray-600">
          Please sign in to view your purchased lessons.
        </p>
        <Link
          to="/auth/signin"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignInRequired;
