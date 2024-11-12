import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleAuthButton = ({ onClick, isSubmitting, mode = "sign-in" }) => {
  return (
    <button
      className="w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onClick}
      disabled={isSubmitting}
      aria-label={`${mode === "sign-in" ? "Sign in" : "Sign up"} with Google`}
    >
      <FcGoogle className="mr-3" size={24} />
      <span className="text-gray-700 font-medium text-lg">
        {isSubmitting ? "Processing..." : `Continue with Google`}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
