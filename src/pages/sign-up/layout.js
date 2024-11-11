// src/pages/sign-up/layout.js
import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AlertMessage from "../../components/AlertMessage";
import useAuth from "../../hooks/useAuth";

const SignUpLayout = () => {
  const { error, isSubmitting, handleGoogleAuth } = useAuth();

  return (
    <AuthLayout
      title="Join TeachNiche"
      subtitle="Share your skills or learn from others in the dama community"
    >
      <GoogleAuthButton
        onClick={handleGoogleAuth}
        isSubmitting={isSubmitting}
        mode="sign-up"
      />

      <AlertMessage error={error} />
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">Already have an account?</p>
        <Link 
          to="/sign-in" 
          className="font-medium text-blue-600 hover:text-blue-500 mt-1 block"
          aria-label="Go to sign in page"
        >
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignUpLayout;
