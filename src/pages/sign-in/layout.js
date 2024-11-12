// src/pages/sign-in/layout.js
import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AlertMessage from "../../components/AlertMessage";
import useAuth from "../../hooks/useAuth";

const SignInLayout = () => {
  const { error, isSubmitting, handleGoogleAuth } = useAuth();

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to access your purchased lessons and continue learning"
    >
      <GoogleAuthButton
        onClick={handleGoogleAuth}
        isSubmitting={isSubmitting}
        mode="sign-in"
      />

      <AlertMessage error={error} />

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">New to TeachNiche?</p>
        <Link
          to="/sign-up"
          className="font-medium text-blue-600 hover:text-blue-500 mt-1 block"
          aria-label="Go to sign up page"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignInLayout;
